# Tasks: End-to-End User Journey Tests

**Feature Branch**: `006-e2e-user-journey-tests`
**Prerequisites**: spec.md, plan.md

---

## Phase 0: Harness & Preservation Guardrails

- [ ] T001 Create E2E test workspace (`tests/e2e/`) with Playwright + cookie-jar HTTP client + `socket.io-client`
- [ ] T002 Implement preservation-check utility (seed-table row-count baseline: 3 plans, 4 settings; snapshot pre-run ground/booking counts)
- [ ] T003 Implement test-identity bootstrap (register 6 fixed accounts per §5, role-promote admin/super_admin/staff via scoped psql, set `pendingEmail` localStorage)
- [ ] T004 Build response-contract assertion helpers per §6.2 (bare-array vs wrapped vs direct-object handling)
- [ ] T005 Build DB persistence assertion helper (read-only `SELECT` queries only; assert row + column values)

---

## Phase 1: Core Journeys (dependency order)

- [ ] T101 J1 — Auth & onboarding (signup→OTP→login→profile→logout; validation; password reset)
- [ ] T102 J2 — Ground ownership & management (create→courts→schedules→settings→staff invite→admin verify→RBAC 403s)
- [ ] T103 J3 — Booking & payment (preview→coupon→slots→create→double-book 409→payment idempotency→approve→cancel→walk-in)
- [ ] T104 J4 — Subscriptions & SaaS analytics (upgrade→pending_payment→admin confirm→dashboard/heatmap/CSV→downgrade retention→cancel→platform analytics→403s)

---

## Phase 2: Feature Journeys

- [ ] T201 J5 — Dynamic pricing & coupons (rules CRUD→preview multiplier→coupon create/validate→list→delete)
- [ ] T202 J6 — Disputes & resolution (file→duplicate 409→list→admin queue filter→resolve→no-show penalty→document the no-gate gap)
- [ ] T203 J7 — Teams, matches, ELO & leaderboard (create teams→join request→accept→challenge→match→scores→ELO→rating→stats)
- [ ] T204 J8 — Tournaments (create→register→duplicate 409→bracket gen→bare-array assert→result→standings)
- [ ] T205 J9 — Finance & cash sessions (payment methods→open/close session→variance→finance summary→reports→RBAC 403→method toggle revert)
- [ ] T206 J10 — Chat & notifications (socket connect/join→messages→newMessage→mark read→notifications CRUD→soft delete)
- [ ] T207 J11 — Geolocation & discovery (featured→nearby→map markers→radius filter→sport filter)

---

## Phase 3: Cross-Cutting & CI

- [ ] T301 Assert full §6.4 auth/RBAC matrix across all route groups (public vs auth vs admin vs super_admin vs requirePlan)
- [ ] T302 Assert §6.3 money/date conventions (Decimal PKR, UTC date params, HH:mm times)
- [ ] T303 Wire journeys into CI pipeline (backend vitest gate → lint/build gate → E2E on dedicated dev/staging DB)
- [ ] T304 Re-run full suite against a second backend instance to prove idempotency (re-runs reuse fixed identities, tolerate already-exists)
- [ ] T305 Final preservation audit — run after full suite; confirm seed tables + hand-created fixtures intact (§2.5)

---

## Execution Order

1. Phase 0 harness (blocks everything)
2. Phase 1 core journeys (auth → ground → booking → subscriptions)
3. Phase 2 feature journeys (pricing → disputes → teams → tournaments → finance → chat → geo)
4. Phase 3 cross-cutting + CI + preservation audit
