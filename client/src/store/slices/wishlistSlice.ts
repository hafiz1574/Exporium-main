import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api } from "../../api/http";
import type { Product } from "../../types/models";

type WishlistState = {
  items: Product[];
  status: "idle" | "loading" | "failed";
};

const initialState: WishlistState = {
  items: [],
  status: "idle"
};

export const fetchWishlist = createAsyncThunk("wishlist/fetch", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/api/wishlist");
    return data as { wishlist: Product[] };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.error ?? "Failed to load wishlist");
  }
});

export const addWishlist = createAsyncThunk(
  "wishlist/add",
  async (productId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/api/wishlist/${productId}`);
      return data as { wishlist: Product[] };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.error ?? "Failed to add to wishlist");
    }
  }
);

export const removeWishlist = createAsyncThunk(
  "wishlist/remove",
  async (productId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/api/wishlist/${productId}`);
      return data as { wishlist: Product[] };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.error ?? "Failed to remove from wishlist");
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist(state) {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload.wishlist;
      })
      .addCase(fetchWishlist.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(addWishlist.fulfilled, (state, action) => {
        state.items = action.payload.wishlist;
      })
      .addCase(removeWishlist.fulfilled, (state, action) => {
        state.items = action.payload.wishlist;
      });
  }
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
