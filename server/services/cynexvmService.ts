import axios from "axios";
import { queryGet } from "../db/database";

interface CynexVMConfig {
  url: string;
  apiKey: string;
}

export const getCynexVMConfig = async (): Promise<CynexVMConfig> => {
  const urlRow = await queryGet<{ value: string }>("SELECT value FROM settings WHERE key = ?", ["cynexvm_url"]);
  const keyRow = await queryGet<{ value: string }>("SELECT value FROM settings WHERE key = ?", ["cynexvm_api_key"]);
  return {
    url: urlRow?.value || process.env.CYNEXVM_URL || "",
    apiKey: keyRow?.value || process.env.CYNEXVM_API_KEY || ""
  };
};

const getHeaders = (config: CynexVMConfig) => ({
  "x-api-key": config.apiKey,
  "Content-Type": "application/json",
  "Accept": "application/json"
});

// List all hypervisor nodes
export const getNodes = async () => {
  const config = await getCynexVMConfig();
  if (!config.url || !config.apiKey) throw new Error("CynexVM is not configured.");
  const res = await axios.get(`${config.url}/api/v1/nodes`, { headers: getHeaders(config) });
  return res.data;
};

// List cached OS images/templates
export const getImages = async () => {
  const config = await getCynexVMConfig();
  if (!config.url || !config.apiKey) throw new Error("CynexVM is not configured.");
  const res = await axios.get(`${config.url}/api/v1/images`, { headers: getHeaders(config) });
  return res.data;
};

// List plans from CynexVM
export const getPlans = async () => {
  const config = await getCynexVMConfig();
  if (!config.url || !config.apiKey) throw new Error("CynexVM is not configured.");
  const res = await axios.get(`${config.url}/api/v1/plans`, { headers: getHeaders(config) });
  return res.data;
};

// Create a new instance (returns taskId, vmid)
export const createInstance = async (data: {
  nodeId: string;
  name: string;
  hostname: string;
  cpuCores: number;
  memoryMb: number;
  storageGb: number;
  osTemplate: string;
  password: string;
}) => {
  const config = await getCynexVMConfig();
  if (!config.url || !config.apiKey) throw new Error("CynexVM is not configured.");
  const res = await axios.post(`${config.url}/api/v1/instances/create`, data, { headers: getHeaders(config) });
  return res.data;
};

// Get instance details + live stats
export const getInstance = async (instanceId: string) => {
  const config = await getCynexVMConfig();
  if (!config.url || !config.apiKey) throw new Error("CynexVM is not configured.");
  const res = await axios.get(`${config.url}/api/v1/instances/${instanceId}`, { headers: getHeaders(config) });
  return res.data;
};

// List user instances
export const listInstances = async () => {
  const config = await getCynexVMConfig();
  if (!config.url || !config.apiKey) throw new Error("CynexVM is not configured.");
  const res = await axios.get(`${config.url}/api/v1/instances`, { headers: getHeaders(config) });
  return res.data;
};

// Power actions
export const startInstance = async (instanceId: string) => {
  const config = await getCynexVMConfig();
  if (!config.url || !config.apiKey) throw new Error("CynexVM is not configured.");
  const res = await axios.post(`${config.url}/api/v1/instances/${instanceId}/start`, {}, { headers: getHeaders(config) });
  return res.data;
};

export const stopInstance = async (instanceId: string, force = false) => {
  const config = await getCynexVMConfig();
  if (!config.url || !config.apiKey) throw new Error("CynexVM is not configured.");
  const res = await axios.post(`${config.url}/api/v1/instances/${instanceId}/stop`, { force }, { headers: getHeaders(config) });
  return res.data;
};

export const restartInstance = async (instanceId: string) => {
  const config = await getCynexVMConfig();
  if (!config.url || !config.apiKey) throw new Error("CynexVM is not configured.");
  const res = await axios.post(`${config.url}/api/v1/instances/${instanceId}/restart`, {}, { headers: getHeaders(config) });
  return res.data;
};

// Delete/destroy instance
export const deleteInstance = async (instanceId: string) => {
  const config = await getCynexVMConfig();
  if (!config.url || !config.apiKey) throw new Error("CynexVM is not configured.");
  const res = await axios.delete(`${config.url}/api/v1/instances/${instanceId}`, { headers: getHeaders(config) });
  return res.data;
};

// Reinstall with new OS template
export const reinstallInstance = async (instanceId: string, osTemplate: string, password: string) => {
  const config = await getCynexVMConfig();
  if (!config.url || !config.apiKey) throw new Error("CynexVM is not configured.");
  const res = await axios.post(`${config.url}/api/v1/instances/${instanceId}/reinstall`, { osTemplate, password }, { headers: getHeaders(config) });
  return res.data;
};

// Get metrics snapshot
export const getInstanceMetrics = async (instanceId: string) => {
  const config = await getCynexVMConfig();
  if (!config.url || !config.apiKey) throw new Error("CynexVM is not configured.");
  const res = await axios.get(`${config.url}/api/v1/instances/${instanceId}/metrics`, { headers: getHeaders(config) });
  return res.data;
};

// Check job/task status
export const getJobStatus = async (taskId: string) => {
  const config = await getCynexVMConfig();
  if (!config.url || !config.apiKey) throw new Error("CynexVM is not configured.");
  const res = await axios.get(`${config.url}/api/v1/queue/jobs/${taskId}`, { headers: getHeaders(config) });
  return res.data;
};
