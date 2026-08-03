# 064 — Data Export

**Type:** AFK | **Blocked by:** 009

## What to build

Build **Data Export** page at `/admin/export`. **Table Selector**: dropdown of all exportable tables (Users, Grounds, Bookings, Teams, Matches, Tournaments, Payments, Complaints, Audit Logs, Subscriptions). **Format Selector**: CSV / JSON. **Date Range Filter**: only for tables with timestamps. **Additional Filters**: per table (e.g., Users → by role, Bookings → by status). **[Export] button** with loading state → triggers server-side generation → downloads file. **Export History** table: Date, Table, Format, Filters, Status (Processing/Complete/Failed), Download link. **Scheduled Export** (optional): set recurring export (daily/weekly) to email.

## Acceptance criteria

- [ ] Table selector with all exportable tables
- [ ] Format and filter options
- [ ] Export with loading state and download
- [ ] Export history table
- [ ] Scheduled export option
- [ ] Loading, error, empty states
