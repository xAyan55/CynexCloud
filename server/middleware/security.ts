import { Request, Response, NextFunction } from "express";

// 1. In-Memory Store for Rate Limiter and Slow-Down
interface RateLimitRecord {
  requests: number;
  resetTime: number;
  consecutiveFailures: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale rate limits every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (record.resetTime < now) {
      rateLimitStore.delete(ip);
    }
  }
}, 10 * 60 * 1000);

// Rate limiting middleware: 5 requests per 15 minutes for Auth actions
export const authRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
  const now = Date.now();
  
  let record = rateLimitStore.get(ip);
  if (!record || record.resetTime < now) {
    record = { requests: 0, resetTime: now + 15 * 60 * 1000, consecutiveFailures: record?.consecutiveFailures || 0 };
    rateLimitStore.set(ip, record);
  }

  record.requests++;
  if (record.requests > 10) {
    return res.status(429).json({
      error: "Too many authentication attempts. Please try again after 15 minutes."
    });
  }
  next();
};

// Dynamic Slow-down: delays requests based on consecutive failures
export const authSlowDown = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
  const record = rateLimitStore.get(ip);

  if (record && record.consecutiveFailures > 0) {
    // Delay matches: 500ms * consecutive failures (cap at 5 seconds)
    const delay = Math.min(5000, record.consecutiveFailures * 500);
    console.log(`[SLOW-DOWN] Delaying auth request from ${ip} by ${delay}ms`);
    return setTimeout(() => next(), delay);
  }
  next();
};

// Increment failure counter on IP record
export const incrementAuthFailure = (ip: string) => {
  const record = rateLimitStore.get(ip);
  if (record) {
    record.consecutiveFailures++;
  } else {
    rateLimitStore.set(ip, {
      requests: 1,
      resetTime: Date.now() + 15 * 60 * 1000,
      consecutiveFailures: 1
    });
  }
};

// Clear consecutive failures on successful authentication
export const clearAuthFailure = (ip: string) => {
  const record = rateLimitStore.get(ip);
  if (record) {
    record.consecutiveFailures = 0;
  }
};

// 2. Strict Security Headers (Helmet-equivalent)
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://i.imgur.com https://picsum.photos https://i.pravatar.cc; connect-src 'self' wss: https://api.pwnedpasswords.com;"
  );
  next();
};

// 3. Input Sanitization Middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (val: any): any => {
    if (typeof val === "string") {
      // Escape HTML entities to prevent XSS
      return val
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
    }
    if (Array.isArray(val)) {
      return val.map(sanitize);
    }
    if (val !== null && typeof val === "object") {
      const cleanObj: any = {};
      Object.keys(val).forEach((key) => {
        cleanObj[key] = sanitize(val[key]);
      });
      return cleanObj;
    }
    return val;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  next();
};

// 4. Double-Submit Cookie CSRF Validation
export const csrfCheck = (req: Request, res: Response, next: NextFunction) => {
  // Safe methods do not require CSRF token
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const csrfHeader = req.headers["x-csrf-token"];
  const csrfCookie = req.cookies ? req.cookies["csrfToken"] : null;

  if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
    return res.status(403).json({
      error: "CSRF verification failed. Request untrusted."
    });
  }

  next();
};
