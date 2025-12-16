import mongoose, { type InferSchemaType } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    brand: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String, required: true }],
    sizes: [{ type: String, required: true }],
    stock: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

export type IProduct = InferSchemaType<typeof productSchema> & { _id: mongoose.Types.ObjectId };

export const Product = mongoose.model<IProduct>("Product", productSchema);
