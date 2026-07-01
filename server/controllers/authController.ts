import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { queryGet, queryRun } from "../db/database";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../services/tokenService";
import { createSession } from "../services/sessionManager";
import { sendMail } from "../services/mailService";
import { logAuthEvent } from "../services/auditLogger";
import { checkPasswordBreached, checkPasswordHistory } from "../validators/passwordPolicy";
import { incrementAuthFailure, clearAuthFailure } from "../middleware/security";

const BCRYPT_ROUNDS = 12;

// Helper to set cookie headers
const setAuthCookies = (res: Response, refreshToken: string, csrfToken: string) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  
  res.cookie("csrfToken", csrfToken, {
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
  const userAgent = req.headers["user-agent"] || "";

  try {
    // 1. Check if email/username already exists
    const existingUser = await queryGet(
      `SELECT id FROM users WHERE email = ? OR username = ?`,
      [email, username]
    );
    if (existingUser) {
      return res.status(400).json({ error: "Username or Email is already registered." });
    }

    // 2. Check HIBP password breach list
    const isLeaked = await checkPasswordBreached(password);
    if (isLeaked) {
      return res.status(400).json({
        error: "This password has been found in a public data breach. Please choose a different password for your security."
      });
    }

    // 3. Create user record
    const userId = "USR-" + crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const countRow = await queryGet<{ count: number }>(`SELECT COUNT(*) as count FROM users`);
    const isFirstUser = !countRow || countRow.count === 0;
    const role = isFirstUser ? "admin" : "user";
    const permissions = isFirstUser ? JSON.stringify(["admin"]) : JSON.stringify([]);

    await queryRun(
      `INSERT INTO users (id, username, email, passwordHash, twoFactorSecret, role, permissions)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, username, email, passwordHash, verificationToken, role, permissions]
    );

    // Save initial password in history
    await queryRun(
      `INSERT INTO password_history (id, userId, passwordHash) VALUES (?, ?, ?)`,
      ["HST-" + crypto.randomUUID(), userId, passwordHash]
    );

    // 4. Send verification email
    const verificationLink = `https://cynexcloud.eu.cc/verify-email?token=${verificationToken}`;
    await sendMail({
      to: email,
      subject: "Verify your CynexCloud Account",
      templateName: "verify.html",
      replacements: { username, verificationLink }
    });

    await logAuthEvent({ userId, action: "ACCOUNT_REGISTER", ip, userAgent });

    res.status(201).json({
      message: "Registration successful. Please check your email to verify and activate your account."
    });
  } catch (err: any) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Registration failed due to a server error." });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;
  const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
  const userAgent = req.headers["user-agent"] || "";

  if (!token) return res.status(400).json({ error: "Verification token is required." });

  try {
    const user = await queryGet(
      `SELECT id, username, email FROM users WHERE twoFactorSecret = ? AND emailVerified = 0`,
      [token.toString()]
    );

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired activation token." });
    }

    // Activate user
    await queryRun(
      `UPDATE users SET emailVerified = 1, twoFactorSecret = NULL, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [user.id]
    );

    // Send Welcome Email
    await sendMail({
      to: user.email,
      subject: "Welcome to CynexCloud!",
      templateName: "welcome.html",
      replacements: { username: user.username }
    });

    await logAuthEvent({ userId: user.id, action: "EMAIL_VERIFIED", ip, userAgent });

    res.json({ message: "Your email has been verified successfully. You may now log in." });
  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).json({ error: "Failed to verify email." });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
  const userAgent = req.headers["user-agent"] || "";

  try {
    const user = await queryGet(`SELECT * FROM users WHERE email = ?`, [email]);
    if (!user) {
      incrementAuthFailure(ip);
      return res.status(401).json({ error: "Invalid email or password credentials." });
    }

    // Check ban
    if (user.banned === 1) {
      return res.status(403).json({ error: "This account has been suspended for security violations." });
    }

    // Check account lockout
    const now = new Date().toISOString();
    if (user.lockUntil && user.lockUntil > now) {
      return res.status(403).json({
        error: `Account is temporarily locked due to repeated failed logins. Try again after ${new Date(user.lockUntil).toLocaleTimeString()}.`
      });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      incrementAuthFailure(ip);
      const attempts = user.failedLoginAttempts + 1;
      
      if (attempts >= 5) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins lock
        await queryRun(
          `UPDATE users SET failedLoginAttempts = ?, lockUntil = ? WHERE id = ?`,
          [attempts, lockUntil, user.id]
        );
        
        // Dispatch account locked notification
        await sendMail({
          to: user.email,
          subject: "Security Alert: Account Temporarily Locked",
          templateName: "locked.html",
          replacements: { username: user.username, time: new Date(lockUntil).toLocaleTimeString() }
        });

        await logAuthEvent({ userId: user.id, action: "ACCOUNT_LOCKOUT", ip, userAgent });
        return res.status(403).json({ error: "Account locked. 5 failed attempts reached. Security notification sent." });
      }

      await queryRun(`UPDATE users SET failedLoginAttempts = ? WHERE id = ?`, [attempts, user.id]);
      await logAuthEvent({ userId: user.id, action: "LOGIN_FAILED", ip, userAgent });
      return res.status(401).json({ error: "Invalid email or password credentials." });
    }

    // Check verification status
    if (user.emailVerified === 0) {
      return res.status(403).json({ error: "Please verify your email before logging in." });
    }

    // Reset login failures on success
    clearAuthFailure(ip);
    await queryRun(
      `UPDATE users SET failedLoginAttempts = 0, lockUntil = NULL, lastLogin = ?, lastIPAddress = ?, lastUserAgent = ? WHERE id = ?`,
      [now, ip, userAgent, user.id]
    );

    // Setup active session
    const { sessionId, tokenFamily } = await createSession({ userId: user.id, ipAddress: ip, userAgent });

    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: JSON.parse(user.permissions || "[]")
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({
      ...payload,
      tokenFamily,
      version: user.refreshTokenVersion
    });

    const csrfToken = crypto.randomBytes(32).toString("hex");

    setAuthCookies(res, refreshToken, csrfToken);
    await logAuthEvent({ userId: user.id, action: "LOGIN_SUCCESS", ip, userAgent });

    // Send login alert for new devices/countries (optional logic based on lastIPAddress)
    if (user.lastIPAddress && user.lastIPAddress !== ip) {
      await sendMail({
        to: user.email,
        subject: "Security Notice: Login from new location detected",
        templateName: "new_device.html",
        replacements: { username: user.username, ip, device: userAgent.substring(0, 40) }
      });
    }

    res.json({
      accessToken,
      csrfToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal server error during login." });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
  const userAgent = req.headers["user-agent"] || "";

  try {
    const user = await queryGet(`SELECT id, username FROM users WHERE email = ?`, [email]);
    if (!user) {
      // Return 200 regardless to prevent user enumeration security disclosure
      return res.json({ message: "If that email exists, a password reset link has been dispatched." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour expiry

    // Reuse twoFactorSecret for reset token tracking to simplify schema
    await queryRun(
      `UPDATE users SET twoFactorSecret = ?, lockUntil = ? WHERE id = ?`,
      [resetToken, expiry, user.id]
    );

    const resetLink = `https://cynexcloud.eu.cc/reset-password?token=${resetToken}`;
    await sendMail({
      to: email,
      subject: "Password Reset Request",
      templateName: "reset.html",
      replacements: { username: user.username, resetLink }
    });

    await logAuthEvent({ userId: user.id, action: "PASSWORD_RESET_REQUEST", ip, userAgent });

    res.json({ message: "If that email exists, a password reset link has been dispatched." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Failed to process password reset request." });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
  const userAgent = req.headers["user-agent"] || "";

  try {
    const now = new Date().toISOString();
    const user = await queryGet(
      `SELECT id, username, email FROM users WHERE twoFactorSecret = ? AND lockUntil > ?`,
      [token, now]
    );

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired password reset token." });
    }

    // Check history reuse
    const isReused = await checkPasswordHistory(user.id, password);
    if (isReused) {
      return res.status(400).json({ error: "You cannot reuse any of your last 5 passwords." });
    }

    // Check HIBP leaked password
    const isLeaked = await checkPasswordBreached(password);
    if (isLeaked) {
      return res.status(400).json({ error: "This password has been compromised in a public breach. Choose another." });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await queryRun(
      `UPDATE users SET passwordHash = ?, twoFactorSecret = NULL, lockUntil = NULL, failedLoginAttempts = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [passwordHash, user.id]
    );

    // Save to history
    await queryRun(
      `INSERT INTO password_history (id, userId, passwordHash) VALUES (?, ?, ?)`,
      ["HST-" + crypto.randomUUID(), user.id, passwordHash]
    );

    // Dispatch changed email
    await sendMail({
      to: user.email,
      subject: "Security Notification: Password Changed",
      templateName: "changed.html",
      replacements: { username: user.username }
    });

    await logAuthEvent({ userId: user.id, action: "PASSWORD_RESET_SUCCESS", ip, userAgent });

    res.json({ message: "Password updated successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password." });
  }
};

export const logout = async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
  const userAgent = req.headers["user-agent"] || "";
  const token = req.cookies?.refreshToken;

  try {
    if (token) {
      const payload = generateAccessToken({ userId: "", username: "", role: "", permissions: [] }); // Dummy verify fallback
      const verified = generateRefreshToken({ userId: "", username: "", role: "", permissions: [], tokenFamily: "", version: 0 }); // Dummy
      
      const parsed = verifyRefreshToken(token);
      if (parsed) {
        // Revoke current session family
        await queryRun(
          `UPDATE sessions SET revoked = 1 WHERE tokenFamily = ? AND userId = ?`,
          [parsed.tokenFamily, parsed.userId]
        );
        await logAuthEvent({ userId: parsed.userId, action: "LOGOUT", ip, userAgent });
      }
    }
  } catch (err) {
    console.error("Logout DB update failed:", err);
  }

  res.clearCookie("refreshToken");
  res.clearCookie("csrfToken");
  res.json({ success: true, message: "Logged out successfully." });
};
