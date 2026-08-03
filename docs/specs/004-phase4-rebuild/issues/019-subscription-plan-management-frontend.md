# 019 — Subscription Plan Management Frontend

**Type:** AFK | **Blocked by:** 018

## What to build

Build the Super Admin plan management page at `/admin/subscriptions/plans`. Shows a DataTable of all plans: Name, Price, Interval, Max Grounds, Commission, Features (truncated), Active toggle, Sort Order, Actions columns. Each row has [Edit] and [Deactivate/Activate] buttons. [Create Plan] button opens a Modal form with all plan fields. [Edit] opens the same modal pre-filled. Form validation: price must be positive, maxGrounds must be integer >= 1 (or -1 for unlimited), commissionRate 0-100. Deactivate shows ConfirmDialog. Empty state: "No plans created yet" + Create CTA. Error and loading states handled.

## Acceptance criteria

- [ ] Plan list table with all fields
- [ ] Create plan modal with validation
- [ ] Edit plan modal pre-filled
- [ ] Activate/deactivate with confirmation
- [ ] Form validation for all fields
- [ ] Empty state, loading skeleton, error state with retry
