import { Router } from "express";
import multer from "multer";
import streamifier from "streamifier";
import mongoose from "mongoose";
import { z } from "zod";

import { requireAuth } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import { requireOwner } from "../middleware/requireOwner";
import { Product } from "../models/Product";
import { Order, ORDER_STATUSES } from "../models/Order";
import { TrackingEvent } from "../models/TrackingEvent";
import { User } from "../models/User";
import { Announcement } from "../models/Announcement";
import { asyncHandler } from "../utils/asyncHandler";
import { getCloudinary } from "../lib/cloudinary";

export const adminRouter = Router();

const ALLOWED_NAME_COLORS = [
  "text-cyan-400",
  "text-fuchsia-400",
  "text-lime-400",
  "text-yellow-300",
  "text-emerald-400",
  "text-sky-400",
  "text-violet-400",
  "text-rose-400",
  "text-orange-300",
  "text-white"
] as const;

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
  "/announcements",
  requireAuth,
  requireOwner,
  asyncHandler(async (_req, res) => {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(200);
    res.json({ announcements });
  })
);

adminRouter.post(
  "/announcements",
  requireAuth,
  requireOwner,
  asyncHandler(async (req, res) => {
    const schema = z.object({ title: z.string().min(1).max(120), message: z.string().min(1).max(2000), active: z.boolean().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const created = await Announcement.create({
      title: parsed.data.title,
      message: parsed.data.message,
      active: parsed.data.active ?? true
    });
    res.status(201).json({ announcement: created });
  })
);

adminRouter.patch(
  "/announcements/:id",
  requireAuth,
  requireOwner,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid id" });

    const schema = z.object({ title: z.string().min(1).max(120).optional(), message: z.string().min(1).max(2000).optional(), active: z.boolean().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const updated = await Announcement.findByIdAndUpdate(id, { $set: parsed.data }, { new: true });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ announcement: updated });
  })
);

adminRouter.delete(
  "/announcements/:id",
  requireAuth,
  requireOwner,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid id" });
    const deleted = await Announcement.findByIdAndDelete(id);
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
  requireOwner,
  asyncHandler(async (_req, res) => {
    const users = await User.find()
      .select("_id name email role nameColor emailVerified createdAt")
      .sort({ createdAt: -1 })
      .limit(1000);
    res.json({ users });
  })
);

adminRouter.patch(
  "/users/:id/role",
  requireAuth,
  requireOwner,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid id" });

    const schema = z.object({ role: z.enum(["customer", "manager", "editor", "owner"]) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const role = parsed.data.role;

    // Enforce only one owner.
    if (role === "owner") {
      await User.updateMany({ role: "owner" }, { $set: { role: "manager" } });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true, select: "_id name email role nameColor emailVerified createdAt" }
    );

    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ user: updated });
  })
);

adminRouter.patch(
  "/users/:id/name-color",
  requireAuth,
  requireOwner,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid id" });

    const schema = z.object({ nameColor: z.string().optional().nullable() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const nameColor = (parsed.data.nameColor ?? "").trim();
    if (nameColor && !ALLOWED_NAME_COLORS.includes(nameColor as any)) {
      return res.status(400).json({ error: "Invalid color" });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: { nameColor: nameColor || undefined } },
      { new: true, select: "_id name email role nameColor emailVerified createdAt" }
    );

    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ user: updated });
  })
);

adminRouter.delete(
  "/users/:id",
  requireAuth,
  requireOwner,
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
