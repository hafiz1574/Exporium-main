import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middleware/requireAuth";
import { Product } from "../models/Product";
import { asyncHandler } from "../utils/asyncHandler";
import { getStripe } from "../lib/stripe";

export const checkoutRouter = Router();

const createSessionSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
        size: z.string().optional()
      })
    )
    .min(1)
});

checkoutRouter.post(
  "/create-session",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = createSessionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const stripe = getStripe();

    const products = await Product.find({ _id: { $in: parsed.data.items.map((i) => i.productId) } });
    const productMap = new Map(products.map((p) => [String(p._id), p] as const));

    const line_items = parsed.data.items.map((item) => {
      const p = productMap.get(item.productId);
      if (!p) throw new Error("Product not found");
      return {
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(p.price * 100),
          product_data: {
            name: p.name,
            images: p.images?.slice(0, 1)
          }
        }
      } as const;
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${clientUrl}/account/orders?success=1`,
      cancel_url: `${clientUrl}/cart?canceled=1`,
      metadata: {
        userId: String(req.user!._id),
        items: JSON.stringify(parsed.data.items)
      }
    });

    if (!session.url) return res.status(500).json({ error: "Stripe session missing url" });
    res.json({ url: session.url });
  })
);
