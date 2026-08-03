# 080 — Subscription & Trial Cron

**Type:** AFK | **Blocked by:** 007

## What to build

Create `src/cron/subscriptionLifecycle.js`. Three jobs:

1. **Trial expiry**: Daily at 00:00, find owners whose trial period has ended (registered > trial_duration_days ago, no active subscription). Send notification "Your free trial has ended. Subscribe to continue operating your grounds." Lock ground operations (new bookings disabled, existing honored).

2. **Subscription expiry reminders**: Daily at 08:00, find subscriptions expiring in 7 days, 3 days, and 1 day. Send in-app + email reminders with "Your plan renews in X days." For 1-day: add urgency.

3. **Subscription suspension**: Daily at 00:00, find subscriptions with `status: "past_due"` for more than 7 days (or 14 days from expiry). Suspend them (set `status: "suspended"`). Lock ground operations. Notify owner.

Register all three in `src/cron/index.js`. Write tests for each job.

## Acceptance criteria

- [ ] Trial expiry runs daily, freezes grounds of expired trial owners
- [ ] Subscription reminders at 7d/3d/1d
- [ ] Subscription suspension after past_due threshold
- [ ] Ground operations lock when suspended/expired
- [ ] Tests pass
