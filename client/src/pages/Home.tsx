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
      <section className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Luxury sneakers. Built for movement.
          </h1>
          <p className="mt-4 text-neutral-300">
            Exporium is a premium sneaker store experience—fast browsing, wishlist, cart, Stripe Checkout,
            and order tracking from China to Bangladesh.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/products"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
            >
              Shop now
            </Link>
            <Link
              to="/track"
              className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-white hover:border-neutral-500"
            >
              Track order
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
