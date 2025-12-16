import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
};

type CartState = {
  items: CartItem[];
};

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem("exporium_cart");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem("exporium_cart", JSON.stringify(items));
}

const initialState: CartState = {
  items: loadCart()
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const incoming = action.payload;
      const existing = state.items.find(
        (i) => i.productId === incoming.productId && (i.size ?? "") === (incoming.size ?? "")
      );
      if (existing) {
        existing.quantity += incoming.quantity;
      } else {
        state.items.push(incoming);
      }
      saveCart(state.items);
    },
    removeFromCart(state, action: PayloadAction<{ productId: string; size?: string }>) {
      state.items = state.items.filter(
        (i) => !(i.productId === action.payload.productId && (i.size ?? "") === (action.payload.size ?? ""))
      );
      saveCart(state.items);
    },
    setQuantity(
      state,
      action: PayloadAction<{ productId: string; size?: string; quantity: number }>
    ) {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId && (i.size ?? "") === (action.payload.size ?? "")
      );
      if (item) item.quantity = Math.max(1, action.payload.quantity);
      saveCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      saveCart(state.items);
    }
  }
});

export const { addToCart, removeFromCart, setQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
