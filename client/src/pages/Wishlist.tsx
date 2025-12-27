import { useEffect } from "react";
import { Link } from "react-router-dom";

import { ProductCard } from "../components/ProductCard";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchWishlist } from "../store/slices/wishlistSlice";

export function Wishlist() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);
  const wishlist = useAppSelector((s) => s.wishlist.items);

  useEffect(() => {
    if (token) dispatch(fetchWishlist());
  }, [dispatch, token]);

  if (!token) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white/70 p-6 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-300">
        Please <Link to="/login" className="text-neutral-900 underline dark:text-white">log in</Link> to view your wishlist.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="text-sm text-neutral-600 dark:text-neutral-400">No items yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
