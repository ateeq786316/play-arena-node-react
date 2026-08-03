# 021 — Plan Enforcement on Ground Creation

**Type:** AFK | **Blocked by:** 018

## What to build

Add plan enforcement logic to `GroundService.createGround()`. Before creating a ground, check the owner's active subscription plan. Get the owner's plan from `GroundOwnerSubscription` (latest active record). Compare `plan.maxGrounds` against the count of existing non-deleted grounds owned by this user. If current count >= max allowed, throw 403 `"Plan limit reached. Upgrade to add more grounds."`. For users with no subscription (shouldn't happen for owners, but handle gracefully), fall back to Free plan. Update the `limitByPlan()` middleware in `plan.middleware.js` to also check court limits when creating courts. Write tests: verify ground creation fails when limit exceeded, succeeds when within limit, returns correct error message.

## Acceptance criteria

- [ ] Ground creation checks active plan's maxGrounds limit
- [ ] 403 returned with upgrade message when limit exceeded
- [ ] Court creation checks plan's maxCourtsPerGround limit
- [ ] Users without subscription fall back to Free plan limits
- [ ] Trial users within trial period can create grounds up to Starter limits
- [ ] Tests pass for limit enforcement scenarios
