import { useEffect, useState } from "react";

import { api } from "../../api/http";

type Customer = {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
};

export function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/api/admin/customers");
        if (!mounted) return;
        setCustomers(data.customers as Customer[]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Admin customers</h1>

      {loading ? (
        <div className="text-sm text-neutral-600 dark:text-neutral-400">Loading…</div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white/70 overflow-hidden dark:border-neutral-800 dark:bg-neutral-950/40">
          <div className="w-full overflow-x-auto">
            <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="bg-neutral-100 dark:bg-black">
              <tr>
                <th className="px-3 py-2 text-neutral-600 dark:text-neutral-400 sm:px-4 sm:py-3">Name</th>
                <th className="px-3 py-2 text-neutral-600 dark:text-neutral-400 sm:px-4 sm:py-3">Email</th>
                <th className="px-3 py-2 text-neutral-600 dark:text-neutral-400 sm:px-4 sm:py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-t border-neutral-200 dark:border-neutral-800">
                  <td className="px-3 py-2 text-neutral-900 dark:text-white sm:px-4 sm:py-3">{c.name}</td>
                  <td className="px-3 py-2 text-neutral-700 dark:text-neutral-300 sm:px-4 sm:py-3">{c.email}</td>
                  <td className="px-3 py-2 text-neutral-600 dark:text-neutral-400 sm:px-4 sm:py-3">{new Date(c.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
