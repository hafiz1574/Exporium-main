import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/http";
import { ProductCard } from "../components/ProductCard";
import type { Product } from "../types/models";

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/api/products", { params: { sort: "newest" } });
        if (!mounted) return;
        setProducts((data.products as Product[]).slice(0, 6));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-black">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-black" />
        <div className="pointer-events-none absolute -top-24 right-[-120px] h-80 w-80 rounded-full bg-neutral-900/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-[-120px] h-80 w-80 rounded-full bg-neutral-900/30 blur-3xl" />

        <div className="relative p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-black/40 px-3 py-1 text-xs text-neutral-300">
            Premium sneakers • Worldwide sourcing
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">Exporium</h1>
          <p className="mt-3 max-w-2xl text-neutral-300">
            Find authentic, premium sneakers with simple checkout, wishlist, and clear order tracking.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-neutral-200"
            >
              Shop now
            </Link>
            <Link
              to="/track"
              className="rounded-xl border border-neutral-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-900"
            >
              Track order
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5">
              <div className="text-sm font-medium text-white">Authenticity first</div>
              <div className="mt-1 text-xs text-neutral-400">Curated pairs with clear product details.</div>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5">
              <div className="text-sm font-medium text-white">Fast checkout</div>
              <div className="mt-1 text-xs text-neutral-400">Secure Stripe hosted checkout.</div>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5">
              <div className="text-sm font-medium text-white">Order tracking</div>
              <div className="mt-1 text-xs text-neutral-400">Timeline updates from payment to delivery.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
          <div className="text-white">New drops</div>
          <div className="mt-2 text-sm text-neutral-400">Fresh arrivals and limited pairs.</div>
          <div className="mt-4">
            <Link to="/products" className="text-sm text-white hover:underline">
              Explore products →
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
          <div className="text-white">Wishlist</div>
          <div className="mt-2 text-sm text-neutral-400">Save favorites and buy later.</div>
          <div className="mt-4">
            <Link to="/wishlist" className="text-sm text-white hover:underline">
              View wishlist →
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
          <div className="text-white">Need tracking?</div>
          <div className="mt-2 text-sm text-neutral-400">Use your tracking ID to see shipment events.</div>
          <div className="mt-4">
            <Link to="/track" className="text-sm text-white hover:underline">
              Track an order →
            </Link>
          </div>
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Newest drops</h2>
          <Link to="/products" className="text-sm text-neutral-300 hover:text-white">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="text-sm text-neutral-400">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
