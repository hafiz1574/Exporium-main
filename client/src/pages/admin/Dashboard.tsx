import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../api/http";

export function AdminDashboard() {
  const [counts, setCounts] = useState<{ products: number; orders: number; customers: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await api.get("/api/admin/dashboard");
      if (mounted) setCounts(data.counts);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Admin</h1>
        <div className="flex gap-3 text-sm">
          <Link to="/admin/products" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
            Products
          </Link>
          <Link to="/admin/orders" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
            Orders
          </Link>
          <Link to="/admin/customers" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
            Customers
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
          <div className="text-xs text-neutral-500">Products</div>
          <div className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">{counts?.products ?? "—"}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
          <div className="text-xs text-neutral-500">Orders</div>
          <div className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">{counts?.orders ?? "—"}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
          <div className="text-xs text-neutral-500">Customers</div>
          <div className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">{counts?.customers ?? "—"}</div>
        </div>
      </div>
    </div>
  );
}
