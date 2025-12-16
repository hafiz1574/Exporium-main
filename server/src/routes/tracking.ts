import { Router } from "express";

import { Order } from "../models/Order";
import { TrackingEvent } from "../models/TrackingEvent";
import { asyncHandler } from "../utils/asyncHandler";

export const trackingRouter = Router();

trackingRouter.get(
  "/:trackingId",
  asyncHandler(async (req, res) => {
    const { trackingId } = req.params;
    const order = await Order.findOne({ trackingId });
    if (!order) return res.status(404).json({ error: "Not found" });

    const events = await TrackingEvent.find({ trackingId }).sort({ createdAt: 1 });
    res.json({ order, trackingEvents: events });
  })
);
