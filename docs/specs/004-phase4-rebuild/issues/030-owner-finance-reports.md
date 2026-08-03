# 030 — Owner Finance Reports

**Type:** AFK | **Blocked by:** 009

## What to build

Build the finance page at `/grounds/:id/finance`. **KPI Row**: Today's Revenue, This Month Revenue, This Month Bookings, Pending Payments Total, Average Booking Value, Refunds This Month. **Revenue Charts**: Daily bar chart (7d/30d/custom range), By Payment Method pie chart (Cash/JazzCash/Easypaisa/Bank Transfer), By Sport Type bar chart. **Revenue Table**: Date, Bookings, Cash Revenue, Online Revenue, Total Revenue, Refunds, Net columns, sortable by date. **Cash Session Reports** table: Date, Staff, Opening, Expected, Closing, Variance, Status (OK/Flagged). **Payment Log** table: Date, Booking ID, Amount, Method, Reference, Recorded By, Timestamp. **Commission Report**: Platform commission deducted, net payout to owner. **Expense Tracking** (optional section): Add expense form (category, amount, date, notes, receipt upload), monthly expense vs revenue summary. Date range filter on all sections. Export CSV on all tables.

## Acceptance criteria

- [ ] KPI cards with correct financial data
- [ ] Revenue charts (bar, pie, bar) with Recharts
- [ ] Revenue table with sorting and date filter
- [ ] Cash session reports with variance display
- [ ] Payment log table
- [ ] Commission report section
- [ ] Date range filter affects all sections
- [ ] CSV export on tables
- [ ] Loading, error, empty states
