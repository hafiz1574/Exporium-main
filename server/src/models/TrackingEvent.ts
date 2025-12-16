import mongoose, { type InferSchemaType } from "mongoose";
import { ORDER_STATUSES } from "./Order";

const trackingEventSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    trackingId: { type: String, required: true, index: true },
    status: { type: String, enum: ORDER_STATUSES, required: true },
    message: { type: String, required: true },
    location: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

export type ITrackingEvent = InferSchemaType<typeof trackingEventSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TrackingEvent = mongoose.model<ITrackingEvent>("TrackingEvent", trackingEventSchema);
