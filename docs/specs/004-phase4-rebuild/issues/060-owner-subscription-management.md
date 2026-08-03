# 060 — Owner Subscription Management

**Type:** AFK | **Blocked by:** 018

## What to build

Build **Owner Subscription Management** at `/admin/subscriptions`. **DataTable**: Owner Name, Email, Plan Name, Status badge, Current Period End, Grounds Used/Allowed, Actions. **Filter**: by plan, status. **Search**: by owner name/email. **Row Actions**: [View], [Change Plan] (opens plan selector), [Extend Period] (modal: add days), [Cancel Subscription] (ConfirmDialog), [Force Activate] (for troubleshooting), [Mark Past Due].

**Detail Page** (or drawer): owner info, current plan card, subscription timeline (created, renewed, suspended events), invoice history, usage vs limits chart. **Manual Invoice** button: create invoice for manual payment tracking.

## Acceptance criteria

- [ ] Subscriptions table with plan and status filters
- [ ] Search by owner name/email
- [ ] Change plan, extend, cancel, force activate actions
- [ ] Detail view with timeline and usage
- [ ] Manual invoice creation
- [ ] Loading, error, empty states
