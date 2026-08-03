# 045 — Profile & Settings

**Type:** AFK | **Blocked by:** 009

## What to build

Build user profile at `/profile`. **Profile Card**: avatar (upload/change), name, email, role badge, member since date. **Edit Profile** form: name, phone, email (read-only), save button with toast. **Change Password** form: current password, new password, confirm, validation, save.

**My Stats** section: matches played, wins, losses, draws, win rate, ELO rating (per sport if available), goals scored/conceded, total bookings, total spent, grounds visited count. Each stat as a small card with icon.

**Settings**: notification preferences (in-app only / email too toggle per notification category), language selector (English/Urdu/Arabic — triggers full page reload on change), quiet hours (start/end time).

**Delete Account** section: red card with warning, [Delete My Account] button → ConfirmDialog → type "DELETE" to confirm → soft delete (anonymize data, cancel active bookings). Success message with logout.

## Acceptance criteria

- [ ] Profile card with avatar upload
- [ ] Edit profile form with save
- [ ] Change password form with validation
- [ ] Stats section with all metrics
- [ ] Notification preferences toggle
- [ ] Language selector (triggers locale change)
- [ ] Delete account flow with confirmation
- [ ] Loading, error states
