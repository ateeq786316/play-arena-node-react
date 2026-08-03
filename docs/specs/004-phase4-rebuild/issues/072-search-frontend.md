# 072 — Search Frontend

**Type:** AFK | **Blocked by:** 071

## What to build

Build the search UI (connected to the full-text search backend). Already scoped in issue 033 (Public Ground Search). Connect the search bar, filters, sort, and results grid to the search endpoint. Debounce text search (300ms). Filters send query params. Results grid updates. Sort dropdown changes sort param. Pagination at bottom. Map view toggle (issue 034 connects here). Empty state: "No grounds found. Try adjusting filters."

## Acceptance criteria

- [ ] Search connects to full-text search endpoint
- [ ] Text search debounced (300ms)
- [ ] All filters send correct query params
- [ ] Results grid updates on filter change
- [ ] Sort dropdown works
- [ ] Pagination works
- [ ] Loading, error, empty states
