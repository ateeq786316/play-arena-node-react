# 081 — Analytics Aggregation Cron

**Type:** AFK | **Blocked by:** 007

## What to build

Create `src/cron/analyticsAggregation.js`. Runs daily at 00:00 (or 01:00 to avoid midnight load). For each active ground, compute daily `AnalyticsSnapshot`:

- `totalRevenue`: sum of all completed booking payments for that day
- `onlineRevenue`: payments via online methods
- `offlineRevenue`: cash/manual payments
- `totalBookings`: count of bookings created that day
- `completedBookings`: count completed
- `cancelledBookings`: count cancelled
- `utilizationRate`: booked hours / total available hours × 100
- `newCustomers`: count of first-time players at this ground
- `returningCustomers`: count of players who have booked before
- `avgBookingValue`: average amount per booking

Only create snapshots for days that don't already exist (idempotent). Write tests.

## Acceptance criteria

- [ ] Daily snapshot created for each active ground
- [ ] All 10 metrics computed correctly
- [ ] Idempotent (skips existing dates)
- [ ] Tests pass
