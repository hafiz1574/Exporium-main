import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { register } from "../store/slices/authSlice";

export function Signup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await dispatch(register({ name, email, password })).unwrap();
      navigate("/account/orders");
    } catch (err: any) {
      setError(String(err));
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-neutral-200 bg-white/70 p-6 dark:border-neutral-800 dark:bg-neutral-950/40">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Sign up</h1>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="text-xs text-neutral-600 dark:text-neutral-400">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-black dark:text-white"
            required
          />
        </div>
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
        <div>
          <label className="text-xs text-neutral-600 dark:text-neutral-400">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-black dark:text-white"
            type="password"
            required
          />
        </div>

        {error ? <div className="text-sm text-red-300">{error}</div> : null}

        <button
          disabled={status === "loading"}
          className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {status === "loading" ? "Creating…" : "Create account"}
        </button>

        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          Already have an account? <Link to="/login" className="text-neutral-900 underline dark:text-white">Login</Link>
        </div>
      </form>
    </div>
  );
}
