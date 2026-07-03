import { Router, Response, NextFunction } from "express";
import { requireAuth } from "./authRoutes";
import { queryRun, queryGet, queryAll } from "../db/database";
import axios from "axios";
import { getPanelConfig } from "../services/pterodactylService";
import crypto from "crypto";

const router = Router();

// Middleware to enforce admin role access
const requireAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Administrative privilege required." });
  }
  next();
};

// Retrieve panel configurations (Admin only)
router.get("/settings", requireAuth, requireAdmin, async (req: any, res: Response) => {
  try {
    const getVal = async (key: string) => {
      const row = await queryGet<{ value: string }>("SELECT value FROM settings WHERE key = ?", [key]);
      return row?.value || "";
    };

    const settings = {
      pterodactyl_url: await getVal("pterodactyl_url"),
      pterodactyl_app_key: await getVal("pterodactyl_app_key"),
      pterodactyl_client_key: await getVal("pterodactyl_client_key"),
      oxapay_merchant_key: await getVal("oxapay_merchant_key"),
      social_login_provider: await getVal("social_login_provider"),
      discord_client_id: await getVal("discord_client_id"),
      discord_client_secret: await getVal("discord_client_secret"),
      cynexvm_url: await getVal("cynexvm_url"),
      cynexvm_api_key: await getVal("cynexvm_api_key")
    };

    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: "Failed to load administrative settings." });
  }
});

// Update settings (Admin only)
router.put("/settings", requireAuth, requireAdmin, async (req: any, res: Response) => {
  const { pterodactyl_url, pterodactyl_app_key, pterodactyl_client_key, oxapay_merchant_key, social_login_provider, discord_client_id, discord_client_secret, cynexvm_url, cynexvm_api_key } = req.body;

  try {
    const insertSetting = async (key: string, val: string) => {
      await queryRun(
        `INSERT INTO settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [key, val]
      );
    };

    const fields: Record<string, string | undefined> = {
      pterodactyl_url: pterodactyl_url,
      pterodactyl_app_key: pterodactyl_app_key,
      pterodactyl_client_key: pterodactyl_client_key,
      oxapay_merchant_key: oxapay_merchant_key,
      social_login_provider: social_login_provider,
      discord_client_id: discord_client_id,
      discord_client_secret: discord_client_secret,
      cynexvm_url: cynexvm_url,
      cynexvm_api_key: cynexvm_api_key
    };

    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) await insertSetting(key, val);
    }

    res.json({ success: true, message: "Settings saved successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update administrative settings." });
  }
});

// Dashboard statistics (Admin only)
router.get("/stats", requireAuth, requireAdmin, async (req: any, res: Response) => {
  try {
    const totalUsers = await queryGet<{ count: number }>("SELECT COUNT(*) as count FROM users");
    const activeUsers = await queryGet<{ count: number }>("SELECT COUNT(*) as count FROM users WHERE banned = 0");
    const verifiedUsers = await queryGet<{ count: number }>("SELECT COUNT(*) as count FROM users WHERE emailVerified = 1");
    const totalServices = await queryGet<{ count: number }>("SELECT COUNT(*) as count FROM services");
    const activeServices = await queryGet<{ count: number }>("SELECT COUNT(*) as count FROM services WHERE status = 'Active'");
    const pendingServices = await queryGet<{ count: number }>("SELECT COUNT(*) as count FROM services WHERE status = 'Pending Payment'");
    const totalOrders = await queryGet<{ count: number }>("SELECT COUNT(*) as count FROM orders");
    const paidOrders = await queryGet<{ count: number }>("SELECT COUNT(*) as count FROM orders WHERE status = 'Paid'");
    const pendingOrders = await queryGet<{ count: number }>("SELECT COUNT(*) as count FROM orders WHERE status = 'Pending Payment'");
    const revenue = await queryGet<{ total: number }>("SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'Paid'");
    const totalInvoices = await queryGet<{ count: number }>("SELECT COUNT(*) as count FROM invoices");
    const paidInvoices = await queryGet<{ count: number }>("SELECT COUNT(*) as count FROM invoices WHERE status = 'Paid'");
    const unpaidInvoices = await queryGet<{ count: number }>("SELECT COUNT(*) as count FROM invoices WHERE status = 'Unpaid'");
    const totalTickets = await queryGet<{ count: number }>("SELECT COUNT(*) as count FROM tickets");
    const openTickets = await queryGet<{ count: number }>("SELECT COUNT(*) as count FROM tickets WHERE status = 'open'");
    const closedTickets = await queryGet<{ count: number }>("SELECT COUNT(*) as count FROM tickets WHERE status = 'closed'");

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers?.count || 0,
        activeUsers: activeUsers?.count || 0,
        verifiedUsers: verifiedUsers?.count || 0,
        totalServices: totalServices?.count || 0,
        activeServices: activeServices?.count || 0,
        pendingServices: pendingServices?.count || 0,
        totalOrders: totalOrders?.count || 0,
        paidOrders: paidOrders?.count || 0,
        pendingOrders: pendingOrders?.count || 0,
        revenue: revenue?.total || 0,
        totalInvoices: totalInvoices?.count || 0,
        paidInvoices: paidInvoices?.count || 0,
        unpaidInvoices: unpaidInvoices?.count || 0,
        totalTickets: totalTickets?.count || 0,
        openTickets: openTickets?.count || 0,
        closedTickets: closedTickets?.count || 0,
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load dashboard statistics." });
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

// Retrieve all user tickets for admin management
router.get("/tickets", requireAuth, requireAdmin, async (req: any, res: Response) => {
  try {
    const tickets = await queryAll(
      `SELECT t.*, u.username, u.email 
       FROM tickets t
       LEFT JOIN users u ON t.userId = u.id
       ORDER BY t.updatedAt DESC`
    );
    res.json({ success: true, tickets });
  } catch (err) {
    res.status(500).json({ error: "Failed to load admin support tickets." });
  }
});

// Retrieve locations list from Pterodactyl
router.get("/pterodactyl/locations", requireAuth, requireAdmin, async (req: any, res: Response) => {
  try {
    const config = await getPanelConfig();
    const response = await axios.get(`${config.url}/api/application/locations`, {
      headers: { Authorization: `Bearer ${config.appKey}`, Accept: "application/json" }
    });
    res.json({ success: true, locations: response.data.data });
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data?.errors?.[0]?.detail || err.message || "Failed to load panel locations." });
  }
});

// Retrieve nodes list from Pterodactyl
router.get("/pterodactyl/nodes", requireAuth, requireAdmin, async (req: any, res: Response) => {
  try {
    const config = await getPanelConfig();
    const response = await axios.get(`${config.url}/api/application/nodes`, {
      headers: { Authorization: `Bearer ${config.appKey}`, Accept: "application/json" }
    });
    res.json({ success: true, nodes: response.data.data });
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data?.errors?.[0]?.detail || err.message || "Failed to load panel nodes." });
  }
});

// Retrieve nests list from Pterodactyl
router.get("/pterodactyl/nests", requireAuth, requireAdmin, async (req: any, res: Response) => {
  try {
    const config = await getPanelConfig();
    const response = await axios.get(`${config.url}/api/application/nests`, {
      headers: { Authorization: `Bearer ${config.appKey}`, Accept: "application/json" }
    });
    res.json({ success: true, nests: response.data.data });
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data?.errors?.[0]?.detail || err.message || "Failed to load panel nests." });
  }
});

// Retrieve eggs list for a specific Nest ID
router.get("/pterodactyl/nests/:nestId/eggs", requireAuth, requireAdmin, async (req: any, res: Response) => {
  const { nestId } = req.params;
  try {
    const config = await getPanelConfig();
    const response = await axios.get(`${config.url}/api/application/nests/${nestId}/eggs`, {
      headers: { Authorization: `Bearer ${config.appKey}`, Accept: "application/json" }
    });
    res.json({ success: true, eggs: response.data.data });
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data?.errors?.[0]?.detail || err.message || "Failed to load nest eggs." });
  }
});

// Retrieve allocations list for a specific Node ID
router.get("/pterodactyl/nodes/:nodeId/allocations", requireAuth, requireAdmin, async (req: any, res: Response) => {
  const { nodeId } = req.params;
  try {
    const config = await getPanelConfig();
    const response = await axios.get(`${config.url}/api/application/nodes/${nodeId}/allocations`, {
      headers: { Authorization: `Bearer ${config.appKey}`, Accept: "application/json" }
    });
    res.json({ success: true, allocations: response.data.data });
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data?.errors?.[0]?.detail || err.message || "Failed to load node allocations." });
  }
});

export default router;
