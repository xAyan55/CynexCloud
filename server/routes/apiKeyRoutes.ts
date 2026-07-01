import { Router, Response } from "express";
import crypto from "crypto";
import { requireAuth } from "./authRoutes";
import { queryRun, queryGet, queryAll } from "../db/database";

const router = Router();

// Retrieve all API keys for the authenticated user
router.get("/", requireAuth, async (req: any, res: Response) => {
  try {
    const keys = await queryAll(
      `SELECT id, name, lastUsed, expiresAt, createdAt FROM api_keys WHERE userId = ? ORDER BY createdAt DESC`,
      [req.user.id]
    );
    res.json({ success: true, keys });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to list API keys." });
  }
});

// Create a new API key
router.post("/", requireAuth, async (req: any, res: Response) => {
  const { name, permissions, expiresDays } = req.body;

  if (!name) {
    return res.status(400).json({ error: "API Key name is required." });
  }

  // Generate plain-text API token
  const token = "cc_key_" + crypto.randomBytes(24).toString("hex");
  // Hash token for database storage
  const hash = crypto.createHash("sha256").update(token).digest("hex");

  const keyId = "KEY-" + crypto.randomUUID();
  const expiresAt = expiresDays ? new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString() : null;
  const perms = permissions ? JSON.stringify(permissions) : JSON.stringify([]);

  try {
    await queryRun(
      `INSERT INTO api_keys (id, userId, name, keyHash, permissions, expiresAt) VALUES (?, ?, ?, ?, ?, ?)`,
      [keyId, req.user.id, name, hash, perms, expiresAt]
    );

    // Return token in plain text only once to the client
    res.json({
      success: true,
      key: { id: keyId, name, expiresAt, createdAt: new Date().toISOString() },
      token
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create API key." });
  }
});

// Delete an existing API key
router.delete("/:id", requireAuth, async (req: any, res: Response) => {
  const { id } = req.params;

  try {
    const result = await queryRun(
      `DELETE FROM api_keys WHERE id = ? AND userId = ?`,
      [id, req.user.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "API Key not found." });
    }

    res.json({ success: true, message: "API Key deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete API key." });
  }
});

export default router;
