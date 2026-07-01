import { Router, Response } from "express";
import { requireAuth } from "./authRoutes";
import {
  listUserServers,
  sendServerPowerAction,
  getServerResourceUsage,
  getServerWebSocketDetails,
  getPanelConfig
} from "../services/pterodactylService";

const router = Router();

// Retrieve all servers mapped to the logged-in user's email
router.get("/servers", requireAuth, async (req: any, res: Response) => {
  try {
    const servers = await listUserServers(req.user.email);
    res.json({ success: true, servers });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to list servers." });
  }
});

// Proxy power actions (start/stop/restart/kill)
router.post("/servers/:id/power", requireAuth, async (req: any, res: Response) => {
  const { id } = req.params;
  const { signal } = req.body;

  if (!["start", "stop", "restart", "kill"].includes(signal)) {
    return res.status(400).json({ error: "Invalid power signal." });
  }

  try {
    const result = await sendServerPowerAction(id, signal);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to perform power action." });
  }
});

// Retrieve realtime resource usage details
router.get("/servers/:id/resources", requireAuth, async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const resources = await getServerResourceUsage(id);
    res.json({ success: true, resources });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch resource usage." });
  }
});

// Retrieve Wings WebSocket details
router.get("/servers/:id/websocket", requireAuth, async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const socketDetails = await getServerWebSocketDetails(id);
    res.json({ success: true, socketDetails });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to retrieve console websocket token." });
  }
});

// Retrieve Pterodactyl URL configuration info
router.get("/config", requireAuth, async (req: any, res: Response) => {
  try {
    const config = await getPanelConfig();
    res.json({ success: true, url: config.url });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load panel configuration." });
  }
});

export default router;
