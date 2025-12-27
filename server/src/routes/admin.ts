import { Router } from "express";
import multer from "multer";
import streamifier from "streamifier";
import mongoose from "mongoose";
import { z } from "zod";

import { requireAuth } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import { requireOwner } from "../middleware/requireOwner";
import { requireOwnerOrBootstrap } from "../middleware/requireOwnerOrBootstrap";
import { Product } from "../models/Product";
import { Order, ORDER_STATUSES } from "../models/Order";
import { TrackingEvent } from "../models/TrackingEvent";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { getCloudinary } from "../lib/cloudinary";

export const adminRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

adminRouter.post(
  "/upload",
  requireAuth,
  requireAdmin,
  upload.array("images", 10),
  asyncHandler(async (req, res) => {
    const files = (req.files ?? []) as Express.Multer.File[];
    if (!files.length) return res.status(400).json({ error: "No images provided" });

    const cloudinary = getCloudinary();

    const urls = await Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "exporium/products" },
              (err, result) => {
                if (err || !result?.secure_url) return reject(err ?? new Error("Upload failed"));
                resolve(result.secure_url);
              }
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
          })
      )
    );

    res.json(urls);
  })
);

const productUpsertSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  images: z.array(z.string().url()).min(1),
  sizes: z.array(z.string().min(1)).min(1),
  stock: z.number().int().min(0)
});

adminRouter.post(
  "/products",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = productUpsertSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const created = await Product.create(parsed.data);
    res.status(201).json({ product: created });
  })
);

adminRouter.put(
  "/products/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid id" });

    const parsed = productUpsertSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const updated = await Product.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!updated) return res.status(404).json({ error: "Not found" });

    res.json({ product: updated });
  })
);

adminRouter.delete(
  "/products/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid id" });

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Not found" });

    res.json({ ok: true });
  })
);

adminRouter.get(
  "/orders",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(500);
    res.json({ orders });
  })
);

adminRouter.patch(
  "/orders/:id/status",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid id" });

    const schema = z.object({ status: z.enum(ORDER_STATUSES) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const updated = await Order.findByIdAndUpdate(id, { status: parsed.data.status }, { new: true });
    if (!updated) return res.status(404).json({ error: "Not found" });

    await TrackingEvent.create({
      orderId: updated._id,
      trackingId: updated.trackingId,
      status: parsed.data.status,
      message: `Status updated to ${parsed.data.status}`
    });

    res.json({ order: updated });
  })
);

adminRouter.post(
  "/orders/:id/tracking-events",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid id" });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Not found" });

    const schema = z.object({
      status: z.enum(ORDER_STATUSES),
      message: z.string().min(1),
      location: z.string().optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const created = await TrackingEvent.create({
      orderId: order._id,
      trackingId: order.trackingId,
      status: parsed.data.status,
      message: parsed.data.message,
      location: parsed.data.location
    });

    res.status(201).json({ trackingEvent: created });
  })
);

adminRouter.get(
  "/customers",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const customers = await User.find({ role: "customer" }).select("_id name email createdAt").sort({ createdAt: -1 }).limit(500);
    res.json({ customers });
  })
);

adminRouter.get(
  "/dashboard",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const [products, orders, customers] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: "customer" })
    ]);
    res.json({ counts: { products, orders, customers } });
  })
);

adminRouter.get(
  "/users",
  requireAuth,
  requireOwnerOrBootstrap,
  asyncHandler(async (_req, res) => {
    const users = await User.find()
      .select("_id name email role emailVerified createdAt")
      .sort({ createdAt: -1 })
      .limit(1000);
    res.json({ users });
  })
);

adminRouter.patch(
  "/users/:id/role",
  requireAuth,
  requireOwnerOrBootstrap,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid id" });

    const schema = z.object({ role: z.enum(["customer", "admin", "owner"]) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const role = parsed.data.role;

    // Enforce only one owner.
    if (role === "owner") {
      await User.updateMany({ role: "owner" }, { $set: { role: "admin" } });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true, select: "_id name email role emailVerified createdAt" }
    );

    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ user: updated });
  })
);

adminRouter.delete(
  "/users/:id",
  requireAuth,
  requireOwnerOrBootstrap,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid id" });

    if (String(req.user?._id) === String(id)) {
      return res.status(400).json({ error: "You cannot delete your own account" });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Not found" });

    res.json({ ok: true });
  })
);
