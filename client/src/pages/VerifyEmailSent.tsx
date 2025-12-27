import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { resendVerification } from "../store/slices/authSlice";

export function VerifyEmailSent() {
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";

  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onResend() {
    setError(null);
    setMessage(null);
    try {
      const result = await dispatch(resendVerification({ email })).unwrap();
      setMessage(result.message);
    } catch (err: any) {
      setError(typeof err === "string" ? err : String(err?.message ?? err));
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-neutral-200 bg-white/70 p-6 dark:border-neutral-800 dark:bg-neutral-950/40">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Check your email</h1>

      <div className="mt-4 text-sm text-neutral-700 dark:text-neutral-300">
        We sent a verification link to <span className="font-medium">{email || "your email"}</span>. Please verify to log in.
      </div>

      {error ? <div className="mt-4 text-sm text-red-300">{error}</div> : null}
      {message ? <div className="mt-4 text-sm text-neutral-700 dark:text-neutral-300">{message}</div> : null}

      <div className="mt-6 space-y-3">
        <button
          type="button"
          disabled={!email || status === "loading"}
          onClick={onResend}
          className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-400 disabled:opacity-60 dark:border-neutral-700 dark:bg-black dark:text-white dark:hover:border-neutral-500"
        >
          {status === "loading" ? "Sending…" : "Resend verification email"}
        </button>

        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          <Link to="/login" className="text-neutral-900 underline dark:text-white">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
