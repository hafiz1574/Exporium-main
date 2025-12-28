import { Router } from "express";

import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";

export const employeesRouter = Router();

employeesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await User.find({ role: { $ne: "customer" } })
      .select("_id name role nameColor")
      .sort({ role: 1, createdAt: -1 })
      .limit(500);

    // Put owner first.
    const owner = users.filter((u: any) => u.role === "owner");
    const rest = users.filter((u: any) => u.role !== "owner");

    res.json({ employees: [...owner, ...rest] });
  })
);
