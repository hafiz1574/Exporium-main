import { useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/http";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");
    try {
      await api.post("/api/auth/forgot-password", { email });
      setStatus("done");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Request failed");
      setStatus("idle");
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-neutral-200 bg-white/70 p-6 dark:border-neutral-800 dark:bg-neutral-950/40">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Forgot password</h1>

      <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Enter your email. If an account exists, we’ll send a reset link.
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="text-xs text-neutral-600 dark:text-neutral-400">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-black dark:text-white"
            type="email"
            required
          />
        </div>

        {error ? <div className="text-sm text-red-300">{error}</div> : null}

        {status === "done" ? (
          <div className="text-sm text-neutral-700 dark:text-neutral-300">Check your email for the reset link.</div>
        ) : (
          <button
            disabled={status === "loading"}
            className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            {status === "loading" ? "Sending…" : "Send reset link"}
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
