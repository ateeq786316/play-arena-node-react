# 022 — Owner Subscription Page

**Type:** AFK | **Blocked by:** 018, 019

## What to build

Build the owner's subscription page at `/subscriptions`. Shows a **Current Plan Card**: plan name, price (PKR/mo or PKR/yr), status (Active/Past Due/Suspended/Cancelled/Expired with appropriate badge color), billing period dates, days remaining countdown. **Usage bars**: grounds used vs allowed (progress bar), courts per ground vs allowed, staff accounts used vs allowed, analytics retention level. **Plan Comparison Table**: side-by-side comparison of Free/Starter/Professional with features listed in rows, checkmarks/X marks, and [Upgrade] buttons per plan. **Invoice History** table: invoice number, period, amount, status, paid date, download link (if available). [Cancel Subscription] button with ConfirmDialog. Error state, loading skeleton, empty state for no invoices.

## Acceptance criteria

- [ ] Current plan card with all fields and status badge
- [ ] Usage bars show correct counts with progress visualization
- [ ] Plan comparison table shows all features per tier
- [ ] Upgrade button links to plan change flow
- [ ] Invoice history table (empty state if none)
- [ ] Cancel subscription with confirmation
- [ ] Loading, error, empty states handled
