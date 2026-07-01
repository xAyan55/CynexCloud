import { Request, Response } from "express";
import { listActiveSessions, revokeSession, revokeAllSessions } from "../services/sessionManager";
import { logAuthEvent } from "../services/auditLogger";

export const getSessions = async (req: any, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized access." });

  try {
    const sessions = await listActiveSessions(userId);
    // Format to mask full tokens and only show clean metadata
    const cleanSessions = sessions.map(s => ({
      id: s.id,
      device: s.device,
      browser: s.browser,
      ipAddress: s.ipAddress,
      country: s.country,
      lastActive: s.lastActive,
      expiresAt: s.expiresAt,
      isCurrent: s.tokenFamily === req.userFamily
    }));
    res.json(cleanSessions);
  } catch (err) {
    console.error("Fetch sessions error:", err);
    res.status(500).json({ error: "Failed to load active sessions." });
  }
};

export const terminateSession = async (req: any, res: Response) => {
  const userId = req.user?.userId;
  const { sessionId } = req.body;
  const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
  const userAgent = req.headers["user-agent"] || "";

  if (!userId) return res.status(401).json({ error: "Unauthorized access." });
  if (!sessionId) return res.status(400).json({ error: "Session ID is required." });

  try {
    const success = await revokeSession(sessionId, userId);
    if (!success) {
      return res.status(404).json({ error: "Session not found or already terminated." });
    }

    await logAuthEvent({
      userId,
      action: `SESSION_TERMINATED_${sessionId}`,
      ip,
      userAgent
    });

    res.json({ success: true, message: "Session terminated successfully." });
  } catch (err) {
    console.error("Terminate session error:", err);
    res.status(500).json({ error: "Failed to terminate session." });
  }
};

export const terminateAllOtherSessions = async (req: any, res: Response) => {
  const userId = req.user?.userId;
  const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
  const userAgent = req.headers["user-agent"] || "";

  if (!userId) return res.status(401).json({ error: "Unauthorized access." });

  try {
    // Revoke all
    await revokeAllSessions(userId);
    
    // We recreate a session for the current token family in auth middleware later if needed,
    // or keep the current session active by re-inserting it.
    // To simplify: we update all sessions to revoked except the one matching req.userFamily!
    if (req.userFamily) {
      await revokeAllSessions(userId);
      // Re-enable current one
      const now = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await queryRun(
        `UPDATE sessions SET revoked = 0, expiresAt = ? WHERE tokenFamily = ? AND userId = ?`,
        [now, req.userFamily, userId]
      );
    }

    await logAuthEvent({ userId, action: "SESSIONS_TERMINATED_ALL_OTHERS", ip, userAgent });
    res.json({ success: true, message: "All other device sessions revoked." });
  } catch (err) {
    console.error("Revoke all sessions error:", err);
    res.status(500).json({ error: "Failed to revoke sessions." });
  }
};

// Help helper for typing
import { queryRun } from "../db/database";
