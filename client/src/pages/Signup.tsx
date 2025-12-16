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
    <div className="mx-auto max-w-md rounded-xl border border-neutral-800 bg-neutral-950/40 p-6">
      <h1 className="text-xl font-semibold text-white">Sign up</h1>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="text-xs text-neutral-400">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm text-white"
            required
          />
        </div>
        <div>
          <label className="text-xs text-neutral-400">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm text-white"
            type="email"
            required
          />
        </div>
        <div>
          <label className="text-xs text-neutral-400">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm text-white"
            type="password"
            required
          />
        </div>

        {error ? <div className="text-sm text-red-300">{error}</div> : null}

        <button
          disabled={status === "loading"}
          className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-60"
        >
          {status === "loading" ? "Creating…" : "Create account"}
        </button>

        <div className="text-sm text-neutral-400">
          Already have an account? <Link to="/login" className="text-white underline">Login</Link>
        </div>
      </form>
    </div>
  );
}
