import { Router, Response } from "express";
import crypto from "crypto";
import { requireAuth } from "./authRoutes";
import { queryRun, queryGet, queryAll } from "../db/database";

const router = Router();

// Retrieve all tickets for the authenticated user
router.get("/", requireAuth, async (req: any, res: Response) => {
  try {
    const tickets = await queryAll(
      `SELECT * FROM tickets WHERE userId = ? ORDER BY updatedAt DESC`,
      [req.user.id]
    );
    res.json({ success: true, tickets });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load support tickets." });
  }
});

// Create a new support ticket
router.post("/", requireAuth, async (req: any, res: Response) => {
  const { subject, category, priority, message } = req.body;

  if (!subject || !category || !priority || !message) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const ticketId = "TCK-" + crypto.randomUUID();
  const messageId = "MSG-" + crypto.randomUUID();

  try {
    // 1. Insert ticket row
    await queryRun(
      `INSERT INTO tickets (id, userId, subject, category, priority, status) VALUES (?, ?, ?, ?, ?, 'open')`,
      [ticketId, req.user.id, subject, category, priority]
    );

    // 2. Insert initial message row
    await queryRun(
      `INSERT INTO ticket_messages (id, ticketId, userId, message, isStaff) VALUES (?, ?, ?, ?, 0)`,
      [messageId, ticketId, req.user.id, message]
    );

    res.json({ success: true, ticketId, message: "Ticket opened successfully." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to open support ticket." });
  }
});

// Retrieve ticket details + message timeline
router.get("/:id", requireAuth, async (req: any, res: Response) => {
  const { id } = req.params;

  try {
    // Verify owner
    const ticket = await queryGet(
      `SELECT * FROM tickets WHERE id = ? AND (userId = ? OR ? = 'admin')`,
      [id, req.user.id, req.user.role]
    );

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    const messages = await queryAll(
      `SELECT tm.*, u.username, u.avatar 
       FROM ticket_messages tm
       LEFT JOIN users u ON tm.userId = u.id
       WHERE tm.ticketId = ? 
       ORDER BY tm.createdAt ASC`,
      [id]
    );

    res.json({ success: true, ticket, messages });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch ticket messages." });
  }
});

// Add a reply message to an open ticket
router.post("/:id/reply", requireAuth, async (req: any, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message content is required." });
  }

  try {
    // Verify owner
    const ticket = await queryGet(
      `SELECT * FROM tickets WHERE id = ? AND (userId = ? OR ? = 'admin')`,
      [id, req.user.id, req.user.role]
    );

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    if (ticket.status === "closed") {
      return res.status(400).json({ error: "Cannot reply to a closed ticket." });
    }

    const messageId = "MSG-" + crypto.randomUUID();
    const isStaff = req.user.role === "admin" ? 1 : 0;

    // 1. Insert reply message
    await queryRun(
      `INSERT INTO ticket_messages (id, ticketId, userId, message, isStaff) VALUES (?, ?, ?, ?, ?)`,
      [messageId, id, req.user.id, message, isStaff]
    );

    // 2. Mark ticket status
    const newStatus = isStaff ? "answered" : "open";
    await queryRun(
      `UPDATE tickets SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [newStatus, id]
    );

    res.json({ success: true, message: "Reply added successfully." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to add reply." });
  }
});

// Close a support ticket
router.put("/:id/close", requireAuth, async (req: any, res: Response) => {
  const { id } = req.params;

  try {
    const ticket = await queryGet(
      `SELECT * FROM tickets WHERE id = ? AND (userId = ? OR ? = 'admin')`,
      [id, req.user.id, req.user.role]
    );

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    await queryRun(
      `UPDATE tickets SET status = 'closed', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );

    res.json({ success: true, message: "Ticket marked as closed." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to close ticket." });
  }
});

export default router;
