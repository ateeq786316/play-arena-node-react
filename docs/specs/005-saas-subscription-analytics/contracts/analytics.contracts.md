# Analytics Module — API Contracts

**Base path**: `/api/analytics`
**Auth**: JWT (owner) for owner routes; JWT (admin/super_admin) for `/platform` routes.

---

## Owner routes (unchanged paths, modified behavior)

## GET `/:groundId/dashboard`
- **Auth**: JWT (owner/manager with access)
- **Query**: `startDate?`, `endDate?`
- **Behavior changes**:
  - `groundId` must belong to an `isVerified == true` ground (Clarification Q4 — pending/rejected excluded).
  - Retention clamp: `startDate` is clamped to `today - (plan.analyticsRetentionDays - 1)` (soft enforcement FR-013). If requested window is entirely beyond retention, returns empty series with `retentionNotice`.
  - Response includes `dataAsOf` (last aggregated date) and `retentionDays` (FR-010).
- **Response 200**:
```json
{
  "snapshots": [ { "date": "...", "totalRevenue": 0, "totalBookings": 0, "utilizationRate": null, ... } ],
  "revenue": { "totalRevenue": 0, "totalBookings": 0, "avgBookingValue": 0 },
  "bookings": { "total": 0, "completed": 0, "cancelled": 0 },
  "period": { "startDate": "...", "endDate": "..." },
  "dataAsOf": "2026-07-30",
  "retentionDays": 7,
  "retentionNotice": null
}
```

## GET `/:groundId/heatmap`
- **Auth**: JWT (owner/manager with access)
- **Query**: `startDate?`, `endDate?`
- **Behavior**: same retention clamp as dashboard. Returns court × hour occupancy grid for the window (FR-008).
- **Response 200**: `{ heatmap: [{ courtId, date, hour, bookings, revenue }] }`

## GET `/:groundId/report`
- **Auth**: JWT (owner/manager with access)
- **Query**: `startDate?`, `endDate?`, `export?=csv`
- **Behavior**: `export=csv` → `Content-Type: text/csv; charset=utf-8` + `Content-Disposition: attachment; filename="report_<groundId>_<range>.csv"` with RFC 4180 rows (date, revenue, online, offline, bookings, completed, cancelled, utilization, new, returning, avgValue). Without `export` → JSON (backward compatible). Same retention clamp (FR-011/FR-012/FR-013).

---

## Platform routes (NEW)

## GET `/platform/summary`
- **Auth**: JWT (admin/super_admin — read-only, FR-022)
- **Response 200**:
```json
{
  "subscribersPerPlan": [ { "plan": { "id": "...", "name": "Starter" }, "count": 12, "statusBreakdown": { "active": 10, "pending_payment": 2 } } ],
  "mrr": 35988.00,
  "statusDistribution": { "active": 45, "pending_payment": 3, "past_due": 2, "suspended": 1, "trial": 20, "cancelled": 5, "expired": 8 },
  "generatedAt": "2026-07-31T04:00:00+05:00"
}
```

## GET `/platform/expiring`
- **Auth**: JWT (admin/super_admin)
- **Query**: `days?=7`
- **Response 200**: `{ subscriptions: [{ id, owner: { name, email }, plan: { name }, status, currentPeriodEnd }] }`

## GET `/platform/trends`
- **Auth**: JWT (admin/super_admin)
- **Query**: `startDate?`, `endDate?` (default last 30 days)
- **Response 200**: `{ trends: [{ date, newSubscriptions, cancellations, mrr }] }`

---

## Key Types

```typescript
type AnalyticsSnapshot = {
  id: string;
  groundId: string;
  date: string;                       // YYYY-MM-DD
  totalRevenue: number;
  onlineRevenue: number;
  offlineRevenue: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  utilizationRate: number | null;
  newCustomers: number;
  returningCustomers: number;
  avgBookingValue: number | null;
};

type DailyAggregation = {             // NEW shared type
  id: string;
  groundId: string;
  date: string;
  hour: number;
  courtId: string;
  bookings: number;
  revenue: number;
};

type PlatformSummary = {
  subscribersPerPlan: Array<{ plan: { id: string; name: string }; count: number; statusBreakdown: Record<string, number> }>;
  mrr: number;
  statusDistribution: Record<SubscriptionStatus, number>;
  generatedAt: string;
};
```
