import { useEffect, useState } from "react";

import { api } from "../../api/http";
import type { Order, OrderStatus } from "../../types/models";

const statuses: OrderStatus[] = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED_CHINA",
  "IN_TRANSIT",
  "ARRIVED_BD",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELED"
];

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/orders");
      setOrders(data.orders as Order[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(orderId: string, status: OrderStatus) {
    await api.patch(`/api/admin/orders/${orderId}/status`, { status });
    await load();
  }

  async function addTrackingEvent(orderId: string, status: OrderStatus, message: string, location?: string) {
    await api.post(`/api/admin/orders/${orderId}/tracking-events`, { status, message, location });
    await load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Admin orders</h1>

      {loading ? (
        <div className="text-sm text-neutral-600 dark:text-neutral-400">Loading…</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderRow
              key={o._id}
              order={o}
              onStatus={updateStatus}
              onAddEvent={addTrackingEvent}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({
  order,
  onStatus,
  onAddEvent
}: {
  order: Order;
  onStatus: (id: string, s: OrderStatus) => Promise<void>;
  onAddEvent: (id: string, s: OrderStatus, m: string, l?: string) => Promise<void>;
}) {
  const [nextStatus, setNextStatus] = useState<OrderStatus>(order.status);
  const [eventStatus, setEventStatus] = useState<OrderStatus>(order.status);
  const [message, setMessage] = useState("Package update");
  const [location, setLocation] = useState("China");

  return (
    <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">{new Date(order.createdAt).toLocaleString()}</div>
          <div className="mt-1 text-sm text-neutral-900 font-medium dark:text-white">Order {order._id}</div>
          <div className="mt-1 text-xs text-neutral-500">Tracking: {order.trackingId}</div>
        </div>
        <div className="text-sm text-neutral-700 dark:text-neutral-300">Status: {order.status}</div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-black">
          <div className="text-sm font-medium text-neutral-900 dark:text-white">Update status</div>
          <div className="mt-2 flex gap-2">
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
              className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-black dark:text-white"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              onClick={() => onStatus(order._id, nextStatus)}
            >
              Save
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-black">
          <div className="text-sm font-medium text-neutral-900 dark:text-white">Add tracking event</div>
          <div className="mt-2 grid gap-2">
            <select
              value={eventStatus}
              onChange={(e) => setEventStatus(e.target.value as OrderStatus)}
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-black dark:text-white"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-black dark:text-white"
              placeholder="Message"
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-black dark:text-white"
              placeholder="Location"
            />
            <button
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 hover:border-neutral-400 dark:border-neutral-700 dark:text-white dark:hover:border-neutral-500"
              onClick={() => onAddEvent(order._id, eventStatus, message, location || undefined)}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
