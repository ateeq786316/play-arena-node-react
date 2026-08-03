"use client";

import { useState, useEffect } from "react";
import { api } from "@playarena/shared/api";
import { formatCurrency } from "@playarena/shared/utils";

export default function FinancePage() {
  const [grounds, setGrounds] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ grounds: { id: string; name: string }[] }>("/api/grounds/my")
      .then((res) => setGrounds(res.grounds || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Finance</h1>
      <p className="text-sm text-muted-foreground">Manage cash sessions, view reports, and track revenue.</p>

      {loading ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : grounds.length === 0 ? (
        <p className="text-sm text-muted-foreground">You don&apos;t manage any grounds yet.</p>
      ) : (
        <div className="space-y-3">
          {grounds.map((g) => (
            <div key={g.id} className="rounded-xl border border-border bg-background p-4">
              <h3 className="font-medium">{g.name}</h3>
              <div className="flex gap-2 mt-2">
                <a href={`/api/finance/grounds/${g.id}/cash-session/open`} className="text-xs rounded-lg bg-primary px-3 py-1.5 text-primary-foreground hover:opacity-90">Open Session</a>
                <a href={`/api/finance/grounds/${g.id}/reports`} className="text-xs rounded-lg bg-muted px-3 py-1.5 text-muted-foreground hover:bg-muted/80">Reports</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
