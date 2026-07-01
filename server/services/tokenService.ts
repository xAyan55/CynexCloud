import crypto from "crypto";
import { queryGet, queryRun } from "../db/database";
import { logAuthEvent } from "./auditLogger";

const JWT_SECRET = process.env.JWT_SECRET || "cynex_default_security_secret_2026_super_key";

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  permissions: string[];
}

export interface RefreshTokenPayload extends TokenPayload {
  tokenFamily: string;
  version: number;
}

// HMAC-SHA256 constant-time signature verification helper
const constantTimeCompare = (a: string, b: string): boolean => {
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
};

export const generateAccessToken = (payload: TokenPayload): string => {
  const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes
  const data = { payload, expiry };
  const encodedData = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(encodedData).digest("base64url");
  return `${encodedData}.${signature}`;
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [encodedData, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(encodedData).digest("base64url");
    
    if (!constantTimeCompare(signature, expectedSignature)) return null;

    const data = JSON.parse(Buffer.from(encodedData, "base64url").toString("utf8"));
    if (data.expiry < Date.now()) return null; // Expired
    return data.payload as TokenPayload;
  } catch {
    return null;
  }
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const data = { payload, expiry };
  const encodedData = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(encodedData).digest("base64url");
  return `${encodedData}.${signature}`;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [encodedData, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(encodedData).digest("base64url");
    
    if (!constantTimeCompare(signature, expectedSignature)) return null;

    const data = JSON.parse(Buffer.from(encodedData, "base64url").toString("utf8"));
    if (data.expiry < Date.now()) return null; // Expired
    return data.payload as RefreshTokenPayload;
  } catch {
    return null;
  }
};

// Refresh Token Abuse / Replay Invalidation handler
export const handleTokenRefresh = async (
  rawToken: string,
  ip: string,
  userAgent: string
): Promise<{ accessToken: string; newRefreshToken: string; payload: TokenPayload } | null> => {
  const payload = verifyRefreshToken(rawToken);
  if (!payload) {
    console.warn("Invalid or expired refresh token signature presented.");
    return null;
  }

  // Check if session has been revoked or version mismatches
  const session = await queryGet(
    `SELECT * FROM sessions WHERE tokenFamily = ? AND userId = ?`,
    [payload.tokenFamily, payload.userId]
  );

  if (!session) {
    console.warn("Session token family not found in database.");
    return null;
  }

  if (session.revoked === 1) {
    // SECURITY ALERT: Token family already revoked! Replay detected.
    await logAuthEvent({
      userId: payload.userId,
      action: "SECURITY_ALERT_TOKEN_REPLAY_ATTEMPT",
      ip,
      userAgent
    });
    return null;
  }

  // If client presents a token with version LESS than the version stored in the database,
  // it means they are using an older token that has already been rotated (reused refresh token)!
  // This indicates token theft. We must immediately revoke the entire session tree!
  const user = await queryGet(`SELECT refreshTokenVersion FROM users WHERE id = ?`, [payload.userId]);
  if (!user || payload.version < user.refreshTokenVersion - 1) {
    await queryRun(
      `UPDATE sessions SET revoked = 1 WHERE userId = ?`,
      [payload.userId]
    );
    await logAuthEvent({
      userId: payload.userId,
      action: "SECURITY_ALERT_REFRESH_TOKEN_REUSE_DETECTED",
      ip,
      userAgent
    });
    console.error(`Token reuse detected for user ${payload.userId}. Invalidating all active sessions!`);
    return null;
  }

  // Valid rotation step! Update database metadata
  const newVersion = user.refreshTokenVersion + 1;
  await queryRun(
    `UPDATE users SET refreshTokenVersion = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    [newVersion, payload.userId]
  );
  
  // Extend session active timestamp
  await queryRun(
    `UPDATE sessions SET lastActive = CURRENT_TIMESTAMP WHERE tokenFamily = ?`,
    [payload.tokenFamily]
  );

  const cleanPayload: TokenPayload = {
    userId: payload.userId,
    username: payload.username,
    role: payload.role,
    permissions: payload.permissions
  };

  const newAccessToken = generateAccessToken(cleanPayload);
  const newRefreshToken = generateRefreshToken({
    ...cleanPayload,
    tokenFamily: payload.tokenFamily,
    version: newVersion
  });

  return {
    accessToken: newAccessToken,
    newRefreshToken,
    payload: cleanPayload
  };
};
