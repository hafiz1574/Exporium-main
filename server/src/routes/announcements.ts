import { Router } from "express";

import { Announcement } from "../models/Announcement";
import { asyncHandler } from "../utils/asyncHandler";

export const announcementsRouter = Router();

// Public: show active announcements (latest first)
announcementsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const announcements = await Announcement.find({ active: true })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ announcements });
  })
);
