"use client";

import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import type { PlatformTrend } from "@playarena/shared/types";

interface PlatformTrendsChartProps {
  data: PlatformTrend[];
}

export function PlatformTrendsChart({ data }: PlatformTrendsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickFormatter={(v: string) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        />
        <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} allowDecimals={false} />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickFormatter={(v: number) => `Rs. ${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: ValueType | undefined, name: NameType | undefined) => {
            if (name === "MRR") return [`Rs. ${Number(value).toLocaleString()}`, String(name)];
            return [Number(value), String(name)];
          }}
          labelFormatter={(label) => new Date(String(label)).toLocaleDateString()}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="newSubscriptions" name="New" fill="var(--primary)" />
        <Bar yAxisId="left" dataKey="cancellations" name="Cancelled" fill="#f43f5e" />
        <Line yAxisId="right" type="monotone" dataKey="mrr" name="MRR" stroke="#10b981" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
