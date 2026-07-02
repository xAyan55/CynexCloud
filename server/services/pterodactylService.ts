import axios from "axios";
import { queryGet } from "../db/database";

interface PanelConfig {
  url: string;
  appKey: string;
  clientKey: string;
}

export const getPanelConfig = async (): Promise<PanelConfig> => {
  const urlRow = await queryGet<{ value: string }>("SELECT value FROM settings WHERE key = ?", ["pterodactyl_url"]);
  const appKeyRow = await queryGet<{ value: string }>("SELECT value FROM settings WHERE key = ?", ["pterodactyl_app_key"]);
  const clientKeyRow = await queryGet<{ value: string }>("SELECT value FROM settings WHERE key = ?", ["pterodactyl_client_key"]);

  return {
    url: urlRow?.value || process.env.PTERODACTYL_URL || "",
    appKey: appKeyRow?.value || process.env.PTERODACTYL_APP_KEY || "",
    clientKey: clientKeyRow?.value || process.env.PTERODACTYL_CLIENT_KEY || ""
  };
};

const getClientHeaders = (config: PanelConfig) => ({
  "Authorization": `Bearer ${config.clientKey}`,
  "Content-Type": "application/json",
  "Accept": "application/json"
});

const getAppHeaders = (config: PanelConfig) => ({
  "Authorization": `Bearer ${config.appKey}`,
  "Content-Type": "application/json",
  "Accept": "application/json"
});

/**
 * List servers for a user by mapping their email address
 */
export const listUserServers = async (email: string) => {
  const config = await getPanelConfig();
  if (!config.url) {
    throw new Error("Pterodactyl panel is not configured.");
  }

  // If clientKey is provided, try client list first (default fallback)
  if (config.clientKey && !config.appKey) {
    try {
      const response = await axios.get(`${config.url}/api/client`, {
        headers: getClientHeaders(config)
      });
      return response.data.data;
    } catch (err: any) {
      console.error("Client API listing failed:", err.message);
      return [];
    }
  }

  if (!config.appKey) {
    // Return empty list if no app key configured yet
    return [];
  }

  try {
    // 1. Find user by email in Pterodactyl Application API
    const userRes = await axios.get(`${config.url}/api/application/users?filter[email]=${encodeURIComponent(email)}`, {
      headers: getAppHeaders(config)
    });

    const user = userRes.data.data[0];
    if (!user) {
      return []; // No matching Pterodactyl user found
    }

    // 2. Fetch servers owned/managed by this Pterodactyl user ID
    const serversRes = await axios.get(`${config.url}/api/application/servers`, {
      headers: getAppHeaders(config)
    });

    // Filter servers belonging to user ID
    const userServers = serversRes.data.data.filter((srv: any) => srv.attributes.user === user.attributes.id);
    
    // Map application API server format to standard client format for frontend UI consistency
    return userServers.map((srv: any) => ({
      object: "server",
      attributes: {
        identifier: srv.attributes.uuid.substring(0, 8),
        uuid: srv.attributes.uuid,
        name: srv.attributes.name,
        node: srv.attributes.node,
        description: srv.attributes.description,
        limits: srv.attributes.limits,
        feature_limits: srv.attributes.feature_limits,
        status: srv.attributes.suspended ? "suspended" : "online"
      }
    }));
  } catch (err: any) {
    console.error("Failed to list Pterodactyl servers:", err.message);
    throw err;
  }
};

/**
 * Proxy power actions using Client API
 */
export const sendServerPowerAction = async (serverIdentifier: string, action: "start" | "stop" | "restart" | "kill") => {
  const config = await getPanelConfig();
  if (!config.url || !config.clientKey) {
    throw new Error("Client API Key is required for power controls.");
  }

  const res = await axios.post(
    `${config.url}/api/client/servers/${serverIdentifier}/power`,
    { signal: action },
    { headers: getClientHeaders(config) }
  );
  return res.data;
};

/**
 * Fetch resource usage (CPU, RAM, Disk) for a specific server
 */
export const getServerResourceUsage = async (serverIdentifier: string) => {
  const config = await getPanelConfig();
  if (!config.url || !config.clientKey) {
    throw new Error("Client API Key is required to fetch resource usage.");
  }

  const res = await axios.get(`${config.url}/api/client/servers/${serverIdentifier}/resources`, {
    headers: getClientHeaders(config)
  });
  return res.data;
};

/**
 * Fetch server console websocket tokens/credentials from Wings
 */
export const getServerWebSocketDetails = async (serverIdentifier: string) => {
  const config = await getPanelConfig();
  if (!config.url || !config.clientKey) {
    throw new Error("Client API Key is required for Console WebSocket access.");
  }

  const res = await axios.get(`${config.url}/api/client/servers/${serverIdentifier}/websocket`, {
    headers: getClientHeaders(config)
  });
  return res.data;
};

/**
 * Fetch real Pterodactyl nodes and locations, and calculate resource allocations
 */
export const getPterodactylNodesForCheckout = async () => {
  const config = await getPanelConfig();
  if (!config.url || !config.appKey) {
    throw new Error("Pterodactyl API is not configured or lacks application key.");
  }

  // 1. Fetch locations
  const locationsRes = await axios.get(`${config.url}/api/application/locations`, {
    headers: getAppHeaders(config)
  });
  const locations = locationsRes.data.data || [];

  // 2. Fetch nodes
  const nodesRes = await axios.get(`${config.url}/api/application/nodes`, {
    headers: getAppHeaders(config)
  });
  const nodes = nodesRes.data.data || [];

  // 3. Fetch servers to calculate allocated resources
  const serversRes = await axios.get(`${config.url}/api/application/servers`, {
    headers: getAppHeaders(config)
  });
  const servers = serversRes.data.data || [];

  // Map locations by ID
  const locationsMap = new Map();
  locations.forEach((loc: any) => {
    locationsMap.set(loc.attributes.id, loc.attributes);
  });

  // Calculate allocated resources per node
  const nodeAllocationMap = new Map<number, { memory: number; disk: number }>();
  servers.forEach((srv: any) => {
    const nodeId = srv.attributes.node;
    const limits = srv.attributes.limits || {};
    const mem = limits.memory || 0;
    const dsk = limits.disk || 0;

    const current = nodeAllocationMap.get(nodeId) || { memory: 0, disk: 0 };
    nodeAllocationMap.set(nodeId, {
      memory: current.memory + mem,
      disk: current.disk + dsk
    });
  });

  // Process nodes
  return nodes.map((node: any) => {
    const attr = node.attributes;
    const loc = locationsMap.get(attr.location_id) || { short: "US", long: "United States" };
    
    // Parse description for City, Country
    let country = loc.long;
    let city = "Default City";
    if (attr.description && attr.description.includes(",")) {
      const parts = attr.description.split(",");
      city = parts[0].trim();
      country = parts[1].trim();
    } else if (attr.description) {
      city = attr.description.trim();
    }

    const allocations = nodeAllocationMap.get(attr.id) || { memory: 0, disk: 0 };
    
    // Compute overallocation limits
    const totalMemLimit = attr.memory * (1 + (attr.memory_overallocate || 0) / 100);
    const totalDiskLimit = attr.disk * (1 + (attr.disk_overallocate || 0) / 100);

    const availableRamMb = Math.max(0, totalMemLimit - allocations.memory);
    const availableStorageMb = Math.max(0, totalDiskLimit - allocations.disk);
    
    // Determine online status: active and not in maintenance mode
    const isOnline = attr.active && !attr.maintenance_mode;

    // Ping estimate based on location
    const ping = loc.short === "RO" ? "15ms" : loc.short === "DE" ? "25ms" : loc.short === "IN" ? "55ms" : loc.short === "SG" ? "140ms" : "95ms";
    const flag = loc.short === "RO" ? "🇷🇴" : loc.short === "DE" ? "🇩🇪" : loc.short === "US" ? "🇺🇸" : loc.short === "SG" ? "🇸🇬" : loc.short === "IN" ? "🇮🇳" : "🌐";

    return {
      id: attr.id,
      name: attr.name,
      country,
      city,
      ping,
      totalRam: attr.memory,
      availableRam: availableRamMb,
      totalDisk: attr.disk,
      availableDisk: availableStorageMb,
      isOnline,
      locationId: attr.location_id,
      flag
    };
  });
};

/**
 * Fetch nests and eggs from Pterodactyl dynamically to map Game -> Software -> Version
 */
export const getPterodactylSoftwareForCheckout = async () => {
  const config = await getPanelConfig();
  if (!config.url || !config.appKey) {
    throw new Error("Pterodactyl API is not configured or lacks application key.");
  }

  // 1. Fetch Nests
  const nestsRes = await axios.get(`${config.url}/api/application/nests`, {
    headers: getAppHeaders(config)
  });
  const nests = nestsRes.data.data || [];

  const softwareList: any[] = [];

  // 2. Fetch Eggs for each Nest
  for (const nest of nests) {
    const nestId = nest.attributes.id;
    const nestName = nest.attributes.name;

    try {
      const eggsRes = await axios.get(`${config.url}/api/application/nests/${nestId}/eggs`, {
        headers: getAppHeaders(config)
      });
      const eggs = eggsRes.data.data || [];

      for (const egg of eggs) {
        const eggId = egg.attributes.id;
        const eggName = egg.attributes.name;

        let versions = ["1.21.4", "1.21.3", "1.21.1", "1.20.6", "1.20.4", "1.19.4", "1.18.2", "1.16.5"];
        const lowerName = eggName.toLowerCase();
        if (lowerName.includes("forge")) {
          versions = ["1.20.1", "1.19.2", "1.18.2", "1.16.5", "1.12.2"];
        } else if (lowerName.includes("fabric")) {
          versions = ["1.21.4", "1.21.1", "1.20.6", "1.20.4", "1.19.4", "1.18.2", "1.16.5"];
        } else if (lowerName.includes("velocity")) {
          versions = ["3.3.0-SNAPSHOT", "3.2.0"];
        } else if (lowerName.includes("bungee") || lowerName.includes("waterfall")) {
          versions = ["latest"];
        }

        softwareList.push({
          id: `egg-${eggId}`,
          eggId: eggId,
          nestId: nestId,
          game: nestName,
          name: eggName,
          versions
        });
      }
    } catch (err: any) {
      console.warn(`[Checkout Software] Failed to fetch eggs for nest ${nestId}:`, err.message);
    }
  }

  return softwareList;
};


