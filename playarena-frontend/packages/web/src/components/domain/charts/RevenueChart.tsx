"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

interface RevenuePoint {
  date: string;
  totalRevenue: number;
  onlineRevenue: number;
  offlineRevenue: number;
}

interface RevenueChartProps {
  data: RevenuePoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickFormatter={(v: string) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickFormatter={(v: number) => `Rs. ${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: ValueType | undefined, name: NameType | undefined) => [formatRupees(Number(value)), String(name ?? "")]}
          labelFormatter={(label) => new Date(String(label)).toLocaleDateString()}
        />
        <Line type="monotone" dataKey="totalRevenue" name="Total Revenue" stroke="var(--primary)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="onlineRevenue" name="Online" stroke="#10b981" strokeWidth={1.5} dot={false} />
        <Line type="monotone" dataKey="offlineRevenue" name="Offline" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function formatRupees(value: number) {
  return `Rs. ${Number(value).toLocaleString()}`;
}
