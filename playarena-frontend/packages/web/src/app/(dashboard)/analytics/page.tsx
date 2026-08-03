"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@playarena/shared/api";
import type { AnalyticsSnapshot, DailyAggregation, Ground } from "@playarena/shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { RevenueChart } from "@/components/domain/charts/RevenueChart";
import { BookingTrendsChart } from "@/components/domain/charts/BookingTrendsChart";
import { UtilizationHeatmap } from "@/components/domain/UtilizationHeatmap";
import { RetentionNotice } from "@/components/domain/RetentionNotice";

interface DashboardData {
  snapshots: AnalyticsSnapshot[];
  revenue: { totalRevenue: number; totalBookings: number; avgBookingValue: number };
  bookings: { total: number; completed: number; cancelled: number };
  dataAsOf: string | null;
  retentionDays: number;
  retentionNotice: string | null;
}

type PageState = "loading" | "success" | "error";

export default function AnalyticsPage() {
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [selectedGround, setSelectedGround] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [heatmap, setHeatmap] = useState<DailyAggregation[]>([]);
  const [state, setState] = useState<PageState>("loading");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  const fetchDashboard = useCallback(() => {
    if (!selectedGround) return;
    Promise.all([
      api.get<DashboardData>(`/api/analytics/${selectedGround}/dashboard?startDate=${startDate}&endDate=${endDate}`),
      api.get<{ heatmap: DailyAggregation[] }>(`/api/analytics/${selectedGround}/heatmap?startDate=${startDate}&endDate=${endDate}`),
    ])
      .then(([dash, heat]) => {
        setData(dash);
        setHeatmap(heat.heatmap);
        setState("success");
      })
      .catch(() => setState("error"));
  }, [selectedGround, startDate, endDate]);

  const load = useCallback(() => {
    setState("loading");
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    api.get<{ grounds: Ground[] }>("/api/grounds/my")
      .then((res) => {
        setGrounds(res.grounds);
        if (res.grounds.length) setSelectedGround(res.grounds[0].id);
        else setState("success");
      })
      .catch(() => setState("error"));
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleDownload = () => {
    window.open(`/api/analytics/${selectedGround}/report?startDate=${startDate}&endDate=${endDate}`, "_blank");
  };

  if (state === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-sm text-muted-foreground">Failed to load analytics.</p>
        <Button onClick={load}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <select
          value={selectedGround}
          onChange={(e) => setSelectedGround(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
        >
          {grounds.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div className="flex gap-3 items-center">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm" />
        <span className="text-muted-foreground">to</span>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm" />
        <Button onClick={handleDownload} className="ml-auto" variant="secondary">Download CSV</Button>
      </div>

      {state === "loading" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : data ? (
        <>
          {data.retentionNotice && (
            <RetentionNotice message={data.retentionNotice} retentionDays={data.retentionDays} />
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Revenue" value={`Rs. ${Number(data.revenue.totalRevenue).toLocaleString()}`} />
            <StatCard label="Total Bookings" value={data.bookings.total} />
            <StatCard label="Avg Booking Value" value={`Rs. ${Number(data.revenue.avgBookingValue).toLocaleString()}`} />
            <StatCard
              label="Completion Rate"
              value={data.bookings.total > 0 ? `${Math.round((data.bookings.completed / data.bookings.total) * 100)}%` : "0%"}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {data.snapshots.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No data for this period.</p>
                ) : (
                  <RevenueChart data={data.snapshots} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {data.snapshots.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No data for this period.</p>
                ) : (
                  <BookingTrendsChart data={data.snapshots} />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Utilization Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <UtilizationHeatmap data={heatmap} />
            </CardContent>
          </Card>

          {data.dataAsOf && (
            <p className="text-xs text-muted-foreground text-right">
              Data as of {new Date(data.dataAsOf).toLocaleDateString()} · {data.retentionDays}-day retention window
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Select a ground to view analytics.</p>
      )}
    </div>
  );
}
