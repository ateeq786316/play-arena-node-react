# 079 — Booking Lifecycle Cron

**Type:** AFK | **Blocked by:** 007

## What to build

Create `src/cron/bookingLifecycle.js`. Three jobs:

1. **Auto-cancel unpaid bookings**: Every 5 minutes, find bookings with `status: "pending_payment"` and `createdAt > ground.setting.autoCancelUnpaidAfter` (default 30 minutes). Cancel them. Send notification to player.

2. **Auto-complete past bookings**: Every 30 minutes, find bookings with `status: "approved"` or `status: "checked_in"` and `endTime < now()`. Move them to `status: "completed"`.

3. **No-show detection**: Every 10 minutes, find bookings with `status: "approved"` and `startTime < (now() - ground.setting.noShowAfterMinutes)` (default 15 min). Mark as `status: "no_show"`. Send notification to player and staff.

Register all three in `src/cron/index.js`. Each job logs start/completion/errors. Write unit tests for each job logic.

## Acceptance criteria

- [ ] Auto-cancel unpaid bookings runs every 5 min
- [ ] Auto-complete past bookings runs every 30 min
- [ ] No-show detection runs every 10 min
- [ ] Notifications sent for each action
- [ ] Configurable timeouts per ground setting
- [ ] Errors logged without crashing the server
- [ ] Tests pass for each cron job
