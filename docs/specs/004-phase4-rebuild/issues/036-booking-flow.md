# 036 — Booking Flow

**Type:** AFK | **Blocked by:** 009

## What to build

Build the booking flow that starts when a player selects an available slot. **Step 1 — Confirm Slot**: Shows selected court, date, time, duration, base price, any dynamic pricing adjustments, total amount. **Step 2 — Player Details**: Name (pre-filled from profile), phone (pre-filled). **Step 3 — Payment**: If online payment gateway active → [Pay Online] button. If not → [Book & Pay at Venue] option. If owner requires deposit → show deposit amount. **Step 4 — Confirmation**: Booking created with status `pending_payment` (if unpaid) or `confirmed` (if paid online). Show booking ID, QR code for check-in, ground address, directions link, "Add to Calendar" button. Send notification. All 4 states: loading skeleton on confirm, error with retry, success with booking details, validation errors on form fields.

## Acceptance criteria

- [ ] Multi-step booking flow (confirm → details → payment → done)
- [ ] Dynamic pricing reflected in total
- [ ] Online payment option (if available) or Pay at Venue
- [ ] Deposit handling if required
- [ ] Booking confirmation with QR code
- [ ] Notification sent on confirmation
- [ ] Loading, error, validation states handled
