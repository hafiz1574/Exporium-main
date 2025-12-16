import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../api/http";
import type { Order } from "../../types/models";
import { formatMoney } from "../../utils/format";

export function AccountOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/api/orders/my");
        if (!mounted) return;
        setOrders(data.orders as Order[]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-white">My orders</h1>

      {loading ? (
        <div className="text-sm text-neutral-400">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="text-sm text-neutral-400">No orders yet.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o._id}
              to={`/account/orders/${o._id}`}
              className="block rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 hover:border-neutral-700"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-400">{new Date(o.createdAt).toLocaleString()}</div>
                <div className="text-sm text-white font-medium">{formatMoney(o.amountTotal)}</div>
              </div>
              <div className="mt-2 text-sm text-neutral-300">Status: {o.status}</div>
              <div className="mt-1 text-xs text-neutral-500">Tracking: {o.trackingId}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
