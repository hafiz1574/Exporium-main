import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { login } from "../store/slices/authSlice";
import { fetchWishlist } from "../store/slices/wishlistSlice";

export function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const result = await dispatch(login({ email, password })).unwrap();
      dispatch(fetchWishlist());

      if (adminMode) {
        if (result.user.role !== "admin") {
          setError("This account is not an admin.");
          return;
        }
        navigate("/admin");
      } else {
        navigate("/account/orders");
      }
    } catch (err: any) {
      setError(String(err));
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-neutral-200 bg-white/70 p-6 dark:border-neutral-800 dark:bg-neutral-950/40">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Login</h1>

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

        <button
          type="button"
          onClick={() => setAdminMode((v) => !v)}
          className={`w-full rounded-md border px-4 py-2 text-sm font-medium ${
            adminMode
              ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-black"
              : "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400 dark:border-neutral-700 dark:bg-black dark:text-white dark:hover:border-neutral-500"
          }`}
        >
          Admin
        </button>

        {error ? <div className="text-sm text-red-300">{error}</div> : null}

        <button
          disabled={status === "loading"}
          className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {status === "loading" ? "Signing in…" : "Login"}
        </button>

        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          No account? <Link to="/signup" className="text-neutral-900 underline dark:text-white">Sign up</Link>
        </div>
      </form>
    </div>
  );
}
