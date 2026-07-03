import { Router, Response } from "express";
import { requireAuth } from "./authRoutes";
import {
  getInstance,
  startInstance,
  stopInstance,
  restartInstance,
  getInstanceMetrics,
  getCynexVMConfig
} from "../services/cynexvmService";

const router = Router();

// Get CynexVM panel URL for frontend links
router.get("/config", requireAuth, async (req: any, res: Response) => {
  try {
    const config = await getCynexVMConfig();
    res.json({ success: true, url: config.url });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load CynexVM configuration." });
  }
});

// Get instance details
router.get("/instances/:id", requireAuth, async (req: any, res: Response) => {
  try {
    const instance = await getInstance(req.params.id);
    res.json({ success: true, instance });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch instance." });
  }
});

// Start instance
router.post("/instances/:id/start", requireAuth, async (req: any, res: Response) => {
  try {
    const result = await startInstance(req.params.id);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to start instance." });
  }
});

// Stop instance
router.post("/instances/:id/stop", requireAuth, async (req: any, res: Response) => {
  try {
    const result = await stopInstance(req.params.id, req.body.force);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to stop instance." });
  }
});

// Restart instance
router.post("/instances/:id/restart", requireAuth, async (req: any, res: Response) => {
  try {
    const result = await restartInstance(req.params.id);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to restart instance." });
  }
});

// Get instance metrics
router.get("/instances/:id/metrics", requireAuth, async (req: any, res: Response) => {
  try {
    const metrics = await getInstanceMetrics(req.params.id);
    res.json({ success: true, metrics });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch metrics." });
  }
});

export default router;
