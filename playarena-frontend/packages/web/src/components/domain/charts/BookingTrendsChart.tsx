"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface BookingPoint {
  date: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

interface BookingTrendsChartProps {
  data: BookingPoint[];
}

export function BookingTrendsChart({ data }: BookingTrendsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickFormatter={(v: string) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        />
        <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
        <Tooltip
          labelFormatter={(label) => new Date(String(label)).toLocaleDateString()}
        />
        <Legend />
        <Bar dataKey="totalBookings" name="Total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="completedBookings" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="cancelledBookings" name="Cancelled" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
