# 065 — Cash Session Enhancement Backend

**Type:** AFK | **Blocked by:** 007

## What to build

Enhance the existing CashSession backend. Add auto-variance calculation on session close: `variance = closingCash - expectedCash` (expectedCash is computed from opening + all cash payments logged during session). Add a threshold check: if `abs(variance) > threshold` (default: PKR 500 or 2% of expectedCash), set `status: "flagged"` and trigger a notification to the ground owner. Add a `PATCH /api/cash-sessions/:id/flag` for manual flagging. Add `GET /api/grounds/:id/cash-sessions` with filters (date range, staff, status). Add `GET /api/grounds/:id/cash-sessions/summary` for aggregated report. Write tests for variance calculation, threshold logic, and flagging.

## Acceptance criteria

- [ ] Variance auto-calculated on session close
- [ ] Threshold check flags large variances (>500 PKR or >2%)
- [ ] Flagged sessions trigger owner notification
- [ ] Cash sessions list endpoint with filters
- [ ] Cash sessions summary aggregation endpoint
- [ ] Tests pass for variance math, threshold, flagging
