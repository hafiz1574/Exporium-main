import { useEffect, useMemo, useState } from "react";

import { api } from "../api/http";
import { ProductCard } from "../components/ProductCard";
import type { Product } from "../types/models";

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc">("newest");

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { sort };
      if (search.trim()) params.search = search.trim();
      if (category.trim()) params.category = category.trim();

      const { data } = await api.get("/api/products", { params });
      setProducts(data.products as Product[]);
    } catch (err: any) {
      setProducts([]);
      setError(err?.response?.data?.error || err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-xs text-neutral-600 dark:text-neutral-400">Search</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sneakers"
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-800 dark:bg-black dark:text-white dark:placeholder:text-neutral-600"
          />
        </div>

        <div>
          <label className="text-xs text-neutral-600 dark:text-neutral-400">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-black dark:text-white"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-neutral-600 dark:text-neutral-400">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-black dark:text-white"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>

        <button
          onClick={fetchProducts}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Apply
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-neutral-600 dark:text-neutral-400">Loading…</div>
      ) : error ? (
        <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-200">
          <div className="font-medium text-neutral-900 dark:text-white">Couldn’t load products</div>
          <div className="mt-1 text-neutral-600 dark:text-neutral-400">{error}</div>
          <div className="mt-3">
            <button
              onClick={fetchProducts}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
