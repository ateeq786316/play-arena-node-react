# 023 — Ground Dashboard Frontend

**Type:** AFK | **Blocked by:** 009, 016

## What to build

Build the ground dashboard at `/grounds/:id`. Top section: ground name header with verification status badge (pending/approved/rejected), subscription plan badge, quick action buttons [Edit Ground] [View Settings]. **KPI Row** (4 cards): Today's Bookings (count + trend arrow), Today's Revenue (PKR + cash/online split), Utilization Rate (%), Active Cash Session (staff name + opened at). **Second row** (4 cards): Pending Verification (days since submission, if pending), Open Complaints (count), Staff on Duty (count, link to staff page), Subscription Status (days remaining, upgrade CTA). **Charts**: Revenue 7-day bar chart (Recharts), Bookings 7-day line chart, Sport Split donut chart. **Bottom section**: Today's Schedule (timeline of courts with booked slots), Recent Bookings (last 10 as compact table), Quick Actions buttons row [Create Booking] [Open Cash Session] [Send Broadcast]. All 4 states: loading skeletons, error card, empty (no bookings today), success.

## Acceptance criteria

- [ ] Ground name header with verification badge and quick actions
- [ ] 4 KPI cards in first row with correct data
- [ ] 4 KPI cards in second row
- [ ] 3 charts render with Recharts (bar, line, donut)
- [ ] Today's schedule shows court timeline
- [ ] Recent bookings table with last 10
- [ ] Quick actions row with all buttons
- [ ] Loading, error, empty states for each data section
