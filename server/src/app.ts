import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";

import { authRouter } from "./routes/auth";
import { productsRouter } from "./routes/products";
import { wishlistRouter } from "./routes/wishlist";
import { ordersRouter } from "./routes/orders";
import { adminRouter } from "./routes/admin";
import { trackingRouter } from "./routes/tracking";
import { employeesRouter } from "./routes/employees";
import { announcementsRouter } from "./routes/announcements";

export const app = express();

const clientUrl = process.env.CLIENT_URL ?? process.env.CORS_ORIGINS;

function parseCorsOrigin(input?: string) {
  if (!input) return true;
  const trimmed = input.trim();
  if (!trimmed) return true;
  if (trimmed === "*") return true;
  const parts = trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length <= 1 ? (parts[0] ?? true) : parts;
}

app.use(
  cors({
    origin: parseCorsOrigin(clientUrl),
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  })
);

app.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "exporium-api", health: "/health" });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.get("/healthz", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/announcements", announcementsRouter);
app.use("/api/wishlist", wishlistRouter);
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
