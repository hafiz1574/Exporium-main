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
      <h1 className="text-xl font-semibold text-white">Admin customers</h1>

      {loading ? (
        <div className="text-sm text-neutral-400">Loading…</div>
      ) : (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-black">
              <tr>
                <th className="px-4 py-3 text-neutral-400">Name</th>
                <th className="px-4 py-3 text-neutral-400">Email</th>
                <th className="px-4 py-3 text-neutral-400">Created</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-t border-neutral-800">
                  <td className="px-4 py-3 text-white">{c.name}</td>
                  <td className="px-4 py-3 text-neutral-300">{c.email}</td>
                  <td className="px-4 py-3 text-neutral-400">{new Date(c.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
