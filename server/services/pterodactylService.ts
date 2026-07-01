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
