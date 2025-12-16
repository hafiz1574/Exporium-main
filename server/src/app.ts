import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";

import { authRouter } from "./routes/auth";
import { productsRouter } from "./routes/products";
import { wishlistRouter } from "./routes/wishlist";
import { checkoutRouter } from "./routes/checkout";
import { ordersRouter } from "./routes/orders";
import { adminRouter } from "./routes/admin";
import { trackingRouter } from "./routes/tracking";
import { stripeWebhooksRouter } from "./routes/webhooks";

export const app = express();

const clientUrl = process.env.CLIENT_URL;

app.use(
  cors({
    origin: clientUrl || true,
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Stripe-Signature",
      "X-Requested-With"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  })
);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// Stripe webhook must receive the raw body; mount BEFORE express.json().
app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));
app.use("/api/webhooks", stripeWebhooksRouter);

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/tracking", trackingRouter);

app.use((req: Request, _res: Response, next: NextFunction) => {
  const err = new Error(`Not found: ${req.method} ${req.path}`);
  (err as any).statusCode = 404;
  next(err);
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const statusCode = typeof err?.statusCode === "number" ? err.statusCode : 500;
  const message = typeof err?.message === "string" ? err.message : "Server error";
  res.status(statusCode).json({ error: message });
});
