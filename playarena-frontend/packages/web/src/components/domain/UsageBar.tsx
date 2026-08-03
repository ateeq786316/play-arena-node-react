"use client";

import { cn } from "@playarena/shared/utils";

interface UsageBarProps {
  label: string;
  used: number;
  limit: number;
  onUpgrade?: () => void;
}

export function UsageBar({ label, used, limit, onUpgrade }: UsageBarProps) {
  const isUnlimited = limit < 0;
  const ratio = isUnlimited ? 0 : limit === 0 ? 0 : Math.min(1, used / limit);
  const percent = Math.round(ratio * 100);
  const atLimit = !isUnlimited && used >= limit && limit > 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={cn("text-muted-foreground", atLimit && "font-semibold text-red-600")}>
          {isUnlimited ? "Unlimited" : `${used} / ${limit}`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            atLimit ? "bg-red-500" : ratio >= 0.8 ? "bg-amber-500" : "bg-primary",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {atLimit && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-red-600">Limit reached — upgrade to add more</p>
          {onUpgrade && (
            <button onClick={onUpgrade} className="text-xs font-medium text-primary hover:underline">
              Upgrade
            </button>
          )}
        </div>
      )}
    </div>
  );
}
