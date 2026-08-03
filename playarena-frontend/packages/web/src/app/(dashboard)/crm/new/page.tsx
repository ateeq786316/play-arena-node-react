"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@playarena/shared/api";
import type { Ground } from "@playarena/shared/types";

export default function NewBroadcastPage() {
  const router = useRouter();
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [groundId, setGroundId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get<{ grounds: Ground[] }>("/api/grounds/my")
      .then((res) => {
        setGrounds(res.grounds);
        if (res.grounds.length) setGroundId(res.grounds[0].id);
      })
      .catch(() => {});
  }, []);

  const handleSend = async (schedule: boolean) => {
    if (!title || !message) { alert("Title and message are required"); return; }
    setSending(true);
    try {
      await api.post("/api/crm/broadcast", {
        groundId, title, message, scheduledAt: schedule ? scheduledAt : null,
      });
      router.push("/crm");
    } catch (e) {
      alert("Failed to create broadcast");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">New Broadcast</h1>

      <div className="space-y-4 rounded-xl border border-border bg-background p-6">
        <div>
          <label className="text-sm font-medium">Ground</label>
          <select value={groundId} onChange={(e) => setGroundId(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            {grounds.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Weekend Special Offer" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Write your broadcast message..." className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none" />
        </div>
        <div>
          <label className="text-sm font-medium">Schedule (optional)</label>
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleSend(false)}
            disabled={sending}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Now"}
          </button>
          <button
            onClick={() => handleSend(true)}
            disabled={sending || !scheduledAt}
            className="rounded-lg border border-border px-6 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
