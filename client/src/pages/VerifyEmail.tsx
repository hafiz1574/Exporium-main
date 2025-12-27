import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { api } from "../api/http";

export function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const hasToken = useMemo(() => token.length > 0, [token]);

  useEffect(() => {
    if (!hasToken) return;

    let cancelled = false;
    setStatus("loading");
    setMessage(null);

    api
      .post("/api/auth/verify-email", { token })
      .then((res) => {
        if (cancelled) return;
        setStatus("success");
        setMessage(res.data?.message ?? "Email verified");
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(err?.response?.data?.error ?? "Verification failed");
      });

    return () => {
      cancelled = true;
    };
  }, [hasToken, token]);

  return (
    <div className="mx-auto max-w-md rounded-xl border border-neutral-200 bg-white/70 p-6 dark:border-neutral-800 dark:bg-neutral-950/40">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Verify email</h1>

      {!hasToken ? (
        <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">Invalid verification link.</div>
      ) : null}

      {status === "loading" ? (
        <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">Verifying…</div>
      ) : null}

      {message ? <div className="mt-4 text-sm text-neutral-700 dark:text-neutral-300">{message}</div> : null}

      <div className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
        <Link to="/login" className="text-neutral-900 underline dark:text-white">
          Go to login
        </Link>
      </div>
    </div>
  );
}
