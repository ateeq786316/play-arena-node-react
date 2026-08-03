"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@playarena/shared/api";
import type { Booking } from "@playarena/shared/types";

export default function NewDisputePage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingId, setBookingId] = useState("");
  const [type, setType] = useState<DisputeType>("booking_conflict");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get<{ bookings: Booking[] }>("/api/bookings/my")
      .then((res) => {
        setBookings(res.bookings);
        if (res.bookings.length) setBookingId(res.bookings[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingBookings(false));
  }, []);

  const handleSubmit = async () => {
    if (!bookingId || !reason) { alert("Booking and reason are required"); return; }
    setSending(true);
    try {
      await api.post("/api/disputes/file", {
        bookingId, type, reason,
        description: description || undefined,
        evidence: evidence ? { urls: evidence.split("\n").filter(Boolean) } : undefined,
      });
      router.push("/disputes");
    } catch (e) {
      alert("Failed to file dispute");
    } finally {
      setSending(false);
    }
  };

  const TYPES = [
    { value: "booking_conflict", label: "Booking Conflict" },
    { value: "no_show", label: "No Show" },
    { value: "damage", label: "Damage" },
    { value: "other", label: "Other" },
  ] as const;

  type DisputeType = (typeof TYPES)[number]["value"];

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">File a Dispute</h1>

      <div className="space-y-4 rounded-xl border border-border bg-background p-6">
        <div>
          <label className="text-sm font-medium">Booking</label>
          <select value={bookingId} onChange={(e) => setBookingId(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            {loadingBookings ? <option>Loading...</option> : bookings.map((b) => (
              <option key={b.id} value={b.id}>{b.date} · {b.startTime}–{b.endTime}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as DisputeType)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Reason</label>
          <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Brief reason" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Description (optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Provide more details..." className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none" />
        </div>
        <div>
          <label className="text-sm font-medium">Evidence URLs (optional, one per line)</label>
          <textarea value={evidence} onChange={(e) => setEvidence(e.target.value)} rows={3} placeholder="https://..." className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none" />
        </div>
        <button onClick={handleSubmit} disabled={sending} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {sending ? "Filing..." : "File Dispute"}
        </button>
      </div>
    </div>
  );
}
