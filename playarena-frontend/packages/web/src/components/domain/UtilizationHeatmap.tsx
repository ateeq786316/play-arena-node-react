"use client";

import type { DailyAggregation } from "@playarena/shared/types";

interface UtilizationHeatmapProps {
  data: DailyAggregation[];
}

function heatColor(value: number, max: number) {
  const ratio = max > 0 ? value / max : 0;
  if (ratio === 0) return "bg-muted";
  if (ratio < 0.33) return "bg-emerald-200";
  if (ratio < 0.66) return "bg-emerald-400";
  return "bg-emerald-600";
}

function courtName(courtId: string) {
  return courtId.length >= 8 ? courtId.slice(0, 8) : courtId;
}

export function UtilizationHeatmap({ data }: UtilizationHeatmapProps) {
  const days = [...new Set(data.map((d) => d.date))].sort();
  const courts = [...new Set(data.map((d) => d.courtId))].sort();
  const byKey = new Map<string, number>();
  for (const d of data) {
    const key = `${d.courtId}|${d.date}`;
    byKey.set(key, (byKey.get(key) ?? 0) + d.bookings);
  }
  const maxBookings = Math.max(1, ...byKey.values());

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No utilization data for this period.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="py-1 pr-2 text-left font-medium text-muted-foreground sticky left-0 bg-background">Court / Day</th>
            {days.map((d) => (
              <th key={d} className="px-1 py-1 font-medium text-muted-foreground">
                {new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {courts.map((courtId) => (
            <tr key={courtId}>
              <td className="py-0.5 pr-2 text-muted-foreground sticky left-0 bg-background">{courtName(courtId)}</td>
              {days.map((d) => {
                const bookings = byKey.get(`${courtId}|${d}`) ?? 0;
                return (
                  <td
                    key={`${courtId}|${d}`}
                    className={`h-5 w-8 rounded ${heatColor(bookings, maxBookings)}`}
                    title={bookings > 0 ? `${bookings} booking(s)` : undefined}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
