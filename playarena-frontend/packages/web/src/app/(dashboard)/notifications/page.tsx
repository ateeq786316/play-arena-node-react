"use client";

import { useState, useEffect } from "react";
import { api } from "@playarena/shared/api";
import type { Notification } from "@playarena/shared/types";
import { formatRelativeTime } from "@playarena/shared/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    api.get<{ notifications: Notification[] }>("/api/notifications")
      .then((res) => setNotifications(res.notifications))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch() }, []);

  const markRead = async (id: string) => {
    await api.patch(`/api/notifications/${id}/read`);
    fetch();
  };

  const markAllRead = async () => {
    await api.patch("/api/notifications/read-all");
    fetch();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.some((n) => !n.readAt) && (
          <button onClick={markAllRead} className="text-sm text-primary hover:underline">Mark all read</button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notifications yet.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.readAt && markRead(n.id)}
              className={`rounded-xl border px-4 py-3 cursor-pointer transition-colors ${n.readAt ? "border-border bg-background" : "border-primary/20 bg-primary/5"}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.message && <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                </div>
                <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">{formatRelativeTime(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
