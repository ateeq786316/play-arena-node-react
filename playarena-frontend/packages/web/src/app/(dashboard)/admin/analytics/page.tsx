"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@playarena/shared/api";
import { formatDate } from "@playarena/shared/utils";
import type { PlatformSummary, PlatformTrend, ExpiringSubscription } from "@playarena/shared/types";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/ui/StatCard";
import { PlatformTrendsChart } from "@/components/domain/charts/PlatformTrendsChart";

type PageState = "loading" | "error" | "success";

export default function AdminAnalyticsPage() {
  const user = useAuthStore((s) => s.user);
  const [summary, setSummary] = useState<PlatformSummary | null>(null);
  const [trends, setTrends] = useState<PlatformTrend[]>([]);
  const [expiring, setExpiring] = useState<ExpiringSubscription[]>([]);
  const [state, setState] = useState<PageState>("loading");
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    Promise.all([
      api.get<PlatformSummary>("/api/analytics/platform/summary"),
      api.get<{ trends: PlatformTrend[] }>("/api/analytics/platform/trends"),
      api.get<{ subscriptions: ExpiringSubscription[] }>("/api/analytics/platform/expiring?days=7"),
    ])
      .then(([summaryRes, trendsRes, expiringRes]) => {
        setSummary(summaryRes);
        setTrends(trendsRes.trends);
        setExpiring(expiringRes.subscriptions);
        setState("success");
      })
      .catch(() => {
        setError("Failed to load platform analytics. Please try again.");
        setState("error");
      });
  }, []);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "super_admin") {
      fetchData();
    }
  }, [user, fetchData]);

  const load = useCallback(() => {
    setState("loading");
    fetchData();
  }, [fetchData]);

  if (user?.role !== "admin" && user?.role !== "super_admin") {
    return <p className="text-sm text-muted-foreground">Access denied. Admin only.</p>;
  }

  if (state === "loading") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <Button variant="outline" className="mt-4" onClick={load}>Retry</Button>
      </Card>
    );
  }

  const totalSubscribers = Object.values(summary?.statusDistribution ?? {}).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Platform Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Subscription health across all owners
          {summary?.generatedAt ? ` · generated ${new Date(summary.generatedAt).toLocaleString()}` : ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Subscribers" value={totalSubscribers.toLocaleString()} hint="All subscription statuses" />
        <StatCard label="MRR" value={summary ? `Rs. ${Number(summary.mrr).toLocaleString()}` : "—"} hint="Monthly recurring revenue" accent="success" />
        <StatCard
          label="Active"
          value={(summary?.statusDistribution.active ?? 0).toLocaleString()}
          hint="Paying active subscriptions"
        />
        <StatCard
          label="Expiring ≤ 7 days"
          value={expiring.length.toLocaleString()}
          hint="Subscriptions nearing renewal"
          accent={expiring.length > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscribers per Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {summary && summary.subscribersPerPlan.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subscriptions yet.</p>
            ) : (
              <div className="space-y-4">
                {summary?.subscribersPerPlan.map((entry) => {
                  const statuses = Object.entries(entry.statusBreakdown);
                  return (
                    <div key={entry.plan.id}>
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{entry.plan.name}</p>
                        <p className="text-sm text-muted-foreground">{entry.count} subscriber{entry.count === 1 ? "" : "s"}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {statuses.map(([status, count]) => (
                          <Badge key={status} className="bg-muted text-muted-foreground">
                            {status.replace(/_/g, " ")}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {summary && Object.keys(summary.statusDistribution).length === 0 ? (
              <p className="text-sm text-muted-foreground">No subscriptions yet.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(summary?.statusDistribution ?? {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{status.replace(/_/g, " ")}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>MRR & Subscription Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {trends.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trend data available.</p>
          ) : (
            <PlatformTrendsChart data={trends} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expiring Within 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          {expiring.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subscriptions expiring within 7 days.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Owner</th>
                    <th className="py-2 pr-4 font-medium">Email</th>
                    <th className="py-2 pr-4 font-medium">Plan</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 font-medium">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {expiring.map((sub) => (
                    <tr key={sub.id} className="border-b border-border">
                      <td className="py-2 pr-4 font-medium">{sub.owner.name}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{sub.owner.email}</td>
                      <td className="py-2 pr-4">{sub.plan.name}</td>
                      <td className="py-2 pr-4">
                        <Badge className="bg-muted text-muted-foreground">{sub.status.replace(/_/g, " ")}</Badge>
                      </td>
                      <td className="py-2">{formatDate(sub.currentPeriodEnd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
