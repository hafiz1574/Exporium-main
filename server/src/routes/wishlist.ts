import { Router } from "express";
import mongoose from "mongoose";

import { requireAuth } from "../middleware/requireAuth";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";

export const wishlistRouter = Router();

wishlistRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!._id).populate("wishlist");
    res.json({ wishlist: user?.wishlist ?? [] });
  })
);

wishlistRouter.post(
  "/:productId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) return res.status(400).json({ error: "Invalid productId" });

    await User.updateOne(
      { _id: req.user!._id },
      { $addToSet: { wishlist: new mongoose.Types.ObjectId(productId) } }
    );

    const user = await User.findById(req.user!._id).populate("wishlist");
    res.json({ wishlist: user?.wishlist ?? [] });
  })
);

wishlistRouter.delete(
  "/:productId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) return res.status(400).json({ error: "Invalid productId" });

    await User.updateOne(
      { _id: req.user!._id },
      { $pull: { wishlist: new mongoose.Types.ObjectId(productId) } }
    );

    const user = await User.findById(req.user!._id).populate("wishlist");
    res.json({ wishlist: user?.wishlist ?? [] });
  })
);
