import type { NextFunction, Request, Response } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.sessionMode !== "admin") return res.status(403).json({ error: "Forbidden" });
  if (!["owner", "admin", "manager", "editor"].includes(req.user.role as any)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  return next();
}
