"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@playarena/shared/api";
import { formatRelativeTime } from "@playarena/shared/utils";

export default function ChatPage() {
  const [unreadCounts, setUnreadCounts] = useState<{ groundId: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ unreadCounts: { groundId: string; count: number }[] }>("/api/chat/unread")
      .then((res) => setUnreadCounts(res.unreadCounts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Chat</h1>

      {loading ? (
        <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : unreadCounts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active chat conversations.</p>
      ) : (
        <div className="space-y-2">
          {unreadCounts.map((uc) => (
            <Link
              key={uc.groundId}
              href={`/chat/${uc.groundId}`}
              className="flex items-center justify-between rounded-xl border border-border bg-background p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">💬</div>
                <div>
                  <p className="text-sm font-medium">Ground Chat</p>
                  <p className="text-xs text-muted-foreground">ID: {uc.groundId.slice(0, 8)}...</p>
                </div>
              </div>
              {uc.count > 0 && (
                <span className="rounded-full bg-primary text-primary-foreground text-xs px-2 py-0.5 font-medium">
                  {uc.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
