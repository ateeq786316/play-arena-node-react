"use client";

import type { SubscriptionPlan } from "@playarena/shared/types";
import { Button } from "@/components/ui/Button";

export interface PlanComparisonTableProps {
  plans: SubscriptionPlan[];
  currentPlanId?: string | null;
  disabledPlanId?: string | null;
  actionLabel?: (plan: SubscriptionPlan) => string;
  onSelect?: (plan: SubscriptionPlan) => void;
}

function formatLimit(value: number, unit: string) {
  return value < 0 ? `Unlimited ${unit}` : value === 1 ? `1 ${unit}` : `${value} ${unit}s`;
}

export function PlanComparisonTable({
  plans,
  currentPlanId,
  disabledPlanId,
  actionLabel = (p) => (p.sortOrder === 0 ? "Current" : "Upgrade"),
  onSelect,
}: PlanComparisonTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="w-40 px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
            {plans.map((p) => (
              <th key={p.id} className="px-4 py-3 text-left font-semibold">
                <span className={p.sortOrder === 1 ? "text-primary" : ""}>{p.name}</span>
                {p.sortOrder === 1 && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">Popular</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <PlanRow label="Price" render={(p) => `Rs. ${Number(p.price).toLocaleString()}/${p.interval === "monthly" ? "mo" : "yr"}`} plans={plans} />
          <PlanRow label="Grounds" render={(p) => formatLimit(p.maxGrounds, "ground")} plans={plans} />
          <PlanRow label="Courts per ground" render={(p) => formatLimit(p.maxCourtsPerGround, "court")} plans={plans} />
          <PlanRow
            label="Bookings/month"
            render={(p) => (p.maxBookingsPerMonth ? `${p.maxBookingsPerMonth}` : "Unlimited")}
            plans={plans}
          />
          <PlanRow label="Commission" render={(p) => `${Number(p.commissionRate * 100)}%`} plans={plans} />
          <PlanRow label="Analytics retention" render={(p) => `${p.analyticsRetentionDays} days`} plans={plans} />
          <PlanRow
            label="Staff accounts"
            render={(p) => {
              const limit = "maxStaff" in p ? (p as SubscriptionPlan & { maxStaff?: number }).maxStaff : undefined;
              return limit == null || limit < 0 ? "Unlimited" : `${limit}`;
            }}
            plans={plans}
          />
          <tr className="border-t border-border bg-muted/30">
            <td className="px-4 py-3 font-medium">Choose</td>
            {plans.map((p) => {
              const isCurrent = currentPlanId === p.id;
              const isDisabled = isCurrent || disabledPlanId === p.id;
              return (
                <td key={p.id} className="px-4 py-3">
                  <Button
                    variant={isCurrent ? "secondary" : "primary"}
                    disabled={isDisabled}
                    onClick={() => onSelect?.(p)}
                  >
                    {actionLabel(p)}
                  </Button>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function PlanRow({
  label,
  render,
  plans,
}: {
  label: string;
  render: (plan: SubscriptionPlan) => string;
  plans: SubscriptionPlan[];
}) {
  return (
    <tr className="border-b border-border">
      <td className="px-4 py-3 text-muted-foreground">{label}</td>
      {plans.map((p) => (
        <td key={p.id} className="px-4 py-3">
          {render(p)}
        </td>
      ))}
    </tr>
  );
}
