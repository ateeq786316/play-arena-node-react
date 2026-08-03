# 055 — Admin Broadcast

**Type:** AFK | **Blocked by:** 009

## What to build

Build **Admin Broadcast** at `/admin/broadcast`. **Send Broadcast** section: Audience selector (All Users / All Players / All Owners / All Active This Month), Title input, Message textarea (support basic formatting), Channel checkboxes (Notification / Email), Schedule for later toggle (date/time picker if enabled), Preview button (shows how notification will look). [Send] button with loading state.

**Broadcast History** table: Title, Audience, Channel, Status (Draft/Scheduled/Sending/Sent/Failed), Sent At, Delivered Count, Opened Count, Actions [View Details]. **Detail Drawer**: full message, delivery stats, log of sends (user, channel, status, delivered/opened timestamps).

## Acceptance criteria

- [ ] Broadcast form with audience, title, message, channel, schedule
- [ ] Preview mode
- [ ] Send with loading and progress
- [ ] Broadcast history table
- [ ] Detail drawer with delivery stats
- [ ] Loading, error, empty states
