import mongoose, { type InferSchemaType } from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type IAnnouncement = InferSchemaType<typeof announcementSchema> & { _id: mongoose.Types.ObjectId };

export const Announcement = mongoose.model<IAnnouncement>("Announcement", announcementSchema);
