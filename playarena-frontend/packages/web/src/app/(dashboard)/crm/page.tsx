"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@playarena/shared/api";
import type { Ground, BroadcastMessage } from "@playarena/shared/types";

export default function CrmPage() {
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [selectedGround, setSelectedGround] = useState("");
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ grounds: Ground[] }>("/api/grounds/my")
      .then((res) => {
        setGrounds(res.grounds);
        if (res.grounds.length) setSelectedGround(res.grounds[0].id);
      })
      .catch(() => {});
  }, []);

  const fetchBroadcasts = useCallback(() => {
    if (!selectedGround) return;
    api.get<{ broadcasts: BroadcastMessage[] }>(`/api/crm/ground/${selectedGround}`)
      .then((res) => setBroadcasts(res.broadcasts))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedGround]);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">CRM Broadcasts</h1>
        <div className="flex gap-2">
          <select value={selectedGround} onChange={(e) => { setLoading(true); setSelectedGround(e.target.value); }} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
            {grounds.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <Link href="/crm/new" className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            New Broadcast
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : broadcasts.length === 0 ? (
        <div className="rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">No broadcasts yet.</p>
          <Link href="/crm/new" className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Create First Broadcast
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {broadcasts.map((b) => (
            <div key={b.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{b.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{b.message}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    b.status === "sent" ? "bg-green-100 text-green-700" :
                    b.status === "scheduled" ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"
                  }`}>{b.status}</span>
                  {b.sentAt && <p className="text-xs text-muted-foreground mt-1">{new Date(b.sentAt).toLocaleDateString()}</p>}
                </div>
              </div>
              {b.logs && b.logs.length > 0 && (
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                  <span>Sent: {b.logs.length}</span>
                  <span>Delivered: {b.logs.filter(l => l.status === "delivered").length}</span>
                  <span>Opened: {b.logs.filter(l => l.openedAt).length}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
