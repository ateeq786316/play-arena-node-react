# 052 — Admin Booking Management

**Type:** AFK | **Blocked by:** 009

## What to build

Build **Admin Booking Management** at `/admin/bookings`. **DataTable**: Booking ID (truncated), Ground, Court, Player Name, Date, Time, Amount, Payment Status badge, Booking Status badge, Created Date, Actions. **Filter**: by date range, ground, status, payment status, player search. **Row Actions**: [View Detail], [Cancel] (with reason, ConfirmDialog), [Mark Completed] (if stuck in wrong state). **Detail Drawer**: full booking info, payment breakdown, player info, ground info, status history timeline.

## Acceptance criteria

- [ ] Bookings table with all filters and search
- [ ] Cancel booking with reason
- [ ] Mark completed (admin override)
- [ ] Detail drawer with full info and timeline
- [ ] Loading, error, empty states
