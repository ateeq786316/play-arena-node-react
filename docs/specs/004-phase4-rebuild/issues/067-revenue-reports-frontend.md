# 067 — Revenue Reports Frontend

**Type:** AFK | **Blocked by:** 066

## What to build

Build the frontend for revenue reports (owner and admin views). Uses the endpoints from issue 066. Owner view at `/grounds/:id/finance` (already defined in issue 030). Admin view at `/admin/finance` (issue 056). Both use same chart components: daily bar chart (Recharts), by-method pie chart, by-sport bar chart. Date range picker with presets: 7d, 30d, 90d, 1y, Custom. Export CSV button. Loading skeletons, error with retry, empty "No data for this period".

## Acceptance criteria

- [ ] Revenue chart (bar) with date range
- [ ] By payment method pie chart
- [ ] By sport type bar chart
- [ ] Date range picker with presets
- [ ] CSV export
- [ ] Loading skeleton, error, empty states
