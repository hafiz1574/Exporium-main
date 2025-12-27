import { useState } from "react";

import { api } from "../api/http";
import type { Order, TrackingEvent } from "../types/models";

export function Track() {
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ order: Order; trackingEvents: TrackingEvent[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setData(null);

    try {
      const res = await api.get(`/api/tracking/${trackingId.trim()}`);
      setData(res.data as any);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Not found");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Track your order</h1>

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40 sm:flex-row"
      >
        <input
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          placeholder="Enter tracking ID"
          className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-800 dark:bg-black dark:text-white dark:placeholder:text-neutral-600"
          required
        />
        <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200">
          {loading ? "Searching…" : "Track"}
        </button>
      </form>

      {error ? <div className="text-sm text-red-300">{error}</div> : null}

      {data ? (
        <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Tracking ID</div>
          <div className="mt-1 text-neutral-900 font-medium dark:text-white">{data.order.trackingId}</div>

          <div className="mt-6">
            <div className="text-sm font-medium text-neutral-900 dark:text-white">Timeline</div>
            <div className="mt-3 space-y-3">
              {data.trackingEvents.map((ev) => (
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
      ) : null}
    </div>
  );
}
