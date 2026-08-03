# 047 — Walk-in Booking Creation

**Type:** AFK | **Blocked by:** 009

## What to build

Build the walk-in booking creation form on the staff dashboard at `/ops` (or as a modal from the main page). **Form**: Court (dropdown of ground's courts) *, Date (default today) *, Start Time *, End Time *, Player Name *, Player Phone *, Amount (auto-calculated from pricing rules, editable), Payment Method (Cash / JazzCash / Easypaisa / Bank Transfer / Unpaid), Amount Paid (if taking payment now), Reference ID (if JazzCash/Easypaisa/Bank Transfer), Notes (optional). **On submit**: if fully paid → booking created as `confirmed` + payment logged + cash session updated. If partial pay → booking `confirmed` + payment logged with remaining as pending. If unpaid → booking `confirmed` with payment status `unpaid`. Success toast with booking details. Validation: all required fields, time not overlapping existing booking, court/date/time available. Loading on submit. Error: inline field errors.

## Acceptance criteria

- [ ] Walk-in form with all fields
- [ ] Auto-calculate amount from pricing rules
- [ ] Payment method selector with reference field
- [ ] Partial payment support
- [ ] Unpaid option
- [ ] Time overlap validation
- [ ] Success toast with booking ID
- [ ] Inline validation errors
- [ ] Loading state on submit
