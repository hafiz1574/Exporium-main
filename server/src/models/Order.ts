import mongoose, { type InferSchemaType } from "mongoose";

export const ORDER_STATUSES = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED_CHINA",
  "IN_TRANSIT",
  "ARRIVED_BD",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELED"
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    size: { type: String },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    amountTotal: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "usd" },
    paymentStatus: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING" },
    status: { type: String, enum: ORDER_STATUSES, default: "CONFIRMED", index: true },
    trackingId: { type: String, required: true, unique: true, index: true },
    customerEmail: { type: String }
  },
  { timestamps: true }
);

export type IOrder = InferSchemaType<typeof orderSchema> & { _id: mongoose.Types.ObjectId };

export const Order = mongoose.model<IOrder>("Order", orderSchema);
