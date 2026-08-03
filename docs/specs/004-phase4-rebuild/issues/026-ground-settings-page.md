# 026 — Ground Settings Page

**Type:** AFK | **Blocked by:** 010

## What to build

Build the ground settings page at `/grounds/:id/settings`. Organized into sections with cards:

**Booking Settings**: Allow Online Booking (toggle), Allow Walk-in Booking (toggle), Walk-in Requires Pre-payment (toggle), Auto-Cancel Unpaid After (number input, minutes), Advance Booking Days (number), Min Booking Duration (number, minutes), Max Booking Duration (number, minutes), Max Bookings Per Player Per Day (number).

**Deposit & Cancellation**: Require Deposit (toggle), Deposit Percentage (number, %), Cancellation Policy (select: flexible/moderate/strict), Allow Cancellation By Player (toggle), Full Refund Window (number, hours before), Partial Refund Window (number, hours before, 50% refund), No Refund After (number, hours before).

**Check-in & No-Show**: Check-in Required (toggle), Auto-Mark No-Show After (number, minutes), Late Fee Percentage (number, %).

**Fees**: VAT/GST Percentage (number), Service Fee Percentage (number).

**Contact**: Phone, Email, WhatsApp Number, Address textarea, Google Maps Link.

All toggles and inputs save independently via `PATCH /api/grounds/:id/settings`. Show loading skeleton while fetching, error state on save failure with retry, success toast on save.

## Acceptance criteria

- [ ] All 20+ settings displayed in categorized cards
- [ ] Toggles and inputs save independently with debounce
- [ ] Loading skeleton shown while fetching settings
- [ ] Error state with retry on save failure
- [ ] Success toast on each save
- [ ] Ground contact info section saves separately
