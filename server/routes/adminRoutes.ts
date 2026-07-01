import { Router, Response, NextFunction } from "express";
import { requireAuth } from "./authRoutes";
import { queryRun, queryGet, queryAll } from "../db/database";

const router = Router();

// Middleware to enforce admin role access
const requireAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Administrative privilege required." });
  }
  next();
};

// Retrieve Pterodactyl Panel configurations (Admin only)
router.get("/settings", requireAuth, requireAdmin, async (req: any, res: Response) => {
  try {
    const url = await queryGet<{ value: string }>("SELECT value FROM settings WHERE key = 'pterodactyl_url'");
    const appKey = await queryGet<{ value: string }>("SELECT value FROM settings WHERE key = 'pterodactyl_app_key'");
    const clientKey = await queryGet<{ value: string }>("SELECT value FROM settings WHERE key = 'pterodactyl_client_key'");

    res.json({
      success: true,
      settings: {
        pterodactyl_url: url?.value || "",
        pterodactyl_app_key: appKey?.value || "",
        pterodactyl_client_key: clientKey?.value || ""
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load administrative settings." });
  }
});

// Update settings (Admin only)
router.put("/settings", requireAuth, requireAdmin, async (req: any, res: Response) => {
  const { pterodactyl_url, pterodactyl_app_key, pterodactyl_client_key } = req.body;

  try {
    const insertSetting = async (key: string, val: string) => {
      await queryRun(
        `INSERT INTO settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [key, val]
      );
    };

    if (pterodactyl_url !== undefined) await insertSetting("pterodactyl_url", pterodactyl_url);
    if (pterodactyl_app_key !== undefined) await insertSetting("pterodactyl_app_key", pterodactyl_app_key);
    if (pterodactyl_client_key !== undefined) await insertSetting("pterodactyl_client_key", pterodactyl_client_key);

    res.json({ success: true, message: "Settings saved successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update administrative settings." });
  }
});

// List all registered users (Admin only)
router.get("/users", requireAuth, requireAdmin, async (req: any, res: Response) => {
  try {
    const users = await queryAll(
      `SELECT id, username, email, role, emailVerified, banned, createdAt FROM users ORDER BY createdAt DESC`
    );
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: "Failed to load users list." });
  }
});

// Toggle ban / edit user roles (Admin only)
router.put("/users/:id", requireAuth, requireAdmin, async (req: any, res: Response) => {
  const { id } = req.params;
  const { role, banned } = req.body;

  try {
    // Prevent banning yourself
    if (id === req.user.id) {
      return res.status(400).json({ error: "You cannot modify your own administrative status." });
    }

    if (role !== undefined) {
      await queryRun(`UPDATE users SET role = ? WHERE id = ?`, [role, id]);
    }
    if (banned !== undefined) {
      await queryRun(`UPDATE users SET banned = ? WHERE id = ?`, [banned ? 1 : 0, id]);
    }

    res.json({ success: true, message: "User status updated successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user profile." });
  }
});

export default router;
