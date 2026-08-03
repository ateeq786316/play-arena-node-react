"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@playarena/shared/api";
import { formatDate, formatTime } from "@playarena/shared/utils";

export default function OpsDashboardPage() {
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
      <h1 className="text-2xl font-bold">Operations</h1>
      <p className="text-sm text-muted-foreground">Staff dashboard — manage today&apos;s bookings and court status.</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-background p-4 text-center">
          <p className="text-2xl font-bold text-primary">0</p>
          <p className="text-xs text-muted-foreground mt-1">Today&apos;s Bookings</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">0</p>
          <p className="text-xs text-muted-foreground mt-1">Pending Approval</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 text-center">
          <p className="text-2xl font-bold text-green-600">0</p>
          <p className="text-xs text-muted-foreground mt-1">Checked In</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : grounds.length === 0 ? (
        <p className="text-sm text-muted-foreground">No grounds assigned to you.</p>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Your Grounds</h2>
          {grounds.map((g) => (
            <Link
              key={g.id}
              href={`/grounds/${g.id}`}
              className="block rounded-xl border border-border bg-background p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{g.name}</p>
                  <p className="text-xs text-muted-foreground">Today: {formatDate(new Date().toISOString())}</p>
                </div>
                <span className="text-sm text-muted-foreground">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Link href="/bookings" className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-muted transition-colors">
          View All Bookings
        </Link>
      </div>
    </div>
  );
}
