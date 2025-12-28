import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { z } from "zod";

import { User } from "../models/User";
import { sendEmail } from "../lib/mailer";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";

export const authRouter = Router();

function signToken(userId: string, sessionMode: "customer" | "admin") {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  const expiresInEnv = process.env.JWT_EXPIRES_IN;
  const expiresIn: SignOptions["expiresIn"] = expiresInEnv ? (expiresInEnv as any) : "30d";
  return jwt.sign({ userId, sessionMode }, secret, { expiresIn });
}

function sha256Hex(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function makeRandomToken() {
  return crypto.randomBytes(32).toString("hex");
}

function getClientUrl() {
  const url = process.env.CLIENT_URL;
  if (!url) throw new Error("Missing CLIENT_URL");
  return url.replace(/\/$/, "");
}

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8)
});

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const { name, email, password } = parsed.data;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);

    const verificationToken = makeRandomToken();
    const verificationTokenHash = sha256Hex(verificationToken);
    const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "customer",
      emailVerified: false,
      emailVerificationTokenHash: verificationTokenHash,
      emailVerificationExpiresAt: verificationExpiresAt
    });

    const verifyUrl = `${getClientUrl()}/verify-email?token=${verificationToken}`;
    void sendEmail({
      to: user.email,
      subject: "Verify your Exporium account",
      text: `Welcome to Exporium!\n\nPlease verify your email by opening this link:\n${verifyUrl}\n\nThis link expires in 24 hours.`
    });

    res.json({ message: "Verification email sent", email: user.email });
  })
);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  sessionMode: z.enum(["customer", "admin"]).optional()
});

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const { email, password } = parsed.data;
    const sessionMode: "customer" | "admin" = parsed.data.sessionMode ?? "customer";
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    // Only customers must verify email before logging in.
    if (!user.emailVerified && user.role === "customer") {
      return res
        .status(403)
        .json({ error: "Email not verified", code: "EMAIL_NOT_VERIFIED", email: user.email });
    }

    // Admin-mode login is only for staff accounts (non-customer).
    if (sessionMode === "admin" && user.role === "customer") {
      return res.status(403).json({ error: "Forbidden", code: "NOT_ADMIN" });
    }

    const token = signToken(String(user._id), sessionMode);
    res.json({
      token,
      sessionMode,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        nameColor: (user as any).nameColor,
        emailVerified: user.emailVerified
      }
    });
  })
);

authRouter.post(
  "/verify-email",
  asyncHandler(async (req, res) => {
    const schema = z.object({ token: z.string().min(20) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const tokenHash = sha256Hex(parsed.data.token);
    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() }
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired verification link" });

    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    await user.save();

    res.json({ message: "Email verified" });
  })
);

authRouter.post(
  "/resend-verification",
  asyncHandler(async (req, res) => {
    const schema = z.object({ email: z.string().email() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const email = parsed.data.email.toLowerCase();
    const user = await User.findOne({ email });
    if (!user || user.emailVerified) {
      return res.json({ message: "If an account exists, a verification email has been sent" });
    }

    const verificationToken = makeRandomToken();
    user.emailVerificationTokenHash = sha256Hex(verificationToken);
    user.emailVerificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await user.save();

    const verifyUrl = `${getClientUrl()}/verify-email?token=${verificationToken}`;
    void sendEmail({
      to: user.email,
      subject: "Verify your Exporium account",
      text: `Please verify your email by opening this link:\n${verifyUrl}\n\nThis link expires in 24 hours.`
    });

    return res.json({ message: "If an account exists, a verification email has been sent" });
  })
);

authRouter.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const schema = z.object({ email: z.string().email() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const email = parsed.data.email.toLowerCase();
    const user = await User.findOne({ email });

    if (user) {
      const resetToken = makeRandomToken();
      user.passwordResetTokenHash = sha256Hex(resetToken);
      user.passwordResetExpiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h
      await user.save();

      const resetUrl = `${getClientUrl()}/reset-password?token=${resetToken}`;
      void sendEmail({
        to: user.email,
        subject: "Reset your Exporium password",
        text: `You requested a password reset.\n\nOpen this link to set a new password:\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`
      });
    }

    res.json({ message: "If an account exists, a reset email has been sent" });
  })
);

authRouter.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const schema = z.object({ token: z.string().min(20), password: z.string().min(8) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const tokenHash = sha256Hex(parsed.data.token);
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() }
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired reset link" });

    user.passwordHash = await bcrypt.hash(parsed.data.password, 10);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    res.json({ message: "Password updated" });
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);
