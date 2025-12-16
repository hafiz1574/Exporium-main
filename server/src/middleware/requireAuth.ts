import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

type JwtPayload = {
  userId: string;
};

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.slice("Bearer ".length);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Missing JWT_SECRET" });
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    const user = await User.findById(decoded.userId).select("_id name email role");
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
