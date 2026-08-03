# 082 — Cleanup Cron

**Type:** AFK | **Blocked by:** 007

## What to build

Create `src/cron/cleanup.js`. Four jobs:

1. **OTP cleanup**: Hourly, delete OTP codes where `otpExpiry < now()`.

2. **Expired invites**: Daily, mark team invites and ground invites as `status: "expired"` where `expiresAt < now()`.

3. **Read notification cleanup**: Weekly (Sunday 03:00), delete notifications that are read and older than 90 days.

4. **Overnight cash sessions**: Daily at 00:00, find cash sessions that are still `status: "open"` but `openedAt < now() - 24h`. Auto-close them with `variance: 0` and notes "Auto-closed: session left open overnight." Flag them for owner review.

5. **Database backup**: Daily at 03:00, run `pg_dump` to a backup file, compress, upload to backup location (local disk or external). Keep last 7 daily + 4 weekly + 3 monthly.

Register all five in `src/cron/index.js`. Write tests for the logic (exclude backup — system command).

## Acceptance criteria

- [ ] OTP cleanup hourly, deletes expired OTPs
- [ ] Expired invites marked daily
- [ ] Read notifications >90d deleted weekly
- [ ] Overnight sessions auto-closed with flag
- [ ] Backup runs daily at 03:00
- [ ] Tests pass for logic-based jobs
