import { Router } from "express";
import mongoose from "mongoose";

import { requireAuth } from "../middleware/requireAuth";
import { Order } from "../models/Order";
import { TrackingEvent } from "../models/TrackingEvent";
import { asyncHandler } from "../utils/asyncHandler";

export const ordersRouter = Router();

ordersRouter.get(
  "/my",
  requireAuth,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ userId: req.user!._id }).sort({ createdAt: -1 }).limit(200);
    res.json({ orders });
  })
);

ordersRouter.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid id" });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Not found" });
    if (String(order.userId) !== String(req.user!._id)) return res.status(403).json({ error: "Forbidden" });

    const events = await TrackingEvent.find({ orderId: order._id }).sort({ createdAt: 1 });
    res.json({ order, trackingEvents: events });
  })
);
