"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@playarena/shared/api";
import { useAuthStore } from "@/stores/auth";

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const [finance, setFinance] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (user?.role === "admin") {
      api.get<{ finance: Record<string, unknown> }>("/api/admin/finance")
        .then((res) => setFinance(res.finance))
        .catch(() => {});
    }
  }, [user]);

  if (user?.role !== "admin") {
    return <p className="text-sm text-muted-foreground">Access denied. Admin only.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-xl font-bold">{finance ? "Loading..." : "—"}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Users</p>
          <p className="text-xl font-bold">—</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Grounds</p>
          <p className="text-xl font-bold">—</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Bookings</p>
          <p className="text-xl font-bold">—</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["users", "grounds", "teams", "finance", "audit-logs", "regions", "cities", "sports", "payment-methods"].map((link) => (
          <a
            key={link}
            href={`/api/admin/${link}`}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-muted transition-colors"
          >
            {link.replace(/-/g, " ")}
          </a>
        ))}
        <Link href="/admin/disputes" className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-muted transition-colors">
          Dispute Moderation
        </Link>
        <Link href="/admin/analytics" className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-muted transition-colors">
          Platform Analytics
        </Link>
      </div>
    </div>
  );
}
