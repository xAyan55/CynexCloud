import { Request, Response, NextFunction } from "express";
import { validatePasswordStrength } from "./passwordPolicy";

export const validateRegisterInput = (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "All registration fields are required." });
  }

  // Validate username
  if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({
      error: "Username must be 3-20 characters long and contain only letters, numbers, and underscores."
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  // Validate passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  // Validate password policy strength
  const strengthCheck = validatePasswordStrength(password);
  if (!strengthCheck.valid) {
    return res.status(400).json({ error: strengthCheck.message });
  }

  next();
};

export const validateLoginInput = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  next();
};

export const validateResetPasswordInput = (req: Request, res: Response, next: NextFunction) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    return res.status(400).json({ error: "Token, password, and confirmation are required." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  const strengthCheck = validatePasswordStrength(password);
  if (!strengthCheck.valid) {
    return res.status(400).json({ error: strengthCheck.message });
  }

  next();
};
