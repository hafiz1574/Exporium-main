import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../api/http";
import { useAppSelector } from "../../store/hooks";

function maskEmail(email: string) {
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return email;

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (local.length === 1) return `${local}*@${domain}`;
  if (local.length === 2) return `${local[0]}*@${domain}`;

  const first = local[0];
  const last = local[local.length - 1];
  const stars = "*".repeat(Math.max(3, local.length - 2));
  return `${first}${stars}${last}@${domain}`;
}

export function AccountProfile() {
  const user = useAppSelector((s) => s.auth.user);
  const wishlistCount = useAppSelector((s) => s.wishlist.items.length);

  const [resetStatus, setResetStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const maskedEmail = useMemo(() => (user?.email ? maskEmail(user.email) : ""), [user?.email]);

  async function sendResetLink() {
    if (!user?.email) return;
    setResetStatus("sending");
    setResetMessage(null);
    try {
      const { data } = await api.post("/api/auth/forgot-password", { email: user.email });
      setResetStatus("sent");
      setResetMessage(data?.message ?? "Reset link sent (if the account exists). Check your email.");
    } catch (err: any) {
      setResetStatus("error");
      setResetMessage(err?.response?.data?.error ?? err?.message ?? "Failed to send reset link");
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Profile</h1>
        <div className="flex gap-3 text-sm">
          <Link to="/account/orders" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
            Orders
          </Link>
          <Link to="/wishlist" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
            Wishlist
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
          <div className="text-sm font-medium text-neutral-900 dark:text-white">Account</div>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="text-neutral-600 dark:text-neutral-400">Name</div>
              <div className="text-neutral-900 dark:text-white">{user.name}</div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-neutral-600 dark:text-neutral-400">Email</div>
              <div className="text-neutral-900 dark:text-white">{maskedEmail}</div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-neutral-600 dark:text-neutral-400">Role</div>
              <div className="text-neutral-900 dark:text-white">{user.role}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
          <div className="text-sm font-medium text-neutral-900 dark:text-white">Security</div>
          <div className="mt-4 grid gap-3">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Need to change your password? Send a reset link to your email.
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled={resetStatus === "sending"}
                onClick={() => void sendResetLink()}
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                {resetStatus === "sending" ? "Sending…" : "Send reset link"}
              </button>
              <Link
                to="/forgot-password"
                className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
              >
                Open reset page
              </Link>
            </div>

            {resetMessage ? <div className="text-sm text-neutral-700 dark:text-neutral-300">{resetMessage}</div> : null}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
        <div className="text-sm font-medium text-neutral-900 dark:text-white">Wishlist</div>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Saved items: {wishlistCount}</div>
          <Link
            to="/wishlist"
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 hover:border-neutral-400 dark:border-neutral-700 dark:bg-black dark:text-white dark:hover:border-neutral-500"
          >
            View wishlist
          </Link>
        </div>
      </div>
    </div>
  );
}
