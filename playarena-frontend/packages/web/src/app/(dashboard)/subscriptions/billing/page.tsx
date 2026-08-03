"use client";

import { useState, useEffect } from "react";
import { api } from "@playarena/shared/api";
import type { Invoice } from "@playarena/shared/types";

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ invoices: Invoice[] }>("/api/subscriptions/invoices")
      .then((res) => setInvoices(res.invoices))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-40 rounded-xl bg-muted animate-pulse" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing History</h1>

      {invoices.length === 0 ? (
        <p className="text-sm text-muted-foreground">No invoices yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-border">
                  <td className="px-4 py-3">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium">Rs. {Number(inv.amount).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      inv.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(inv.dueDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
