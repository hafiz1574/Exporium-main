import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../api/http";

type Announcement = {
  _id: string;
  title: string;
  message: string;
  active: boolean;
  createdAt: string;
};

const emptyForm = { title: "", message: "", active: true };

export function AdminAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{ title: string; message: string; active: boolean }>(emptyForm);

  async function load() {
    setStatus("loading");
    setError(null);
    try {
      const { data } = await api.get("/api/admin/announcements");
      setItems(data.announcements ?? []);
      setStatus("idle");
    } catch (err: any) {
      setStatus("error");
      setError(err?.response?.data?.error ?? err?.message ?? "Failed to load announcements");
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function create() {
    if (!form.title.trim() || !form.message.trim()) return;
    setStatus("saving");
    setError(null);
    try {
      const { data } = await api.post("/api/admin/announcements", {
        title: form.title.trim(),
        message: form.message.trim(),
        active: form.active
      });
      setItems((prev) => [data.announcement, ...prev]);
      setForm(emptyForm);
      setStatus("idle");
    } catch (err: any) {
      setStatus("error");
      setError(err?.response?.data?.error ?? err?.message ?? "Failed to create announcement");
    }
  }

  async function toggleActive(id: string, active: boolean) {
    setStatus("saving");
    setError(null);
    try {
      const { data } = await api.patch(`/api/admin/announcements/${id}`, { active });
      setItems((prev) => prev.map((x) => (x._id === id ? data.announcement : x)));
      setStatus("idle");
    } catch (err: any) {
      setStatus("error");
      setError(err?.response?.data?.error ?? err?.message ?? "Failed to update announcement");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this announcement?") ) return;
    setStatus("saving");
    setError(null);
    try {
      await api.delete(`/api/admin/announcements/${id}`);
      setItems((prev) => prev.filter((x) => x._id !== id));
      setStatus("idle");
    } catch (err: any) {
      setStatus("error");
      setError(err?.response?.data?.error ?? err?.message ?? "Failed to delete announcement");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Admin announcements</h1>
        <div className="flex gap-3 text-sm">
          <Link to="/admin" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
            Dashboard
          </Link>
          <button
            onClick={() => void load()}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-900 hover:border-neutral-400 dark:border-neutral-700 dark:bg-black dark:text-white dark:hover:border-neutral-500"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="text-sm text-red-600 dark:text-red-400">{error}</div> : null}

      <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
        <div className="text-sm font-medium text-neutral-900 dark:text-white">Create</div>
        <div className="mt-4 grid gap-3">
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Title"
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-black dark:text-white"
          />
          <textarea
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            placeholder="Message"
            className="min-h-28 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-black dark:text-white"
          />
          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
            />
            Active
          </label>
          <button
            type="button"
            disabled={status === "saving"}
            onClick={() => void create()}
            className="w-fit rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            Publish
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {status === "loading" ? <div className="text-sm text-neutral-600 dark:text-neutral-400">Loading…</div> : null}
        {items.map((a) => (
          <div key={a._id} className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-neutral-900 dark:text-white">{a.title}</div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">{a.message}</div>
                <div className="mt-3 text-xs text-neutral-500">{new Date(a.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={status === "saving"}
                  onClick={() => void toggleActive(a._id, !a.active)}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-900 hover:border-neutral-400 disabled:opacity-60 dark:border-neutral-700 dark:bg-black dark:text-white dark:hover:border-neutral-500"
                >
                  {a.active ? "Disable" : "Enable"}
                </button>
                <button
                  type="button"
                  disabled={status === "saving"}
                  onClick={() => void remove(a._id)}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-900 hover:border-neutral-400 disabled:opacity-60 dark:border-neutral-700 dark:bg-black dark:text-white dark:hover:border-neutral-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {status !== "loading" && items.length === 0 ? (
          <div className="text-sm text-neutral-600 dark:text-neutral-400">No announcements</div>
        ) : null}
      </div>
    </div>
  );
}
