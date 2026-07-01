import axios from "axios";
import crypto from "crypto";
import { queryGet, queryRun, queryAll } from "../db/database";
import { getPanelConfig } from "./pterodactylService";

export interface ProvisioningJob {
  id: string;
  serviceId: string;
  status: "Queued" | "Provisioning" | "Completed" | "Failed";
  errorLog?: string;
  createdAt: string;
  updatedAt: string;
}

const getAppHeaders = (config: any) => ({
  "Authorization": `Bearer ${config.appKey}`,
  "Content-Type": "application/json",
  "Accept": "application/json"
});

/**
 * Enqueue a new service provisioning task and start processing it asynchronously.
 */
export const enqueueProvisioningJob = async (serviceId: string): Promise<string> => {
  const jobId = "JOB-" + crypto.randomUUID();
  await queryRun(
    `INSERT INTO provisioning_jobs (id, serviceId, status) VALUES (?, ?, 'Queued')`,
    [jobId, serviceId]
  );
  
  // Set service status to Queued
  await queryRun(
    `UPDATE services SET status = 'Queued', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    [serviceId]
  );

  // Run in background without blocking the HTTP request
  processProvisioningJob(jobId).catch((err) => {
    console.error(`Unhandled provisioning worker error for job ${jobId}:`, err);
  });

  return jobId;
};

/**
 * The main worker function that executes the server build pipeline on Pterodactyl.
 */
export const processProvisioningJob = async (jobId: string): Promise<void> => {
  console.log(`[Worker] Starting provisioning pipeline for job ${jobId}...`);
  
  await queryRun(
    `UPDATE provisioning_jobs SET status = 'Provisioning', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    [jobId]
  );

  const job = await queryGet<ProvisioningJob>(
    `SELECT * FROM provisioning_jobs WHERE id = ?`,
    [jobId]
  );

  if (!job) {
    console.error(`[Worker] Job ${jobId} not found in database.`);
    return;
  }

  // Set service status to Provisioning
  await queryRun(
    `UPDATE services SET status = 'Provisioning', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    [job.serviceId]
  );

  try {
    // 1. Fetch service details & client information
    const service = await queryGet<any>(
      `SELECT s.*, u.email, u.username FROM services s
       INNER JOIN users u ON s.userId = u.id
       WHERE s.id = ?`,
      [job.serviceId]
    );

    if (!service) {
      throw new Error(`Service ${job.serviceId} or owner profile not found.`);
    }

    // 2. Load panel credentials
    const panelConfig = await getPanelConfig();
    if (!panelConfig.url || !panelConfig.appKey) {
      throw new Error("Pterodactyl Node settings are not configured or incomplete.");
    }

    // 3. Resolve plan configurations from database
    // The plan mapping holds the Nest ID, Egg ID, Location ID, Docker image, environment variables, resource limits.
    // Try to load plan metadata from Firestore 'plans' mock or local settings.
    // In our backend, plans are stored in Firestore collection 'plans'. Expose dynamic query.
    // We can import firestore collection read from clientDb
    // Let's import firebase collection and read the plan config!
    // But since server.ts initializes clientDb, we can query it using client SDK or direct HTTP request.
    // Fetching the plan list from http://localhost:3000/api/plans is extremely simple and self-contained!
    const plansRes = await axios.get(`http://localhost:3000/api/plans`);
    const plan = (plansRes.data || []).find((p: any) => p.id === service.planId);

    if (!plan) {
      throw new Error(`Plan details for planId '${service.planId}' not found.`);
    }

    // Read technical mappings from plan JSON object
    const nestId = parseInt(plan.nestId || plan.nest_id || "1", 10);
    const eggId = parseInt(plan.eggId || plan.egg_id || "1", 10);
    const locationId = parseInt(plan.locationId || plan.location_id || "1", 10);
    const ramMb = plan.ram_mb || 1024;
    const cpuPct = plan.cpu_pct || 100;
    const diskMb = plan.disk_mb || 5120;
    const databaseLimit = plan.databases || 0;
    const backupLimit = plan.backups || 0;
    const allocationLimit = plan.allocations || 1;
    const dockerImage = plan.dockerImage || "ghcr.io/pterodactyl/yolks:java_17";
    const startup = plan.startup || "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}";
    const envVars = typeof plan.environment === "string" ? JSON.parse(plan.environment) : (plan.environment || {});

    // 4. Resolve Pterodactyl user by email. Create account if not exists.
    let pterodactylUser: any = null;
    try {
      const userRes = await axios.get(
        `${panelConfig.url}/api/application/users?filter[email]=${encodeURIComponent(service.email)}`,
        { headers: getAppHeaders(panelConfig) }
      );
      pterodactylUser = userRes.data.data[0];
    } catch (err: any) {
      console.warn(`[Worker] Failed user lookup: ${err.message}`);
    }

    if (!pterodactylUser) {
      console.log(`[Worker] Creating new Pterodactyl user for ${service.email}...`);
      const randomPassword = crypto.randomBytes(12).toString("base64url");
      const createUserRes = await axios.post(
        `${panelConfig.url}/api/application/users`,
        {
          email: service.email,
          username: service.username.toLowerCase() + "_" + Math.floor(Math.random() * 1000),
          first_name: "Cynex",
          last_name: "Client",
          password: randomPassword
        },
        { headers: getAppHeaders(panelConfig) }
      );
      pterodactylUser = createUserRes.data;
    }

    const pterodactylUserId = pterodactylUser.attributes.id;

    // 5. Resolve Node ID inside the configured Location
    const nodesRes = await axios.get(
      `${panelConfig.url}/api/application/nodes`,
      { headers: getAppHeaders(panelConfig) }
    );
    const nodes = nodesRes.data.data || [];
    // Pick the first active node matching the target location (or pick any active node if no location-matching node exists)
    const activeNode = nodes.find((n: any) => n.attributes.active && n.attributes.location_id === locationId) || 
                       nodes.find((n: any) => n.attributes.active);

    if (!activeNode) {
      throw new Error(`No active nodes available in location ID ${locationId}.`);
    }

    const nodeId = activeNode.attributes.id;
    const nodeFqdn = activeNode.attributes.fqdn;

    // 6. Resolve Allocation (free port) on the target Node ID
    const allocRes = await axios.get(
      `${panelConfig.url}/api/application/nodes/${nodeId}/allocations`,
      { headers: getAppHeaders(panelConfig) }
    );
    const allocations = allocRes.data.data || [];
    const freeAlloc = allocations.find((a: any) => !a.attributes.assigned);

    if (!freeAlloc) {
      throw new Error(`No free port allocations left on Node '${activeNode.attributes.name}'.`);
    }

    const allocationId = freeAlloc.attributes.id;
    const allocatedIp = freeAlloc.attributes.ip;
    const allocatedPort = freeAlloc.attributes.port;

    // 7. Create server instance on Pterodactyl
    console.log(`[Worker] Deploying server '${service.name}' on node '${activeNode.attributes.name}'...`);
    const serverPayload = {
      name: service.name,
      user: pterodactylUserId,
      egg: eggId,
      docker_image: dockerImage,
      startup: startup,
      limits: {
        memory: ramMb,
        swap: 0,
        disk: diskMb,
        io: 500,
        cpu: cpuPct
      },
      feature_limits: {
        databases: databaseLimit,
        backups: backupLimit,
        allocations: allocationLimit
      },
      allocation: {
        default: allocationId
      },
      environment: envVars
    };

    const createServerRes = await axios.post(
      `${panelConfig.url}/api/application/servers`,
      serverPayload,
      { headers: getAppHeaders(panelConfig) }
    );

    const pterodactylServer = createServerRes.data.attributes;

    // 8. Save Service Record details
    const serverAddress = `${nodeFqdn || allocatedIp}:${allocatedPort}`;
    const nextRenewal = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 Days

    await queryRun(
      `UPDATE services 
       SET status = 'Active', 
           pterodactylId = ?, 
           pterodactylUuid = ?, 
           name = ?,
           nextRenewalDate = ?,
           updatedAt = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        pterodactylServer.id, 
        pterodactylServer.uuid, 
        `${pterodactylServer.name} (${serverAddress})`,
        nextRenewal,
        service.id
      ]
    );

    // 9. Mark job completed
    await queryRun(
      `UPDATE provisioning_jobs 
       SET status = 'Completed', updatedAt = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [jobId]
    );

    // Write real notification to database
    await queryRun(
      `INSERT INTO notifications (id, userId, title, message) VALUES (?, ?, 'Service Active', ?)`,
      ["notif-" + crypto.randomUUID(), service.userId, `Your service '${service.name}' is now active on node '${activeNode.attributes.name}' at ${serverAddress}.`]
    );

    console.log(`[Worker] Provisioning job ${jobId} completed successfully.`);
  } catch (err: any) {
    const errMsg = err.response?.data?.errors?.[0]?.detail || err.message || "Unknown error occurred.";
    console.error(`[Worker] Provisioning job ${jobId} failed:`, errMsg);

    // Save job error details
    await queryRun(
      `UPDATE provisioning_jobs 
       SET status = 'Failed', errorLog = ?, updatedAt = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [errMsg, jobId]
    );

    // Write real error notification to database
    try {
      const service = await queryGet<any>(`SELECT userId, name FROM services WHERE id = (SELECT serviceId FROM provisioning_jobs WHERE id = ?)`, [jobId]);
      if (service) {
        await queryRun(
          `INSERT INTO notifications (id, userId, title, message) VALUES (?, ?, 'Provisioning Failed', ?)`,
          ["notif-" + crypto.randomUUID(), service.userId, `Failed to provision '${service.name}': ${errMsg}`]
        );
      }
    } catch (dbErr) {
      console.error("Failed to insert error notification:", dbErr);
    }

    // Mark service state as Failed
    await queryRun(
      `UPDATE services 
       SET status = 'Failed', updatedAt = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [job.serviceId]
    );
  }
};
