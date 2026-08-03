# 066 — Revenue Reports Backend

**Type:** AFK | **Blocked by:** 007

## What to build

Build backend endpoints for revenue reporting. `GET /api/grounds/:id/revenue` with query params: `startDate`, `endDate`, `groupBy` (day/week/month). Returns aggregated data: totalRevenue, onlineRevenue, offlineRevenue (cash/jazzcash/etc.), bookingCount, commission, netToOwner. `GET /api/grounds/:id/revenue/by-method` returns revenue split by payment method. `GET /api/grounds/:id/revenue/by-sport` returns revenue by sport type. `GET /api/admin/revenue` — platform-wide version accessible by Admin/Super Admin. All endpoints return paginated results with total summaries. Write tests.

## Acceptance criteria

- [ ] Revenue endpoint with date range and groupBy
- [ ] Revenue by payment method endpoint
- [ ] Revenue by sport type endpoint
- [ ] Admin platform-wide revenue endpoint
- [ ] All return correct aggregation math
- [ ] Tests pass
