import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";

import { Product } from "../models/Product";
import { asyncHandler } from "../utils/asyncHandler";

export const productsRouter = Router();

productsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const querySchema = z.object({
      search: z.string().optional(),
      category: z.string().optional(),
      sort: z.enum(["price_asc", "price_desc", "newest"]).optional()
    });

    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: "Invalid query" });

    const { search, category, sort } = parsed.data;

    const filter: Record<string, any> = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (category) filter.category = category;

    let q = Product.find(filter);

    if (sort === "price_asc") q = q.sort({ price: 1 });
    if (sort === "price_desc") q = q.sort({ price: -1 });
    if (sort === "newest") q = q.sort({ createdAt: -1 });

    const products = await q.limit(200);
    res.json({ products });
  })
);

productsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid id" });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json({ product });
  })
);
