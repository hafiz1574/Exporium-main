import { Router } from "express";
import type Stripe from "stripe";

import { getStripe } from "../lib/stripe";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { TrackingEvent } from "../models/TrackingEvent";
import { asyncHandler } from "../utils/asyncHandler";
import { generateTrackingId } from "../utils/tracking";

export const stripeWebhooksRouter = Router();

stripeWebhooksRouter.post(
  "/stripe",
  asyncHandler(async (req, res) => {
    const stripe = getStripe();
    const signature = req.headers["stripe-signature"] as string | undefined;
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return res.status(400).json({ error: "Missing Stripe signature/secret" });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, secret);
    } catch (err: any) {
      return res.status(400).json({ error: `Webhook signature verification failed: ${err?.message ?? ""}` });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const itemsRaw = session.metadata?.items;
      if (userId && itemsRaw) {
        const items = JSON.parse(itemsRaw) as Array<{ productId: string; quantity: number; size?: string }>;
        const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } });
        const productMap = new Map(products.map((p) => [String(p._id), p]));

        const orderItems = items.map((i) => {
          const p = productMap.get(i.productId);
          if (!p) throw new Error("Product missing during webhook processing");
          return {
            productId: p._id,
            name: p.name,
            image: p.images[0],
            size: i.size,
            price: p.price,
            quantity: i.quantity
          };
        });

        const amountTotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

        let trackingId = generateTrackingId();
        // Ensure unique in DB.
        for (let tries = 0; tries < 3; tries++) {
          const exists = await Order.exists({ trackingId });
          if (!exists) break;
          trackingId = generateTrackingId();
        }

        const created = await Order.create({
          userId,
          items: orderItems,
          amountTotal,
          currency: (session.currency ?? "usd").toLowerCase(),
          paymentStatus: "PAID",
          status: "CONFIRMED",
          trackingId,
          stripeSessionId: session.id,
          customerEmail: session.customer_details?.email ?? session.customer_email ?? undefined
        });

        await TrackingEvent.create({
          orderId: created._id,
          trackingId,
          status: "CONFIRMED",
          message: "Order confirmed. Preparing shipment.",
          location: "China"
        });
      }
    }

    res.json({ received: true });
  })
);
