"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@playarena/shared/api";
import type { Dispute } from "@playarena/shared/types";

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ disputes: Dispute[] }>("/api/disputes/my")
      .then((res) => setDisputes(res.disputes))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    under_review: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    dismissed: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Disputes</h1>
        <Link href="/disputes/new" className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          File Dispute
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : disputes.length === 0 ? (
        <div className="rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">No disputes filed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <div key={d.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium capitalize">{d.type.replace(/_/g, " ")}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{d.reason}</p>
                </div>
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[d.status] || "bg-muted text-muted-foreground"}`}>
                  {d.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{new Date(d.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
