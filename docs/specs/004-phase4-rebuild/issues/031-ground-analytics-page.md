# 031 — Ground Analytics Page

**Type:** AFK | **Blocked by:** 010

## What to build

Build the ground analytics page at `/grounds/:id/analytics`. Date range filter: 7d/30d/90d/1yr/Custom. **Report sections** (card per section):

1. **Utilization Rate** — line chart showing % of available hours booked over time, per-court breakdown bar chart
2. **Booking Lead Time** — average days in advance players book (number + trend)
3. **Cancellation Rate** — % of bookings cancelled (number + trend line)
4. **No-Show Rate** — % of bookings not checked in (number + trend)
5. **Repeat vs New Customers** — pie chart split, repeat rate percentage
6. **Popular Sports** — booking count by sport type (horizontal bar chart)
7. **Revenue Per Court** — which court generates most revenue (bar chart sorted descending)
8. **Hourly Revenue Distribution** — revenue by hour of day (6am to midnight)
9. **Day-of-Week Analysis** — revenue + booking count by day (Mon-Sun bar chart)

Each section shows the chart + key number + comparison to previous period. Export as PDF report button. All 4 states: loading skeletons, error with retry, empty ("Not enough data yet"), success.

## Acceptance criteria

- [ ] 9 analytics report sections rendered as cards
- [ ] Charts render with Recharts (line, bar, pie, horizontal bar)
- [ ] Date range filter changes all sections
- [ ] Key metrics show comparison to previous period
- [ ] Export PDF button
- [ ] Loading skeletons per section (not one big spinner)
- [ ] Error state per section with retry
- [ ] Empty state when insufficient data
