import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../api/http";
import { useAppSelector } from "../../store/hooks";
import type { UserRole } from "../../types/models";

type UserRow = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified?: boolean;
  createdAt?: string;
};

export function AdminUsers() {
  const user = useAppSelector((s) => s.auth.user);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const canManage = user?.role === "owner";

  const roleOptions = useMemo(() => {
    const roles: UserRole[] = ["customer", "manager", "editor", "owner"];
    return roles;
  }, []);

  async function load() {
    setStatus("loading");
    setError(null);
    try {
      const { data } = await api.get("/api/admin/users");
      setUsers(data.users ?? []);
      setStatus("idle");
    } catch (err: any) {
      setStatus("error");
      setError(err?.response?.data?.error ?? err?.message ?? "Failed to load users");
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function changeRole(userId: string, role: UserRole) {
    if (!canManage) return;
    setStatus("saving");
    setError(null);
    try {
      const { data } = await api.patch(`/api/admin/users/${userId}/role`, { role });
      const updated: UserRow = data.user;
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
      setStatus("idle");
      // If owner was moved, reload to reflect enforced single-owner rule.
      if (role === "owner") {
        void load();
      }
    } catch (err: any) {
      setStatus("error");
      setError(err?.response?.data?.error ?? err?.message ?? "Failed to update role");
    }
  }

  async function deleteUser(userId: string, email: string) {
    if (!canManage) return;
    if (!confirm(`Delete user ${email}?`)) return;

    setStatus("saving");
    setError(null);
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setStatus("idle");
    } catch (err: any) {
      setStatus("error");
      setError(err?.response?.data?.error ?? err?.message ?? "Failed to delete user");
    }
  }

  if (!canManage) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Admin users</h1>
        <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-300">
          Only the owner can manage user roles.
        </div>
        <Link to="/admin" className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Admin users</h1>
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

      {error ? <div className="text-sm text-red-300">{error}</div> : null}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white/70 dark:border-neutral-800 dark:bg-neutral-950/40">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 text-xs text-neutral-500 dark:border-neutral-800">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Verified</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {users.map((u) => (
              <tr key={u._id}>
                <td className="px-4 py-3 text-neutral-900 dark:text-white">{u.name}</td>
                <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => void changeRole(u._id, e.target.value as UserRole)}
                    disabled={status === "saving"}
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-black dark:text-white"
                  >
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{u.emailVerified ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={status === "saving" || u._id === user?._id}
                    onClick={() => void deleteUser(u._id, u.email)}
                    className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-900 hover:border-neutral-400 disabled:opacity-60 dark:border-neutral-700 dark:bg-black dark:text-white dark:hover:border-neutral-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!users.length && status === "loading" ? (
              <tr>
                <td className="px-4 py-6 text-neutral-600 dark:text-neutral-300" colSpan={5}>
                  Loading…
                </td>
              </tr>
            ) : null}
            {!users.length && status !== "loading" ? (
              <tr>
                <td className="px-4 py-6 text-neutral-600 dark:text-neutral-300" colSpan={5}>
                  No users
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
