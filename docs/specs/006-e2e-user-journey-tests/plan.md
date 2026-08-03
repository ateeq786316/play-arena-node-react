# Plan: End-to-End User Journey Tests

**Feature Branch**: `006-e2e-user-journey-tests` | **Date**: 2026-07-31
**Input**: User request — "Reference docs/specs/ and docs/vision/backend/ to create a full End-to-End User Journey Test specification covering: 1. complete user story journeys from frontend UI interaction to backend API endpoints and DB persistence, 2. full validation of frontend-to-backend request/response cycles, 3. CRITICAL CONSTRAINT: do not delete/truncate/wipe seed data during or after test execution."

---

## 1. Goal

Deliver a journey-level E2E test suite that drives the real Next.js frontend against the real Express/Prisma/Postgres backend and proves every step persists correctly — while **guaranteeing the database is never wiped, truncated, or de-seeded** (see spec §2).

## 2. Approach

| Layer | Tool | Responsibility |
|---|---|---|
| Browser | Playwright (Chromium) | Drive UI steps, assert DOM + redirects, capture network calls |
| API | Node cookie-jar client (fetch/curl) | Validate request/response cycles, auth cookies, auto-refresh |
| Realtime | socket.io-client | Chat/notification events (J10) |
| DB | psql/prisma client (SELECT only) | Persistence + preservation assertions |

## 3. Milestones

| Milestone | Scope | Done when |
|---|---|---|
| M1 | Phase 0 harness + preservation guardrails | Preservation-check util returns baseline; bootstrap creates 6 accounts idempotently |
| M2 | J1–J4 core journeys | Auth→ground→booking→subscriptions pass with DB assertions |
| M3 | J5–J11 feature journeys | All 7 feature journeys pass |
| M4 | Phase 3 cross-cutting + CI + audit | Full §6.4 RBAC matrix, idempotency re-run, final preservation audit green |

## 4. Execution Order

Run 1: baseline + J1; Run 2: J2 (creates shared E2E ground); Run 3: J3 + J5; Run 4: J4; Run 5: J6 + J9; Run 6: J7 + J8; Run 7: J10 + J11; then M4 cross-cutting.

## 5. Constraints

- **Data preservation is the highest-priority requirement** (spec §2). No DELETE/TRUNCATE/reset anywhere.
- Fixed test identities (§5 of spec) make runs idempotent; re-runs reuse accounts.
- Respect 500 req/15min/IP rate limit.
- Only app-native soft transitions may "close out" test state (cancel, withdraw, dismiss, suspend-toggle-revert).
- The single permitted direct-DB mutation is a role update scoped to test emails (no API promotes roles).

## 6. Risks

| Risk | Mitigation |
|---|---|
| Backend code changes break contracts mid-run | Backend uses `tsx server.js` (no watch) — restart before runs; spec §6.2 is the contract source of truth |
| `/verify-otp` depends on unset `localStorage.pendingEmail` | Bootstrap sets it explicitly; assert graceful failure when absent |
| Role-gating inconsistencies (disputes, admin) | Spec documents current behavior as assertions; security debt flagged to fix later |
| Response-shape drift | Contract-helper layer (T004) centralizes shape assertions |
| Accidental data loss | Preservation-check at start AND end of every journey (§2.5) |
