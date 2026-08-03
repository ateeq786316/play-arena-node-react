"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@playarena/shared/api";
import { formatCurrency, formatDate, formatTime } from "@playarena/shared/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toaster";
import { Wallet, Coins, Banknote, Receipt, TrendingUp } from "lucide-react";
import type { CashSession, PaymentMethod, Booking as BookingType } from "@playarena/shared/types";

type Summary = {
  bookingAgg: { _sum: { totalAmount: number | null }; _count: number };
  paymentAgg: { _sum: { amount: number | null }; _count: number };
};

type Ground = { id: string; name: string };

type GroundMethod = { paymentMethod: PaymentMethod; isActive: boolean };

export default function FinancePage() {
  const toast = useToast();
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [selectedGround, setSelectedGround] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [methods, setMethods] = useState<GroundMethod[]>([]);
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [reports, setReports] = useState<BookingType[] | null>(null);
  const [tab, setTab] = useState<"overview" | "payments" | "cash" | "reports">("overview");

  const [openModal, setOpenModal] = useState(false);
  const [closingSession, setClosingSession] = useState<CashSession | null>(null);
  const [openingCash, setOpeningCash] = useState("");
  const [openingNotes, setOpeningNotes] = useState("");
  const [closingCash, setClosingCash] = useState("");
  const [closingNotes, setClosingNotes] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    api
      .get<{ grounds: Ground[] }>("/api/grounds/my")
      .then((res) => {
        const list = res.grounds || [];
        setGrounds(list);
        if (list.length) setSelectedGround(list[0].id);
      })
      .catch(() => setError("Failed to load your grounds"))
      .finally(() => setLoading(false));
  }, []);

  const fetchGroundData = useCallback((groundId: string) => {
    if (!groundId) return;
    Promise.all([
      api.get<Summary>(`/api/finance/grounds/${groundId}/finance`).catch(() => null),
      api.get<{ paymentMethods: GroundMethod[] }>(`/api/finance/payment-methods/ground/${groundId}`).catch(() => null),
      api.get<{ sessions: CashSession[] }>(`/api/finance/grounds/${groundId}/cash-sessions`).catch(() => null),
    ])
      .then(([s, m, cs]) => {
        setSummary(s);
        setMethods(m?.paymentMethods || []);
        setSessions(cs?.sessions || []);
        setError("");
      })
      .catch(() => setError("Failed to load finance data"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchGroundData(selectedGround);
  }, [selectedGround, fetchGroundData]);

  const handleSelectGround = (id: string) => {
    setSelectedGround(id);
    setLoading(true);
  };

  const handleOpenSession = async () => {
    if (!selectedGround) return;
    setWorking(true);
    try {
      await api.post(`/api/finance/grounds/${selectedGround}/cash-session/open`, {
        openingCash: parseFloat(openingCash) || 0,
        notes: openingNotes || undefined,
      });
      toast("Cash session opened", "success");
      setOpenModal(false);
      setOpeningCash("");
      setOpeningNotes("");
      refresh();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setWorking(false);
    }
  };

  const handleCloseSession = async () => {
    if (!selectedGround || !closingSession) return;
    setWorking(true);
    try {
      await api.post(`/api/finance/grounds/${selectedGround}/cash-session/${closingSession.id}/close`, {
        closingCash: parseFloat(closingCash) || 0,
        notes: closingNotes || undefined,
      });
      toast("Cash session closed", "success");
      setClosingSession(null);
      setClosingCash("");
      setClosingNotes("");
      refresh();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setWorking(false);
    }
  };

  const handleToggleMethod = async (methodId: string) => {
    if (!selectedGround) return;
    try {
      await api.patch(`/api/finance/grounds/${selectedGround}/payment-methods/${methodId}`);
      setMethods((prev) =>
        prev.map((m) => (m.paymentMethod.id === methodId ? { ...m, isActive: !m.isActive } : m)),
      );
      toast("Payment method updated", "success");
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  const handleLoadReport = () => {
    if (!selectedGround) return;
    setLoading(true);
    api
      .get<{ bookings: BookingType[] }>(`/api/finance/grounds/${selectedGround}/reports`)
      .then((res) => {
        setReports(res.bookings || []);
        setError("");
      })
      .catch(() => setError("Failed to load report"))
      .finally(() => setLoading(false));
  };

  const refresh = useCallback(() => {
    if (selectedGround) fetchGroundData(selectedGround);
  }, [selectedGround, fetchGroundData]);

  const openSession = sessions.find((s) => s.status === "open") || null;
  const totalRevenue = summary?.paymentAgg._sum.amount ?? 0;
  const totalCollected = summary?.paymentAgg._sum.amount ?? 0;
  const totalBookings = summary?.bookingAgg._count ?? 0;
  const paymentCount = summary?.paymentAgg._count ?? 0;

  if (loading && !summary) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-8 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance"
        description="Track revenue, manage cash sessions, and review reports."
        actions={
          grounds.length > 1 ? (
            <Select value={selectedGround} onChange={(e) => handleSelectGround(e.target.value)} className="w-56">
              {grounds.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          ) : undefined
        }
      />

      {!selectedGround && !loading ? (
        <EmptyState icon={<Wallet className="h-7 w-7" />} title="No grounds yet" description="Register a ground to see finance data." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Collected" value={formatCurrency(totalCollected)} icon={<Coins className="h-5 w-5" />} />
            <StatCard label="Booking Value" value={formatCurrency(totalRevenue)} icon={<Banknote className="h-5 w-5" />} />
            <StatCard label="Bookings" value={totalBookings} icon={<Receipt className="h-5 w-5" />} />
            <StatCard label="Payments" value={paymentCount} icon={<TrendingUp className="h-5 w-5" />} />
          </div>

          <div className="rounded-lg border border-border bg-card shadow-card">
            <div className="flex gap-1 overflow-x-auto border-b border-border px-2">
              {(
                [
                  ["overview", "Overview"],
                  ["payments", "Payment Methods"],
                  ["cash", "Cash Sessions"],
                  ["reports", "Reports"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`cursor-pointer whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="p-5">
              {tab === "overview" && (
                <div className="space-y-3">
                  {!openSession && (
                    <Card className="border-primary/30 bg-primary/5 p-4">
                      <p className="text-sm text-primary-foreground">No active cash session for this ground.</p>
                    </Card>
                  )}
                  {openSession && (
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Active Session</p>
                          <p className="text-sm text-muted-foreground">
                            Opened {formatRelative(openSession.openedAt)} · Opening {formatCurrency(Number(openSession.openingCash))}
                          </p>
                        </div>
                        <Button variant="outline" onClick={() => setClosingSession(openSession)}>
                          Close
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {tab === "payments" && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {methods.length === 0 ? (
                    <EmptyState icon={<Banknote className="h-6 w-6" />} title="No payment methods" />
                  ) : (
                    methods.map((m) => (
                      <button
                        key={m.paymentMethod.id}
                        onClick={() => handleToggleMethod(m.paymentMethod.id)}
                        className={`cursor-pointer rounded-lg border p-4 text-left transition-colors ${
                          m.isActive ? "border-primary bg-primary/5" : "border-border bg-card"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{m.paymentMethod.name}</span>
                          <Badge variant={m.isActive ? "success" : "outline"}>{m.isActive ? "Active" : "Inactive"}</Badge>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {tab === "cash" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Cash Sessions</h3>
                    <Button icon={<Wallet className="h-4 w-4" />} onClick={() => setOpenModal(true)} disabled={!!openSession}>
                      Open Session
                    </Button>
                  </div>
                  {sessions.length === 0 ? (
                    <EmptyState icon={<Coins className="h-6 w-6" />} title="No sessions yet" description="Open a cash session to start recording cash payments." />
                  ) : (
                    <div className="space-y-2">
                      {sessions.map((s) => {
                        const closed = s.status === "closed";
                        return (
                          <Card key={s.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium">
                                  {formatDate(s.openedAt)} · Opened {formatTime(s.openedAt)}
                                  {closed && ` · Closed ${formatTime(s.closedAt!)}`}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  Opening {formatCurrency(Number(s.openingCash))}
                                  {closed && ` · Closing ${formatCurrency(Number(s.closingCash))} · Variance ${formatCurrency(Number(s.variance))}`}
                                </p>
                                {s.notes && <p className="mt-1 text-xs text-muted-foreground">{s.notes}</p>}
                              </div>
                              <Badge variant={closed ? "outline" : "success"}>{closed ? "Closed" : "Open"}</Badge>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {tab === "reports" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Button onClick={handleLoadReport} disabled={loading}>
                      {loading ? "Loading..." : "Load Report"}
                    </Button>
                  </div>
                  {reports && (
                    <div className="space-y-2">
                      {reports.length === 0 ? (
                        <EmptyState icon={<Receipt className="h-6 w-6" />} title="No bookings in range" />
                      ) : (
                        reports.map((b) => (
                          <Card key={b.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium">{formatDate(b.date)} · {formatTime(b.startTime)}–{formatTime(b.endTime)}</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {formatCurrency(Number(b.totalAmount))} · {b.finance?.paymentStatus ?? "no payment"}
                                </p>
                              </div>
                              <Badge variant="outline">{b.status.replace(/_/g, " ")}</Badge>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title="Open Cash Session"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpenModal(false)} disabled={working}>
              Cancel
            </Button>
            <Button onClick={handleOpenSession} loading={working}>
              Open Session
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Opening Cash" type="number" min="0" step="0.01" value={openingCash} onChange={(e) => setOpeningCash(e.target.value)} />
          <Textarea label="Notes (optional)" value={openingNotes} onChange={(e) => setOpeningNotes(e.target.value)} rows={2} />
        </div>
      </Modal>

      <Modal
        open={!!closingSession}
        onClose={() => setClosingSession(null)}
        title="Close Cash Session"
        footer={
          <>
            <Button variant="ghost" onClick={() => setClosingSession(null)} disabled={working}>
              Cancel
            </Button>
            <Button onClick={handleCloseSession} loading={working} variant="primary">
              Close Session
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Closing Cash" type="number" min="0" step="0.01" value={closingCash} onChange={(e) => setClosingCash(e.target.value)} />
          <Textarea label="Notes (optional)" value={closingNotes} onChange={(e) => setClosingNotes(e.target.value)} rows={2} />
        </div>
      </Modal>
    </div>
  );
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const mins = Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong";
}