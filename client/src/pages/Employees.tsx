import { useEffect, useState } from "react";

import { api } from "../api/http";

type Employee = {
  _id: string;
  name: string;
  role: string;
  nameColor?: string;
};

export function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [status, setStatus] = useState<"loading" | "idle" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setStatus("loading");
      setError(null);
      try {
        const { data } = await api.get("/api/employees");
        if (!mounted) return;
        setEmployees(data.employees ?? []);
        setStatus("idle");
      } catch (err: any) {
        if (!mounted) return;
        setStatus("error");
        setError(err?.response?.data?.error ?? err?.message ?? "Failed to load employees");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Employes</h1>
      </div>

      {status === "loading" ? <div className="text-sm text-neutral-600 dark:text-neutral-400">Loading…</div> : null}
      {status === "error" ? <div className="text-sm text-red-600 dark:text-red-400">{error}</div> : null}

      {status === "idle" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((e) => (
            <div
              key={e._id}
              className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40"
            >
              <div className={`text-base font-semibold ${e.nameColor ?? "text-neutral-900 dark:text-white"}`}>{e.name}</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-neutral-500">{e.role}</div>
            </div>
          ))}
          {employees.length === 0 ? (
            <div className="text-sm text-neutral-600 dark:text-neutral-400">No employees</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
