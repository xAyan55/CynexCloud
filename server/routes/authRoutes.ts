import { Router, Response, NextFunction } from "express";
import {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  logout
} from "../controllers/authController";
import {
  getSessions,
  terminateSession,
  terminateAllOtherSessions
} from "../controllers/sessionController";
import {
  validateRegisterInput,
  validateLoginInput,
  validateResetPasswordInput
} from "../validators/authValidators";
import {
  authRateLimiter,
  authSlowDown,
  csrfCheck
} from "../middleware/security";
import { verifyAccessToken, handleTokenRefresh, verifyRefreshToken } from "../services/tokenService";

const router = Router();

// JWT Verification Middleware
export const requireAuth = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token missing or invalid." });
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Token expired. Please rotate session." });
  }

  req.user = payload;
  
  // Extract tokenFamily from refresh token if possible to correlate current session
  const refreshCookie = req.cookies?.refreshToken;
  if (refreshCookie) {
    const verifiedRefresh = verifyRefreshToken(refreshCookie);
    if (verifiedRefresh) {
      req.userFamily = verifiedRefresh.tokenFamily;
    }
  }

  next();
};

// 1. Auth Endpoint mappings
router.post("/register", authRateLimiter, validateRegisterInput, register);
router.get("/verify-email", verifyEmail);
router.post("/login", authRateLimiter, authSlowDown, validateLoginInput, login);
router.post("/forgot-password", authRateLimiter, forgotPassword);
router.post("/reset-password", validateResetPasswordInput, resetPassword);
router.post("/logout", logout);

// 2. Token refresh endpoint
router.post("/refresh", async (req, res) => {
  const refreshCookie = req.cookies?.refreshToken;
  const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
  const userAgent = req.headers["user-agent"] || "";

  if (!refreshCookie) {
    return res.status(401).json({ error: "Refresh token missing." });
  }

  const tokens = await handleTokenRefresh(refreshCookie, ip, userAgent);
  if (!tokens) {
    // Clear cookies on replay/theft block
    res.clearCookie("refreshToken");
    res.clearCookie("csrfToken");
    return res.status(401).json({ error: "Session expired or replay detected. Please re-authenticate." });
  }

  // Set new rotated cookies
  res.cookie("refreshToken", tokens.newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    accessToken: tokens.accessToken,
    user: tokens.payload
  });
});

// 3. User Session mappings (JWT Secured)
router.get("/sessions", requireAuth, getSessions);
router.post("/sessions/terminate", requireAuth, csrfCheck, terminateSession);
router.post("/sessions/terminate-others", requireAuth, csrfCheck, terminateAllOtherSessions);

export default router;
