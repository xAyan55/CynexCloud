import { queryRun } from "../db/database";
import crypto from "crypto";

export interface LogAuthEventParams {
  userId: string | null;
  action: string;
  ip: string;
  userAgent: string;
  country?: string;
}

export const logAuthEvent = async (params: LogAuthEventParams) => {
  const id = "LOG-" + crypto.randomUUID();
  
  let device = "Desktop";
  let browser = "Unknown Browser";
  
  const ua = params.userAgent || "";
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

  const country = params.country || "US";

  try {
    await queryRun(
      `INSERT INTO audit_logs (id, userId, action, ip, device, browser, country, userAgent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, params.userId, params.action, params.ip, device, browser, country, params.userAgent]
    );
    console.log(`[AUDIT LOG] ${params.action} recorded for user ${params.userId || 'Guest'}`);
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
};
