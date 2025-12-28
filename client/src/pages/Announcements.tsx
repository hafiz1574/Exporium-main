import { useEffect, useState } from "react";

import { api } from "../api/http";

type Announcement = {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
};

export function Announcements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [status, setStatus] = useState<"loading" | "idle" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setStatus("loading");
      setError(null);
      try {
        const { data } = await api.get("/api/announcements");
        if (!mounted) return;
        setItems(data.announcements ?? []);
        setStatus("idle");
      } catch (err: any) {
        if (!mounted) return;
        setStatus("error");
        setError(err?.response?.data?.error ?? err?.message ?? "Failed to load announcements");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Announcements</h1>
      </div>

      {status === "loading" ? <div className="text-sm text-neutral-600 dark:text-neutral-400">Loading…</div> : null}
      {status === "error" ? <div className="text-sm text-red-600 dark:text-red-400">{error}</div> : null}

      {status === "idle" ? (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a._id} className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
              <div className="text-sm font-semibold text-neutral-900 dark:text-white">{a.title}</div>
              <div className="mt-2 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">{a.message}</div>
              <div className="mt-3 text-xs text-neutral-500">{new Date(a.createdAt).toLocaleString()}</div>
            </div>
          ))}
          {items.length === 0 ? <div className="text-sm text-neutral-600 dark:text-neutral-400">No announcements</div> : null}
        </div>
      ) : null}
    </div>
  );
}
