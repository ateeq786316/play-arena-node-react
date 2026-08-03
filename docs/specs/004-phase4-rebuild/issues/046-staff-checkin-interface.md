# 046 — Staff Check-in Interface

**Type:** AFK | **Blocked by:** 009

## What to build

Build the staff operations dashboard at `/ops`. **Today's Bookings** table: Time, Court, Player Name, Phone, Amount, Status (Confirmed/Checked In/No-Show/Pending), Actions columns. Each row has action buttons based on status:
- `confirmed` → [Check In] [Mark No-Show]
- `checked_in` → "Checked in at HH:mm" (read-only)
- `no_show` → "No-Show" badge (read-only)

**Check In** flow: tap button → ConfirmDialog with player name + booking details → confirm → status changes to `checked_in`, timestamp logged. **Mark No-Show**: ConfirmDialog → confirm → status changes to `no_show`. **Search Box** at top: search by player name or phone to quickly find a booking. **Stats bar** at top: Total Bookings Today, Checked In, No-Shows, Pending. Loading: skeleton table. Empty: "No bookings today" with illustration. Error: retry button.

## Acceptance criteria

- [ ] Today's bookings table with all columns
- [ ] Check-in button works with confirmation
- [ ] No-show button works with confirmation
- [ ] Search by name/phone
- [ ] Stats bar showing counts
- [ ] Loading skeleton, empty state, error state
