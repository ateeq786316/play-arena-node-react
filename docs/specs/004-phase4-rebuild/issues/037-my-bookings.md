# 037 — My Bookings

**Type:** AFK | **Blocked by:** 009

## What to build

Build My Bookings page at `/bookings`. **Tabs**: Upcoming (default), Past, Cancelled. **Booking Cards** (card list, not table): ground image thumbnail, ground name, court name, date, start-end time, status badge (confirmed/green, pending_payment/amber, cancelled/red, completed/blue), amount, payment status badge. Upcoming cards show: countdown timer to start, QR code for check-in, [Cancel] button (if within policy). Past cards show: [Review Ground] button if not yet reviewed. **Booking Detail** at `/bookings/[id]`: full info, payment breakdown table, check-in QR code (large), [Add to Calendar], [Directions], ground contact info. Cancel booking → ConfirmDialog → reason selector → cancellation result with refund info. **Empty state** per tab: "No upcoming bookings" + "Browse Grounds" CTA. Loading: skeleton cards.

## Acceptance criteria

- [ ] Upcoming/Past/Cancelled tabs
- [ ] Booking cards with all info and status badges
- [ ] Countdown timer on upcoming bookings
- [ ] QR code for check-in
- [ ] Cancel booking with reason and refund info
- [ ] Booking detail page with payment breakdown
- [ ] Loading skeletons, empty states per tab
- [ ] Error state with retry
