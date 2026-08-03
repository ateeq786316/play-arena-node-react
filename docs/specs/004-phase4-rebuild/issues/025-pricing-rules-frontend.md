# 025 — Pricing Rules Engine Frontend

**Type:** AFK | **Blocked by:** 010

## What to build

Build the pricing rules page at `/grounds/:id/pricing`. Three sections using Tabs: **Dynamic Rules**, **Holiday Pricing**, **Coupons**.

**Dynamic Rules DataTable**: Priority (number, lower = higher priority), Rule Name, Day of Week (All/Weekdays/Weekends/Specific), Start Time, End Time, Multiplier (e.g., 1.5x), Active toggle, Actions [Edit] [Delete]. Create/Edit Rule Modal with validation (multiplier > 0).

**Holiday Pricing DataTable**: Name, Date (date picker), Multiplier, Active toggle, Actions.

**Coupons DataTable**: Code, Discount Type (Percentage/Flat), Value, Max Uses, Used Count, Min Booking Amount, Expiry Date, Active toggle, Actions. Create Coupon Modal: auto-generate code or manual input, discount type selector, all fields. Price Preview Calculator: Select Court + Date + Time → shows calculated price with rule breakdown.

## Acceptance criteria

- [ ] Dynamic rules table with priority-based ordering
- [ ] Create/edit rule modal with validation
- [ ] Holiday pricing table with date picker
- [ ] Coupons table with CRUD
- [ ] Price preview calculator works with sample data
- [ ] Loading, error, empty states for each tab
