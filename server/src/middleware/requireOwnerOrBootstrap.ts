import type { NextFunction, Request, Response } from "express";

import { User } from "../models/User";

export async function requireOwnerOrBootstrap(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.sessionMode !== "admin") return res.status(403).json({ error: "Forbidden" });

  if (req.user.role === "owner") return next();

  // Bootstrap: allow an admin to set the first owner when none exists yet.
  if (req.user.role === "admin") {
    const ownerExists = await User.exists({ role: "owner" });
    if (!ownerExists) return next();
  }

  return res.status(403).json({ error: "Forbidden" });
}
