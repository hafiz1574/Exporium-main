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
      <h1 className="text-xl font-semibold text-white">Track your order</h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 sm:flex-row">
        <input
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          placeholder="Enter tracking ID"
          className="flex-1 rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm text-white placeholder:text-neutral-600"
          required
        />
        <button className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200">
          {loading ? "Searching…" : "Track"}
        </button>
      </form>

      {error ? <div className="text-sm text-red-300">{error}</div> : null}

      {data ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
          <div className="text-sm text-neutral-400">Tracking ID</div>
          <div className="mt-1 text-white font-medium">{data.order.trackingId}</div>

          <div className="mt-6">
            <div className="text-sm font-medium text-white">Timeline</div>
            <div className="mt-3 space-y-3">
              {data.trackingEvents.map((ev) => (
                <div key={ev._id} className="rounded-lg border border-neutral-800 bg-black p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-white">{ev.status}</div>
                    <div className="text-xs text-neutral-500">{new Date(ev.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="mt-1 text-sm text-neutral-300">{ev.message}</div>
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
