"use client";

import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@playarena/shared/api";
import { getStatusColor, formatDate } from "@playarena/shared/utils";
import type { SubscriptionPlan, MySubscriptionResponse } from "@playarena/shared/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { UsageBar } from "@/components/domain/UsageBar";
import { PlanComparisonTable } from "@/components/domain/PlanComparisonTable";

type PageState = "loading" | "error" | "success";

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [current, setCurrent] = useState<MySubscriptionResponse | null>(null);
  const [state, setState] = useState<PageState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null);
  const [daysToExpiry, setDaysToExpiry] = useState<number | null>(null);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    Promise.all([
      api.get<{ plans: SubscriptionPlan[] }>("/api/subscriptions/plans"),
      api.get<MySubscriptionResponse>("/api/subscriptions/my").catch(() => null),
    ])
      .then(([plansRes, myRes]) => {
        setPlans(plansRes.plans);
        setCurrent(myRes);
        if (myRes?.subscription) {
          setDaysToExpiry(Math.max(0, Math.ceil((new Date(myRes.subscription.currentPeriodEnd).getTime() - Date.now()) / 86400000)));
        }
        setState("success");
      })
      .catch(() => {
        setError("Failed to load subscriptions. Please try again.");
        setState("error");
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const load = useCallback(() => {
    setState("loading");
    fetchData();
  }, [fetchData]);

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);
    setUpgradeMsg(null);
    setPendingPlanId(null);
    try {
      const res = await api.post<{ message: string }>("/api/subscriptions/upgrade", { planId });
      setPendingPlanId(planId);
      setUpgradeMsg(res.message || "Upgrade requested. Awaiting payment confirmation.");
      await load();
    } catch (e) {
      const msg = e instanceof ApiError && e.body?.message ? e.body.message : "Upgrade failed";
      setUpgradeMsg(msg);
    } finally {
      setUpgrading(null);
    }
  };

  const plan = current?.plan ?? null;
  const subscription = current?.subscription ?? null;
  const usage = current?.usage;
  const trial = current?.trial;

  const needsRenewalReminder = subscription && subscription.status === "active" && daysToExpiry !== null && daysToExpiry <= 7;
  const needsTrialCountdown = trial?.enabled && trial.daysRemaining <= 3;
  const isPendingPayment = subscription?.status === "pending_payment";
  const pendingPlan = pendingPlanId ? plans.find((p) => p.id === pendingPlanId) : null;

  const scrollToUpgrade = () => {
    document.getElementById("plan-comparison")?.scrollIntoView({ behavior: "smooth" });
  };

  if (state === "loading") {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose a plan that fits your business</p>
      </div>

      {(needsRenewalReminder || needsTrialCountdown || upgradeMsg || (isPendingPayment && pendingPlan)) && (
        <div className="space-y-3">
          {needsRenewalReminder && (
            <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                Your plan expires on <span className="font-semibold">{formatDate(subscription!.currentPeriodEnd)}</span>{" "}
                ({daysToExpiry} day{daysToExpiry === 1 ? "" : "s"} left).
              </p>
              <Button variant="outline" onClick={scrollToUpgrade}>Renew</Button>
            </div>
          )}
          {needsTrialCountdown && (
            <div className="rounded-xl border border-blue-300 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                Your free trial ends in <span className="font-semibold">{trial!.daysRemaining} day{trial!.daysRemaining === 1 ? "" : "s"}</span>.
                After it ends, your grounds will be frozen until you subscribe.
              </p>
            </div>
          )}
          {isPendingPayment && pendingPlan && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                Your upgrade to <span className="font-semibold">{pendingPlan.name}</span> is awaiting payment confirmation.
                An admin will confirm your payment shortly.
              </p>
            </div>
          )}
          {upgradeMsg && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">{upgradeMsg}</div>
          )}
        </div>
      )}

      {plan && subscription && usage && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Current Plan: {plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Rs. {Number(plan.price).toLocaleString()}/{plan.interval === "monthly" ? "mo" : "yr"} ·{" "}
                <Badge className={getStatusColor(subscription.status)}>{subscription.status}</Badge>
              </p>
            </div>
            <Badge variant="primary-light">{plan.analyticsRetentionDays} days analytics retention</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <UsageBar label="Grounds" used={usage.grounds} limit={usage.groundsLimit} onUpgrade={scrollToUpgrade} />
            <UsageBar label="Courts" used={usage.courts} limit={usage.courtsLimit} onUpgrade={scrollToUpgrade} />
            <UsageBar label="Staff accounts" used={usage.staff} limit={usage.staffLimit} onUpgrade={scrollToUpgrade} />
          </CardContent>
        </Card>
      )}

      <div id="plan-comparison">
        <h2 className="mb-3 text-lg font-semibold">Compare Plans</h2>
        <PlanComparisonTable
          plans={plans}
          currentPlanId={subscription?.planId ?? undefined}
          disabledPlanId={upgrading ?? undefined}
          onSelect={(p) => handleUpgrade(p.id)}
        />
      </div>
    </div>
  );
}
