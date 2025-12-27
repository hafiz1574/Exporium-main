import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { api } from "../api/http";

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const hasToken = useMemo(() => token.length > 0, [token]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hasToken) {
      setError("Invalid reset link");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setStatus("loading");
    try {
      await api.post("/api/auth/reset-password", { token, password });
      setStatus("done");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Reset failed");
      setStatus("idle");
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-neutral-200 bg-white/70 p-6 dark:border-neutral-800 dark:bg-neutral-950/40">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Reset password</h1>

      {!hasToken ? (
        <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">Invalid reset link.</div>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="text-xs text-neutral-600 dark:text-neutral-400">New password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-black dark:text-white"
            type="password"
            required
          />
        </div>
        <div>
          <label className="text-xs text-neutral-600 dark:text-neutral-400">Confirm password</label>
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-black dark:text-white"
            type="password"
            required
          />
        </div>

        {error ? <div className="text-sm text-red-300">{error}</div> : null}

        {status === "done" ? (
          <div className="space-y-3">
            <div className="text-sm text-neutral-700 dark:text-neutral-300">Password updated. You can log in now.</div>
            <Link to="/login" className="inline-block text-sm text-neutral-900 underline dark:text-white">
              Go to login
            </Link>
          </div>
        ) : (
          <button
            disabled={status === "loading" || !hasToken}
            className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            {status === "loading" ? "Updating…" : "Update password"}
          </button>
        )}

        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          <Link to="/login" className="text-neutral-900 underline dark:text-white">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}
