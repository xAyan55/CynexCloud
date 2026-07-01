import crypto from "crypto";
import axios from "axios";
import bcrypt from "bcrypt";
import { queryAll } from "../db/database";

export interface PasswordCheckResult {
  valid: boolean;
  message?: string;
}

// 1. Password Strength Policy
export const validatePasswordStrength = (password: string): PasswordCheckResult => {
  if (password.length < 12) {
    return { valid: false, message: "Password must be at least 12 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one digit." };
  }
  if (!/[!@#$%^&*(),.?":{}|<>_]/.test(password)) {
    return { valid: false, message: "Password must contain at least one special character." };
  }
  return { valid: true };
};

// 2. Have I Been Pwned (HIBP) Breached Passwords API Check
export const checkPasswordBreached = async (password: string): Promise<boolean> => {
  try {
    const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
    const prefix = sha1.substring(0, 5);
    const suffix = sha1.substring(5);

    // Fetch hash suffixes matching the first 5 chars
    const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`, {
      timeout: 1200, // 1.2s timeout to prevent API hangs from blocking signup
      headers: { "User-Agent": "CynexCloud-Auth-Shield" }
    });

    const lines = response.data.split("\n");
    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(":");
      if (hashSuffix.trim() === suffix) {
        const count = parseInt(countStr.trim(), 10);
        if (count > 0) return true; // Leaked password!
      }
    }
    return false;
  } catch (err: any) {
    // Fail safe in production if HIBP API is down or throttled
    console.error("HIBP password breach check timed out or failed. Falling safe.", err.message);
    return false;
  }
};

// 3. Password History Check (Limit to last 5 passwords)
export const checkPasswordHistory = async (userId: string, newPassword: string): Promise<boolean> => {
  try {
    const history = await queryAll<{ passwordHash: string }>(
      `SELECT passwordHash FROM password_history WHERE userId = ? ORDER BY createdAt DESC LIMIT 5`,
      [userId]
    );

    for (const record of history) {
      const isMatch = await bcrypt.compare(newPassword, record.passwordHash);
      if (isMatch) return true; // Matches recently used password
    }
    return false;
  } catch (err) {
    console.error("Password history check failed:", err);
    return false;
  }
};
