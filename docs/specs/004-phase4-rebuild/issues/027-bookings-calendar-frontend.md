# 027 — Bookings Calendar Frontend

**Type:** AFK | **Blocked by:** 010

## What to build

Build the bookings calendar page at `/grounds/:id/bookings`. View Type Toggle: Day / Week / Month.

**Day View (default)**: Left column = court names. Grid = time slots (rows) × courts (columns). Booked slots highlighted with player name and status color (confirmed/green, pending_payment/amber, cancelled/red, completed/blue). Empty slots are light gray. Click a booked slot → Detail Drawer slides in from right with: player name, phone, court, date, start-end, total amount, paid/pending, payment method, check-in status, status badge, actions [Check In] [Mark Paid] [Cancel] [Mark No-Show]. Click an empty slot → Quick Create form: Player Name *, Phone *, Amount (auto-calculated, editable), Payment method, Amount Paid, Notes, [Create Booking] button.

**Week View**: 7-day grid, courts on Y axis, days on X axis. **Month View**: Calendar with dots indicating days with bookings.

Filters bar: Date range picker, court selector, status filter (all/confirmed/pending/cancelled/completed), payment status (paid/unpaid/partial), player search. Export button: [Export PDF] [Export CSV].

## Acceptance criteria

- [ ] Day/Week/Month view toggle works
- [ ] Day view shows court × time grid with colored slots
- [ ] Clicking booked slot opens detail drawer with all info
- [ ] Clicking empty slot opens quick create form
- [ ] Quick create booking works end-to-end
- [ ] Week and Month views render correctly
- [ ] Filters work and re-render results
- [ ] Export triggers file download
- [ ] Loading, error, empty states handled
