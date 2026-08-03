"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@playarena/shared/api";
import type { Dispute } from "@playarena/shared/types";
import { formatCurrency } from "@playarena/shared/utils";

export default function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolution, setResolution] = useState("");
  const [action, setAction] = useState<"resolved" | "dismissed" | "no_show_penalty">("resolved");
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    api.get<{ dispute: Dispute }>(`/api/disputes/${id}`)
      .then((res) => setDispute(res.dispute))
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.body.message || "Failed to load dispute" : "Failed to load dispute");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    under_review: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    dismissed: "bg-red-100 text-red-700",
  };

  const handleResolve = async () => {
    if (!resolution) { alert("Resolution is required"); return; }
    setResolving(true);
    try {
      await api.patch(`/api/disputes/${id}/resolve`, { resolution, action });
      router.push("/disputes");
    } catch (err: unknown) {
      alert(err instanceof ApiError ? err.body.message || "Failed to resolve" : "Failed to resolve");
    } finally {
      setResolving(false);
    }
  };

  if (loading) return <div className="space-y-4"><div className="h-8 w-48 bg-muted animate-pulse rounded" /><div className="h-40 bg-muted animate-pulse rounded-xl" /></div>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!dispute) return <p className="text-muted-foreground">Dispute not found</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/disputes" className="text-sm text-muted-foreground hover:underline">← Back</Link>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl font-bold capitalize">{dispute.type.replace(/_/g, " ")}</h1>
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[dispute.status] || "bg-muted text-muted-foreground"}`}>
            {dispute.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Reason</span><span>{dispute.reason}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Filed</span><span>{new Date(dispute.createdAt).toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Booking</span><span className="font-mono text-xs">{dispute.bookingId}</span></div>
        {dispute.description && <div className="border-t border-border pt-2 mt-2"><p className="text-muted-foreground mb-1">Description</p><p>{dispute.description}</p></div>}
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <h2 className="font-semibold mb-2">Evidence</h2>
        {dispute.evidence && Array.isArray(dispute.evidence) && dispute.evidence.length > 0 ? (
          <ul className="space-y-1 text-sm list-disc list-inside text-muted-foreground">
            {dispute.evidence.map((e, i) => <li key={i}>{String(e)}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No evidence attached.</p>
        )}
      </div>

      {dispute.status === "resolved" || dispute.status === "dismissed" ? (
        <div className="rounded-xl border border-border bg-background p-4 space-y-1 text-sm">
          <p className="font-semibold">Resolution</p>
          <p>{dispute.resolution || "No resolution notes."}</p>
          {dispute.resolvedAt && <p className="text-xs text-muted-foreground">Resolved {new Date(dispute.resolvedAt).toLocaleString()}</p>}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-background p-4 space-y-3">
          <h2 className="font-semibold">Resolve Dispute</h2>
          <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Resolution notes" rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button onClick={() => setAction("resolved")} className={`rounded-lg px-4 py-2 text-sm ${action === "resolved" ? "bg-primary text-primary-foreground" : "border border-border"}`}>Resolve</button>
            <button onClick={() => setAction("no_show_penalty")} className={`rounded-lg px-4 py-2 text-sm ${action === "no_show_penalty" ? "bg-primary text-primary-foreground" : "border border-border"}`}>Resolve + No-show penalty ({formatCurrency(500)})</button>
            <button onClick={() => setAction("dismissed")} className={`rounded-lg px-4 py-2 text-sm ${action === "dismissed" ? "bg-primary text-primary-foreground" : "border border-border"}`}>Dismiss</button>
          </div>
          <button onClick={handleResolve} disabled={resolving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {resolving ? "Submitting..." : "Submit Resolution"}
          </button>
        </div>
      )}
    </div>
  );
}
