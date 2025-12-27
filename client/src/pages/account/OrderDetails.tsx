import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../../api/http";
import type { Order, TrackingEvent } from "../../types/models";
import { formatMoney } from "../../utils/format";

export function AccountOrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get(`/api/orders/${id}`);
        if (!mounted) return;
        setOrder(data.order as Order);
        setEvents(data.trackingEvents as TrackingEvent[]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="text-sm text-neutral-600 dark:text-neutral-400">Loading…</div>;
  if (!order) return <div className="text-sm text-neutral-600 dark:text-neutral-400">Not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Order</h1>
          <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{new Date(order.createdAt).toLocaleString()}</div>
          <div className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">Status: {order.status}</div>
          <div className="mt-1 text-xs text-neutral-500">Tracking: {order.trackingId}</div>
        </div>
        <Link to="/track" className="text-sm text-neutral-900 underline dark:text-white">
          Track
        </Link>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
        <div className="text-sm font-medium text-neutral-900 dark:text-white">Items</div>
        <div className="mt-3 space-y-3">
          {order.items.map((i) => (
            <div key={`${i.productId}:${i.size ?? ""}`} className="flex items-center justify-between">
              <div className="text-sm text-neutral-800 dark:text-neutral-200">
                {i.name} {i.size ? `(Size ${i.size})` : ""} × {i.quantity}
              </div>
              <div className="text-sm text-neutral-800 dark:text-neutral-200">{formatMoney(i.price * i.quantity)}</div>
            </div>
          ))}
          <div className="border-t border-neutral-200 pt-3 flex items-center justify-between dark:border-neutral-800">
            <div className="text-sm text-neutral-700 dark:text-neutral-300">Total</div>
            <div className="text-sm font-semibold text-neutral-900 dark:text-white">{formatMoney(order.amountTotal)}</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
        <div className="text-sm font-medium text-neutral-900 dark:text-white">Tracking timeline</div>
        <div className="mt-3 space-y-3">
          {events.map((ev) => (
            <div key={ev._id} className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-black">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-neutral-900 dark:text-white">{ev.status}</div>
                <div className="text-xs text-neutral-500">{new Date(ev.createdAt).toLocaleString()}</div>
              </div>
              <div className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{ev.message}</div>
              {ev.location ? <div className="mt-1 text-xs text-neutral-500">{ev.location}</div> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
