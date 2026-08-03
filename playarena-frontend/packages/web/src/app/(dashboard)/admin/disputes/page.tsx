"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@playarena/shared/api";
import type { Dispute } from "@playarena/shared/types";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = statusFilter ? `/api/disputes/all?status=${statusFilter}` : "/api/disputes/all";
    api.get<{ disputes: Dispute[] }>(path)
      .then((res) => setDisputes(res.disputes))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    under_review: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    dismissed: "bg-red-100 text-red-700",
  };

  const counts = disputes.reduce<Record<string, number>>((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dispute Moderation</h1>
        <div className="flex gap-2">
          {["", "pending", "under_review", "resolved", "dismissed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}
            >
              {s === "" ? `All (${disputes.length})` : `${s.replace(/_/g, " ")} (${counts[s] || 0})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : disputes.length === 0 ? (
        <div className="rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">No disputes found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <Link key={d.id} href={`/disputes/${d.id}`} className="block rounded-xl border border-border bg-background p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium capitalize">{d.type.replace(/_/g, " ")}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{d.reason}</p>
                  {"filedBy" in d && d.filedBy && <p className="text-xs text-muted-foreground mt-1">Filed by: {(d.filedBy as { name?: string }).name || "Unknown"}</p>}
                </div>
                <div className="text-right">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[d.status] || "bg-muted text-muted-foreground"}`}>
                    {d.status.replace(/_/g, " ")}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(d.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
