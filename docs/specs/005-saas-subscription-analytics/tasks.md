# Tasks: SaaS Subscription Analytics Dashboard

**Feature**: `005-saas-subscription-analytics`
**Input**: Design documents from `/docs/specs/005-saas-subscription-analytics/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included. Backend tests extend the existing Vitest + mocked-Prisma suites (constitution-mandated). Frontend component tests are new (vitest + React Testing Library) — one task per rebuilt/new page asserting all 4 states.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Dependency Graph

```text
Phase 1 (Setup)
  T001-T003  deps + frontend test infra
Phase 2 (Foundational)
  T004 → T005 → T006        (schema → migration → seed)
  T007, T008, T009, T010, T011
Phase 3 (US1)  T012-T019
Phase 4 (US2)  T020-T029      ── depends on T004 (retentionDays), T021 (aggregation producer)
Phase 5 (US3)  T030-T034      ── depends on Phase 4 (dashboard/heatmap plumbing)
Phase 6 (US4)  T035-T045      ── depends on T007 (plan.middleware) for route wiring
Phase 7 (US5)  T046-T051      ── depends on T005 (status enum) + Phase 3/4 services
Phase 8 (Polish) T052-T056
```

**Story completion order**: US1 (P1) → US2 (P1) → US3 (P2) → US4 (P2) → US5 (P3). US1 and US2 can be built in parallel once Phase 2 completes. US3 depends on US2 (shares analytics data plumbing). US4 is independent of US1/US2 backend-wise but its UI touches `/subscriptions` pages rebuilt in US1.

---

## Phase 1: Setup

- [x] T001 [P] Add `node-cron` dependency to `playarena-backend/package.json` (`npm i node-cron` in `playarena-backend/`)
- [x] T002 [P] Add `recharts` dependency to `playarena-frontend/packages/web/package.json` (`npm i recharts` in `playarena-frontend/packages/web/`)
- [x] T003 Add frontend test infrastructure (dev deps `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@vitejs/plugin-react`; `test` script; vitest config with jsdom environment + `jest-dom` setup) in `playarena-frontend/packages/web/`

## Phase 2: Foundational (blocks all user stories)

- [x] T004 Modify `playarena-backend/prisma/schema.prisma`: add `pending_payment` and `trial` to `SubscriptionStatus` enum; add `analyticsRetentionDays Int @default(7)` to `SubscriptionPlan`; add `PlatformSetting` model (`key String @id`, `value String`, `updatedAt DateTime @updatedAt`, `@@map("platform_settings")`)
- [x] T005 Generate migration with `npx prisma migrate dev --create-only --name add_subscription_analytics_fields` in `playarena-backend/`, then manually split the `ALTER TYPE ... ADD VALUE` statements into the correct transaction position in `playarena-backend/prisma/migrations/<ts>_add_subscription_analytics_fields/migration.sql` and apply with `npx prisma migrate dev`
- [x] T006 Create idempotent seed script `playarena-backend/prisma/seed.js` (upsert 3 plans Free/Starter/Professional with `analyticsRetentionDays` 7/30/365 and limits; upsert `platform_settings` keys `trial_enabled=true`, `trial_duration_days=14`, `variance_threshold=500`, `retention_grace_days=0`) and add `"prisma": { "seed": "node prisma/seed.js" }` + `prisma:seed` script to `playarena-backend/package.json`
- [x] T007 Fix broken import in `playarena-backend/src/middlewares/plan.middleware.js` (`../config/prisma.js` → `../database/db.js` default export; remove `req.prisma` fallback) so `requirePlan(...)` and `limitByPlan(...)` use the real Prisma client
- [x] T008 Create RFC 4180 CSV serializer `playarena-backend/src/utils/csv.js` (accepts headers + row array, quotes fields containing `,` `"` `\n`, escapes double quotes, returns string)
- [x] T009 [P] Add shared types to `playarena-frontend/packages/shared/src/types/index.ts`: extend `SubscriptionStatus` with `"pending_payment" | "trial"`; add `analyticsRetentionDays: number` to `SubscriptionPlan`; add `DailyAggregation`, `PlatformSetting`, `PlatformSummary`, `PlanUsage` interfaces per `contracts/analytics.contracts.md` + `contracts/subscriptions.contracts.md`
- [x] T010 [P] Extend `getStatusColor` in `playarena-frontend/packages/shared/src/utils/index.ts` with mappings for `pending_payment`, `trial`, `expired`, `past_due`, `suspended`, `cancelled`
- [x] T011 [P] Create UI primitives `Button`, `Card`, `Badge`, `StatCard`, `DataTable`, `Skeleton` in `playarena-frontend/packages/web/src/components/ui/` (Tailwind v4, consistent with existing dashboard styling)

## Phase 3: User Story 1 — View Subscription Status & Plan Usage (P1)

**Goal**: Ground owner sees current plan, usage vs limits, renewal/expiry/trial dates with warnings.

**Independent Test**: Create a ground owner on the Free plan, add one ground, verify dashboard shows Free plan, 1/1 grounds usage, and trial/renewal date.

### Implementation

- [x] T012 [US1] Add usage-count queries to `playarena-backend/src/repository/subscription.repo.js` (`countApprovedGrounds(ownerId)`, `countCourts(groundIds)`, `countStaff(groundIds)`) filtered on `ground.isVerified == true` for grounds
- [x] T013 [US1] Update `mySubscription` in `playarena-backend/src/modules/subscription/subscription.service.js` to return `usage` (grounds/courts/staff counts vs plan limits) and trial/expiry metadata from `currentPeriodEnd` + `PlatformSetting.trial_duration_days`
- [x] T014 [US1] Update `playarena-backend/src/modules/subscription/subscription.controller.js` `mySubscription` to pass through the enriched `{ subscription, plan, usage }` payload unchanged
- [x] T015 [US1] Create `UsageBar` component (progress indicator with 100% warning + upgrade CTA) in `playarena-frontend/packages/web/src/components/domain/UsageBar.tsx`
- [x] T016 [US1] Rebuild `playarena-frontend/packages/web/src/app/(dashboard)/subscriptions/page.tsx` to the 4-states standard (loading skeleton / empty / error / success): plan name, price, renewal date, usage bars, 7/3/1-day expiry reminder, 3-day trial countdown, upgrade CTA at 100% usage
- [x] T017 [US1] Rebuild `playarena-frontend/packages/web/src/app/(dashboard)/subscriptions/my/page.tsx` to the 4-states standard: current plan, usage vs limits, renewal/trial countdown
- [x] T018 [US1] Extend `playarena-backend/tests/subscription.test.js` with mocked-Prisma tests: `mySubscription` returns usage counts + trial status derived from `PlatformSetting`, Free-plan fallback when no subscription
- [x] T019 [US1] Add frontend component tests for `subscriptions/page.tsx` and `subscriptions/my/page.tsx` asserting loading/empty/error/success states in `playarena-frontend/packages/web/src/app/(dashboard)/subscriptions/__tests__/`

## Phase 4: User Story 2 — View Business Analytics (P1)

**Goal**: Ground owner sees revenue, bookings, utilization, customer metrics for the retention-accessible default period.

**Independent Test**: Generate booking data for a ground, open analytics, confirm revenue/booking/utilization/customer metrics match the generated data.

### Implementation

- [x] T020 [US2] Add `aggregateDay(date)` to `playarena-backend/src/modules/analytics/analytics.service.js`: per approved (`isVerified`) ground, read raw `Booking` (completed/approved/cancelled/expired) + `Payment` data grouped by court+hour, upsert `AnalyticsSnapshot` + `DailyAggregation` via `analytics.repo.js` (idempotent on existing unique keys)
- [x] T021 [US2] Create `playarena-backend/src/jobs/analytics-aggregation.job.js` (node-cron expression for 00:30 Asia/Karachi calling `analyticsService.aggregateDay()` with per-ground try/catch + pino logging) and start it from `playarena-backend/server.js`
- [x] T022 [US2] Add retention enforcement to `getDashboard`/`getHeatmap`/`generateReport` in `playarena-backend/src/modules/analytics/analytics.service.js`: fetch owner's subscription plan `analyticsRetentionDays` (fallback 7), clamp `startDate = max(requested, today - (retentionDays - 1))`, return `dataAsOf` (last aggregated snapshot date) + `retentionDays` + `retentionNotice` when clamped
- [x] T023 [US2] Add retention-aware + `dataAsOf` repo reads to `playarena-backend/src/repository/analytics.repo.js` (`findLatestSnapshotDate(groundId)`, approved-ground guard on all reads)
- [x] T024 [US2] Update `playarena-backend/src/modules/analytics/analytics.controller.js` + `analytics.route.js` to pass `dataAsOf`/`retentionDays`/`retentionNotice` through in dashboard + heatmap responses
- [x] T025 [US2] Create `RevenueChart` + `BookingTrendsChart` (recharts line/bar/composed) in `playarena-frontend/packages/web/src/components/domain/charts/`
- [x] T026 [US2] Create `UtilizationHeatmap` (custom CSS grid, court × day) in `playarena-frontend/packages/web/src/components/domain/UtilizationHeatmap.tsx`
- [x] T027 [US2] Rebuild `playarena-frontend/packages/web/src/app/(dashboard)/analytics/page.tsx` to the 4-states standard: KPI cards, RevenueChart, BookingTrendsChart, UtilizationHeatmap, "data as of" timestamp, default period (7/30/365 days) driven by plan retention
- [x] T028 [US2] Extend `playarena-backend/tests/analytics.test.js`: `aggregateDay` builds snapshot + daily-agg (mocked Prisma), retention clamp filters out-of-window dates, `dataAsOf` present, approved-ground filter excludes pending/rejected grounds
- [x] T029 [US2] Add frontend component tests for `analytics/page.tsx` asserting loading/empty/error/success states in `playarena-frontend/packages/web/src/app/(dashboard)/analytics/__tests__/`

## Phase 5: User Story 3 — Filter Analytics by Date Range & Export Reports (P2)

**Goal**: Owner selects a custom date range, all visuals update, and downloads a CSV report for the accessible period.

**Independent Test**: Select a custom range and confirm all charts update; download CSV and verify rows match on-screen data.

### Implementation

- [x] T030 [US3] Add CSV export to `generateReport` in `playarena-backend/src/modules/analytics/analytics.controller.js`: when `export=csv` query present, set `Content-Type: text/csv; charset=utf-8` + `Content-Disposition: attachment; filename="report_<groundId>_<range>.csv"` using `src/utils/csv.js` (RFC 4180 columns: date, revenue, online, offline, bookings, completed, cancelled, utilization, new, returning, avgValue); else JSON (backward compatible)
- [x] T031 [US3] Create `RetentionNotice` component (informational notice + upgrade prompt, no error) in `playarena-frontend/packages/web/src/components/domain/RetentionNotice.tsx`
- [x] T032 [US3] Wire date-range filter + CSV download button + `RetentionNotice` into `playarena-frontend/packages/web/src/app/(dashboard)/analytics/page.tsx` (all visuals driven by selected range; notice shown when range exceeds retention window)
- [x] T033 [US3] Add unit tests `playarena-backend/tests/csv.test.js` for `src/utils/csv.js` (quoting fields with comma/quote/newline, header row)
- [x] T034 [US3] Add export contract test to `playarena-backend/tests/analytics.test.js` (CSV content-type header, row count matches snapshots, retention clamp respected in export)

## Phase 6: User Story 4 — Compare Plans & Upgrade from Dashboard (P2)

**Goal**: Owner compares plans and upgrades/downgrades from the dashboard; upgrade goes through `pending_payment` → admin confirmation.

**Independent Test**: View plan comparison, select a higher plan, confirm; verify subscription becomes `pending_payment` with unpaid invoice, then activates after admin confirms and retention extends.

### Implementation

- [x] T035 [US4] Rework `upgrade()` in `playarena-backend/src/modules/subscription/subscription.service.js`: reject if target plan `sortOrder` lower than current (403 for downgrade-via-upgrade); reject if usage exceeds target plan limits (`Plan limit reached: <field>`, FR-017); else set `status: "pending_payment"` (period unchanged) and create `Invoice` with `status: "unpaid"` + `dueDate`
- [x] T036 [US4] Add `downgrade()` to `playarena-backend/src/modules/subscription/subscription.service.js`: target `sortOrder` must be lower; takes effect immediately (no payment); frontend shows retention warning before calling
- [x] T037 [US4] Fix `cancel()` in `playarena-backend/src/modules/subscription/subscription.service.js`: set `status: "cancelled"` + `cancelledAt` but keep plan active until `currentPeriodEnd` (remove immediate `currentPeriodEnd: new Date()`)
- [x] T038 [US4] Add `confirmPayment(subscriptionId, adminId)` + `listExpiring(days)` to `playarena-backend/src/modules/subscription/subscription.service.js` (pending_payment → active, period = now → now + interval, mark matching unpaid invoice `paid` + `paidAt`)
- [x] T039 [US4] Add admin routes to `playarena-backend/src/modules/subscription/subscription.route.js` + `subscription.controller.js`: `POST /api/admin/subscriptions/:id/confirm-payment` and `GET /api/admin/subscriptions/expiring?days=7`
- [x] T040 [US4] Add repo methods to `playarena-backend/src/repository/subscription.repo.js`: `findPendingPaymentById`, `findUnpaidInvoiceBySubscription`, `markInvoicePaid`, `findSubscriptionsExpiringWithin(days)` (include owner + plan)
- [x] T041 [US4] Add express-validator validation to upgrade/downgrade/confirm-payment routes (planId UUID + exists + isActive) in `playarena-backend/src/modules/subscription/subscription.route.js`
- [x] T042 [US4] Wire `requirePlan`/`limitByPlan` from `playarena-backend/src/middlewares/plan.middleware.js` into subscription routes (upgrade/cancel require active subscription context) and analytics dashboard route (requires `analytics: true` feature)
- [x] T043 [US4] Create `PlanComparisonTable` (price, limits, analytics retention, feature differences side by side) in `playarena-frontend/packages/web/src/components/domain/PlanComparisonTable.tsx`
- [x] T044 [US4] Wire upgrade/downgrade flow into `playarena-frontend/packages/web/src/app/(dashboard)/subscriptions/page.tsx` + `subscriptions/my/page.tsx`: compare table, upgrade → pending_payment confirmation state, downgrade → retention warning dialog before confirm
- [x] T045 [US4] Extend `playarena-backend/tests/subscription.test.js` with mocked-Prisma tests: upgrade creates pending_payment + unpaid invoice, limit-block rejects upgrade, downgrade applies immediately, cancel keeps plan until period end, confirmPayment transitions + marks invoice paid, expiring list returns within-N-days subs

## Phase 7: User Story 5 — Platform Subscription Analytics (P3)

**Goal**: Admin/Super Admin sees platform-wide subscription health (subscribers per plan, MRR, status distribution, expiring list, trends).

**Independent Test**: Have multiple owners on different plans/statuses; open platform analytics and confirm subscriber counts, revenue, status distribution match DB state.

### Implementation

- [x] T046 [US5] Create `requireAdmin` middleware `playarena-backend/src/middlewares/requireAdmin.middleware.js` (JWT + role in `admin`, `super_admin`; read-only view for both — FR-022)
- [x] T047 [US5] Add platform aggregate queries to `playarena-backend/src/repository/analytics.repo.js` (subscribers per plan + status breakdown, MRR = sum of active monthly plan prices, status distribution, expiring-within-N-days, new-subscription/cancellation trends over period)
- [x] T048 [US5] Add `getPlatformSummary()`, `getPlatformExpiring(days)`, `getPlatformTrends(startDate, endDate)` to `playarena-backend/src/modules/analytics/analytics.service.js`
- [x] T049 [US5] Add platform endpoints to `playarena-backend/src/modules/analytics/analytics.route.js` + `analytics.controller.js`: `GET /platform/summary`, `GET /platform/expiring`, `GET /platform/trends` — all behind `authMiddleware` + `requireAdmin` (route order: register `/platform/*` BEFORE `/:groundId/*`)
- [x] T050 [US5] Create `playarena-frontend/packages/web/src/app/(dashboard)/admin/analytics/page.tsx` (4-states standard): subscribers per plan, MRR, status distribution, expiring-within-7-days list, trends chart
- [x] T051 [US5] Create `playarena-backend/tests/platform-analytics.test.js` with mocked-Prisma tests: summary counts/breakdown, MRR computation, expiring list, trends aggregation, non-admin role rejected (403)

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T052 Run end-to-end manual flow per `docs/specs/005-saas-subscription-analytics/quickstart.md`: signup → trial → create ground (1/1 usage) → upgrade → `pending_payment` → admin confirm → `active` → bookings → analytics render with `dataAsOf` → retention clamp → `/admin/analytics`
- [x] T053 Verify aggregation job accuracy: trigger `analytics.service.aggregateDay(today - 1)` and confirm `AnalyticsSnapshot`/`DailyAggregation` values match raw bookings per approved ground
- [x] T054 Verify retention soft-enforcement (SC-007): downgrade a Professional owner and confirm dates beyond 30-day window are excluded from API responses and CSV, then upgrade back and confirm restoration (no data loss)
- [x] T055 Run full backend test suite (`npx vitest run` in `playarena-backend/`) and fix failures
- [x] T056 Run frontend lint + production build (`npm run lint` + `npm run build` in `playarena-frontend/packages/web/`), fix any errors

---

## Parallel Execution Examples

| Window | Tasks | Why parallel |
|--------|-------|--------------|
| Phase 1 | T001, T002 | Different package.json files (backend vs frontend) |
| Phase 2 | T009, T010, T011 | Different frontend files (types, utils, components/ui) |
| Phase 3 | T012-T014 (backend service) ∥ T015, T016, T017 (frontend) | Backend vs frontend layers; join at T018/T019 tests |
| Phase 4 | T020, T021 (aggregation) ∥ T022, T023 (retention) ∥ T025, T026 (components) | Independent files after T004 (retentionDays field) |
| Phase 6 | T035-T040 (backend lifecycle) ∥ T043 (comparison table) | Backend service vs standalone component |

## Implementation Strategy

**MVP (US1 only)**: Ship Phase 1 + Phase 2 + Phase 3 — owner sees plan status, usage bars, renewal/trial countdown, and upgrade CTA. This delivers subscription clarity immediately and is independently testable per US1's Independent Test.

**Incremental delivery**: After US1, deliver US2 (core analytics value — the monetization hook), then US3 (filter/export), US4 (conversion), then US5 (platform visibility). Each story is a complete, independently testable increment; US1/US2 can be built in parallel by two agents after Phase 2.

## Independent Test Criteria

- **US1**: Owner on Free plan with 1 ground sees Free plan, 1/1 grounds usage, and trial/renewal date. — Frontend 4-states + `subscription.test.js`
- **US2**: Booking data → analytics metrics match generated data; `dataAsOf` shows last aggregated day. — `analytics.test.js`
- **US3**: Custom range updates visuals; CSV rows match on-screen data; >7-day range on Free shows retention notice. — `csv.test.js` + export contract test
- **US4**: Upgrade → pending_payment + unpaid invoice; admin confirm → active; downgrade warns; over-limit blocks. — `subscription.test.js`
- **US5**: Platform counts/revenue/status match DB state; non-admin gets 403. — `platform-analytics.test.js`
