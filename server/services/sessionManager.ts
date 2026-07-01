import { queryAll, queryRun, queryGet } from "../db/database";
import crypto from "crypto";

export interface SessionData {
  id: string;
  userId: string;
  tokenFamily: string;
  device: string;
  browser: string;
  ipAddress: string;
  country: string;
  userAgent: string;
  lastActive: string;
  expiresAt: string;
  revoked: number;
}

// Simple browser/device parsing helpers
const parseUA = (ua: string) => {
  let device = "Desktop";
  let browser = "Unknown Browser";

  if (/mobile|android|iphone|ipad/i.test(ua)) {
    device = "Mobile";
  } else if (/tablet/i.test(ua)) {
    device = "Tablet";
  }

  if (/firefox/i.test(ua)) {
    browser = "Firefox";
  } else if (/chrome|crios/i.test(ua)) {
    browser = "Chrome";
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browser = "Safari";
  } else if (/msie|trident/i.test(ua)) {
    browser = "Internet Explorer";
  } else if (/edg/i.test(ua)) {
    browser = "Edge";
  }

  return { device, browser };
};

export const createSession = async (params: {
  userId: string;
  ipAddress: string;
  userAgent: string;
  country?: string;
}): Promise<{ sessionId: string; tokenFamily: string }> => {
  const sessionId = "SESS-" + crypto.randomUUID();
  const tokenFamily = "FAM-" + crypto.randomUUID();
  const { device, browser } = parseUA(params.userAgent);
  const country = params.country || "US";
  
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  await queryRun(
    `INSERT INTO sessions (id, userId, tokenFamily, device, browser, ipAddress, country, userAgent, expiresAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [sessionId, params.userId, tokenFamily, device, browser, params.ipAddress, country, params.userAgent, expiresAt]
  );

  return { sessionId, tokenFamily };
};

export const listActiveSessions = async (userId: string): Promise<SessionData[]> => {
  // Return only non-revoked sessions that haven't expired yet
  const now = new Date().toISOString();
  return queryAll<SessionData>(
    `SELECT * FROM sessions WHERE userId = ? AND revoked = 0 AND expiresAt > ?`,
    [userId, now]
  );
};

export const revokeSession = async (sessionId: string, userId: string): Promise<boolean> => {
  const result = await queryRun(
    `UPDATE sessions SET revoked = 1 WHERE id = ? AND userId = ?`,
    [sessionId, userId]
  );
  return result.changes > 0;
};

export const revokeAllSessions = async (userId: string): Promise<void> => {
  await queryRun(
    `UPDATE sessions SET revoked = 1 WHERE userId = ?`,
    [userId]
  );
};

export const updateSessionActivity = async (tokenFamily: string): Promise<void> => {
  await queryRun(
    `UPDATE sessions SET lastActive = CURRENT_TIMESTAMP WHERE tokenFamily = ? AND revoked = 0`,
    [tokenFamily]
  );
};
