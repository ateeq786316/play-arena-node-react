"use client";

import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@playarena/shared/api";
import { getStatusColor, formatDate } from "@playarena/shared/utils";
import type { MySubscriptionResponse, SubscriptionPlan } from "@playarena/shared/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { UsageBar } from "@/components/domain/UsageBar";

type PageState = "loading" | "error" | "success";

export default function MySubscriptionPage() {
  const [data, setData] = useState<MySubscriptionResponse | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [state, setState] = useState<PageState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [downgrading, setDowngrading] = useState(false);
  const [daysToExpiry, setDaysToExpiry] = useState<number | null>(null);
  const [downgradeTarget, setDowngradeTarget] = useState<SubscriptionPlan | null>(null);

  const fetchSubscription = useCallback(() => {
    Promise.all([
      api.get<{ plans: SubscriptionPlan[] }>("/api/subscriptions/plans"),
      api.get<MySubscriptionResponse>("/api/subscriptions/my"),
    ])
      .then(([plansRes, res]) => {
        setPlans(plansRes.plans);
        setData(res);
        if (res.subscription) {
          setDaysToExpiry(Math.max(0, Math.ceil((new Date(res.subscription.currentPeriodEnd).getTime() - Date.now()) / 86400000)));
        }
        setState("success");
      })
      .catch(() => {
        setError("Failed to load your subscription. Please try again.");
        setState("error");
      });
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const load = useCallback(() => {
    setState("loading");
    fetchSubscription();
  }, [fetchSubscription]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel? Your plan stays active until the period end.")) return;
    setCancelling(true);
    try {
      await api.post("/api/subscriptions/cancel");
      await load();
    } catch {
      setError("Cancel failed. Please try again.");
      setState("error");
    } finally {
      setCancelling(false);
    }
  };

  const handleDowngradeConfirm = async () => {
    if (!downgradeTarget) return;
    setDowngrading(true);
    try {
      await api.post<{ message: string }>("/api/subscriptions/downgrade", { planId: downgradeTarget.id });
      setDowngradeTarget(null);
      await load();
    } catch (e) {
      const msg = e instanceof ApiError && e.body?.message ? e.body.message : "Downgrade failed";
      setError(msg);
      setState("error");
    } finally {
      setDowngrading(false);
    }
  };

  if (state === "loading") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-56 w-full" />
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

  const subscription = data?.subscription;
  const plan = data?.plan;
  const usage = data?.usage;
  const trial = data?.trial;
  const lowerPlans = plans.filter((p) => plan && p.sortOrder < plan.sortOrder);

  if (!subscription || !plan || !usage) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Subscription</h1>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No active subscription.</p>
          <a href="/subscriptions" className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            View Plans
          </a>
        </Card>
      </div>
    );
  }

  const isTrial = subscription.status === "trial" && trial?.enabled;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Subscription</h1>
        <Badge className={getStatusColor(subscription.status)}>{subscription.status}</Badge>
      </div>

      {isTrial && trial && (
        <Card className="border-blue-300 bg-blue-50">
          <CardContent className="p-4 text-sm text-blue-800">
            Free trial ends in <span className="font-semibold">{trial.daysRemaining} day{trial.daysRemaining === 1 ? "" : "s"}</span>{" "}
            ({formatDate(trial.endsAt!)}). Grounds freeze after the trial unless you subscribe.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{plan.name}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Rs. {Number(plan.price).toLocaleString()}/{plan.interval === "monthly" ? "mo" : "yr"} ·{" "}
            {plan.analyticsRetentionDays} days analytics retention
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Period Start</p>
              <p className="font-medium">{formatDate(subscription.currentPeriodStart)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Period End</p>
              <p className="font-medium">
                {formatDate(subscription.currentPeriodEnd)}
                {daysToExpiry !== null && daysToExpiry <= 7 && <span className="ml-2 text-xs font-semibold text-amber-600">({daysToExpiry}d left)</span>}
              </p>
            </div>
          </div>
          <div className="space-y-4 border-t border-border pt-4">
            <UsageBar label="Grounds" used={usage.grounds} limit={usage.groundsLimit} onUpgrade={() => (window.location.href = "/subscriptions")} />
            <UsageBar label="Courts" used={usage.courts} limit={usage.courtsLimit} onUpgrade={() => (window.location.href = "/subscriptions")} />
            <UsageBar label="Staff accounts" used={usage.staff} limit={usage.staffLimit} onUpgrade={() => (window.location.href = "/subscriptions")} />
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground mb-2">Plan Features</p>
            <ul className="space-y-1 text-sm">
              <li>• {plan.maxGrounds < 0 ? "Unlimited" : plan.maxGrounds} ground{plan.maxGrounds === 1 ? "" : "s"} maximum</li>
              <li>• {plan.maxCourtsPerGround < 0 ? "Unlimited" : plan.maxCourtsPerGround} courts per ground</li>
              <li>• {Number(plan.commissionRate * 100)}% commission rate</li>
              {plan.maxBookingsPerMonth && <li>• {plan.maxBookingsPerMonth} bookings/month max</li>}
            </ul>
          </div>
          {subscription.status === "active" && (
            <div className="border-t border-border pt-4">
              {lowerPlans.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Downgrade to</p>
                  <div className="flex flex-wrap gap-2">
                    {lowerPlans.map((p) => (
                      <Button key={p.id} variant="outline" onClick={() => setDowngradeTarget(p)}>
                        {p.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <Button variant="danger" onClick={handleCancel} loading={cancelling}>
                {cancelling ? "Cancelling..." : "Cancel Subscription"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {downgradeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-lg">
            <h2 className="text-lg font-bold">Downgrade to {downgradeTarget.name}</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Downgrades take effect immediately. Your analytics retention will drop to{" "}
              <span className="font-semibold text-foreground">{downgradeTarget.analyticsRetentionDays} days</span> and you may
              lose access to grounds, courts, or staff above the plan&apos;s limits.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDowngradeTarget(null)}>Cancel</Button>
              <Button variant="danger" loading={downgrading} onClick={handleDowngradeConfirm}>
                {downgrading ? "Downgrading..." : "Confirm Downgrade"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
