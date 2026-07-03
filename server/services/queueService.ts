import axios from "axios";
import crypto from "crypto";
import { queryGet, queryRun, queryAll } from "../db/database";
import { getPanelConfig } from "./pterodactylService";
import { createInstance, getCynexVMConfig } from "./cynexvmService";

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

export const enqueueProvisioningJob = async (serviceId: string): Promise<string> => {
  const jobId = "JOB-" + crypto.randomUUID();
  await queryRun(
    `INSERT INTO provisioning_jobs (id, serviceId, status) VALUES (?, ?, 'Queued')`,
    [jobId, serviceId]
  );
  
  await queryRun(
    `UPDATE services SET status = 'Queued', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    [serviceId]
  );

  processProvisioningJob(jobId).catch((err) => {
    console.error(`Unhandled provisioning worker error for job ${jobId}:`, err);
  });

  return jobId;
};

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

  await queryRun(
    `UPDATE services SET status = 'Provisioning', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    [job.serviceId]
  );

  try {
    const service = await queryGet<any>(
      `SELECT s.*, u.email, u.username FROM services s
       INNER JOIN users u ON s.userId = u.id
       WHERE s.id = ?`,
      [job.serviceId]
    );

    if (!service) {
      throw new Error(`Service ${job.serviceId} or owner profile not found.`);
    }

    const plansRes = await axios.get(`http://localhost:3000/api/plans`);
    const plan = (plansRes.data || []).find((p: any) => p.id === service.planId);

    if (!plan) {
      throw new Error(`Plan details for planId '${service.planId}' not found.`);
    }

    const category = plan.category || "";

    if (category === "vps") {
      // === CynexVM Provisioning (VPS) ===
      const cynexvmConfig = await getCynexVMConfig();
      if (!cynexvmConfig.url || !cynexvmConfig.apiKey) {
        throw new Error("CynexVM is not configured. Please set CynexVM URL and API key in admin settings.");
      }

      const instanceData: any = {
        nodeId: service.nodeId || "",
        name: service.name,
        hostname: service.name.toLowerCase().replace(/[^a-z0-9-]/g, "-").substring(0, 20),
        cpuCores: parseInt(plan.cpuCores || plan.cores || "1", 10),
        memoryMb: parseInt(plan.memoryMb || plan.ramMb || "1024", 10),
        storageGb: parseInt(plan.storageGb || plan.diskGb || plan.storage?.replace(/[^0-9]/g, "") || "20", 10),
        osTemplate: service.osTemplate || "ubuntu/22.04",
        password: service.rootPassword || crypto.randomBytes(12).toString("base64url")
      };

      console.log(`[Worker] Deploying VPS '${service.name}' on CynexVM...`);
      const result = await createInstance(instanceData);

      const nextRenewal = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      await queryRun(
        `UPDATE services 
         SET status = 'Active', 
             cynexvmId = ?, 
             cynexvmUuid = ?,
             nextRenewalDate = ?,
             updatedAt = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [result.vmid?.toString() || result.taskId, "", nextRenewal, service.id]
      );

      await queryRun(
        `UPDATE provisioning_jobs 
         SET status = 'Completed', updatedAt = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [jobId]
      );

      await queryRun(
        `INSERT INTO notifications (id, userId, title, message) VALUES (?, ?, 'Service Active', ?)`,
        ["notif-" + crypto.randomUUID(), service.userId, `Your VPS '${service.name}' has been deployed successfully on CynexVM.`]
      );

      console.log(`[Worker] VPS provisioning job ${jobId} completed successfully.`);
    } else {
      // === Pterodactyl Provisioning (Minecraft/Discord) ===
      const panelConfig = await getPanelConfig();
      if (!panelConfig.url || !panelConfig.appKey) {
        throw new Error("Pterodactyl Node settings are not configured or incomplete.");
      }

      const nestId = service.nestId ? parseInt(service.nestId, 10) : parseInt(plan.nestId || plan.nest_id || "1", 10);
      const eggId = service.eggId ? parseInt(service.eggId, 10) : parseInt(plan.eggId || plan.egg_id || "1", 10);
      const locationId = service.locationId ? parseInt(service.locationId, 10) : parseInt(plan.locationId || plan.location_id || "1", 10);
      const ramMb = plan.ram_mb || 1024;
      const cpuPct = plan.cpu_pct || 100;
      const diskMb = plan.disk_mb || 5120;
      const databaseLimit = plan.databases || 0;
      const backupLimit = plan.backups || 0;
      const allocationLimit = plan.allocations || 1;
      const dockerImage = plan.dockerImage || "ghcr.io/pterodactyl/yolks:java_17";
      const startup = plan.startup || "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}";
      
      const envVars = typeof plan.environment === "string" ? JSON.parse(plan.environment) : (plan.environment || {});
      if (service.version) {
        envVars["MINECRAFT_VERSION"] = service.version;
        envVars["VERSION"] = service.version;
        envVars["SERVER_JARFILE"] = "server.jar";
      }

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

      const nodesRes = await axios.get(
        `${panelConfig.url}/api/application/nodes`,
        { headers: getAppHeaders(panelConfig) }
      );
      const nodes = nodesRes.data.data || [];
      const activeNode = nodes.find((n: any) => n.attributes.active && n.attributes.location_id === locationId) || 
                         nodes.find((n: any) => n.attributes.active);

      if (!activeNode) {
        throw new Error(`No active nodes available in location ID ${locationId}.`);
      }

      const nodeId = activeNode.attributes.id;
      const nodeFqdn = activeNode.attributes.fqdn;

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

      const serverAddress = `${nodeFqdn || allocatedIp}:${allocatedPort}`;
      const nextRenewal = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

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

      await queryRun(
        `UPDATE provisioning_jobs 
         SET status = 'Completed', updatedAt = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [jobId]
      );

      await queryRun(
        `INSERT INTO notifications (id, userId, title, message) VALUES (?, ?, 'Service Active', ?)`,
        ["notif-" + crypto.randomUUID(), service.userId, `Your service '${service.name}' is now active on node '${activeNode.attributes.name}' at ${serverAddress}.`]
      );

      console.log(`[Worker] Provisioning job ${jobId} completed successfully.`);
    }
  } catch (err: any) {
    const errMsg = err.response?.data?.errors?.[0]?.detail || err.response?.data?.error || err.message || "Unknown error occurred.";
    console.error(`[Worker] Provisioning job ${jobId} failed:`, errMsg);

    await queryRun(
      `UPDATE provisioning_jobs 
       SET status = 'Failed', errorLog = ?, updatedAt = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [errMsg, jobId]
    );

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

    await queryRun(
      `UPDATE services 
       SET status = 'Failed', updatedAt = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [job.serviceId]
    );
  }
};
