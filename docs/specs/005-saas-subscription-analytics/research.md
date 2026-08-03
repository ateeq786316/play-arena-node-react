# Research: SaaS Subscription Analytics Dashboard

**Phase 0 output** — resolves all technical unknowns for `docs/specs/005-saas-subscription-analytics/plan.md`.
**Branch**: `005-saas-subscription-analytics` | **Date**: 2026-07-31

---

## 1. Aggregation scheduling approach

- **Decision**: `node-cron` running a daily job from `server.js` that builds `AnalyticsSnapshot` + `DailyAggregation` rows per approved ground.
- **Rationale**: Constitution VIII mandates daily aggregation snapshots. `node-cron` is the standard minimal scheduler, survives restarts via persistent cron expressions, and is testable by extracting the aggregation logic into a service function (`analytics.service.js::aggregateDay(date)`) that the job calls.
- **Alternatives considered**:
  - `setInterval` in `server.js` — no persistence of schedule, drifts after restart, unobservable.
  - External cron (OS-level / GitHub Actions) — adds deployment coupling; Docker container already owns process lifecycle.
  - Manual only (no scheduler) — violates FR-010 and SC-002; tables would stay empty (current state).

### Failure/retry semantics
- **Decision**: Job runs at 00:30 Asia/Karachi (after midnight UTC+5). If a ground's aggregation fails, log via pino and continue with next ground (per-ground try/catch). No retry queue at v1 — re-run is manual or next-day natural catch-up because `upsertSnapshot`/`upsertDailyAgg` are idempotent on unique keys (`groundId_date`, `groundId_courtId_date_hour`).
- **Rationale**: Idempotent upserts make partial failures self-healing on the next run. A retry queue would be over-engineering for a daily batch.

### Snapshot computation source
- **Decision**: Aggregation reads raw `Booking` (status `completed`, `approved`, `cancelled`, `expired`) and `Payment` data for the previous day, per approved ground, grouped by court + hour for `DailyAggregation`.
- **Rationale**: `AnalyticsSnapshot` and `DailyAggregation` tables already exist with matching fields (`totalRevenue`, `onlineRevenue`, `offlineRevenue`, `totalBookings`, `completedBookings`, `cancelledBookings`, `utilizationRate`, `newCustomers`, `returningCustomers`, `avgBookingValue`; `hour`, `courtId`, `bookings`, `revenue`). The repo upserts already exist but are unused — this job is the missing producer.

---

## 2. Chart library (frontend)

- **Decision**: `recharts` (v2.x for React 19 compatibility).
- **Rationale**: Previously referenced in `003-saas-subs-analytics-crm/plan.md`; declarative React chart API matches the existing React 19 + TypeScript stack; supports line/bar/composed charts needed for revenue and booking trends (FR-006, FR-007). Responsive wrapper handles the mobile-first constitution requirement.
- **Alternatives considered**:
  - `chart.js` + `react-chartjs-2` — imperative API, heavier bundle.
  - Hand-rolled SVG — current state (div-based bars in `analytics/page.tsx`); not scalable to heatmaps + trends (SC-002 risk).
  - `tremor`/`shadcn-chart` — adds component framework coupling not present in the codebase.

### Heatmap
- **Decision**: `UtilizationHeatmap.tsx` is a custom CSS-grid component (court × time-of-week) fed by `/api/analytics/:groundId/heatmap` (already returns `DailyAggregation` rows). No chart lib needed for heatmap — grid + color scale is trivial and keeps bundle lean.
- **Rationale**: Heatmap data shape (`DailyAggregation`) is already served; a custom grid avoids recharts dependency for a non-chart layout.

---

## 3. CSV serialization

- **Decision**: Hand-rolled RFC 4180 serializer in `playarena-backend/src/utils/csv.js` (quote fields containing `,` `"` `\n`; escape double quotes).
- **Rationale**: Report export is a single flat shape (snapshots/revenue rows). A dependency (`csv-stringify`, `fast-csv`) is unnecessary; ~20 lines, fully unit-testable, zero new deps.
- **Alternatives considered**: `csv-stringify` — convenient but adds a dep for one endpoint; rejected for minimalism consistent with the no-bloat constitution ethos.
- **Wire-up**: `generateReport` currently returns JSON; change `analytics.controller.js` to set `Content-Type: text/csv; charset=utf-8` + `Content-Disposition` when an `?export=csv` query param is present, else return JSON (backward compatible).

---

## 4. Retention enforcement point

- **Decision**: **Soft enforcement in the service layer** — `analytics.service.js` computes `startDate = max(userSelectedStartDate, today - (plan.analyticsRetentionDays - 1))` before querying snapshots/daily-agg. Data beyond the window is never queried (not just hidden in UI), so no leakage across tiers (SC-007). Underlying rows are never deleted (Clarification Q3).
- **Rationale**: Filtering at query time is the single enforcement chokepoint — frontend can't bypass it, CSV export inherits it automatically. Matches FR-005/FR-013.
- **Alternatives considered**: UI-only disabling of date picker — bypassable via API; rejected. Physical purge — rejected by clarification (soft enforcement).
- **Retention source**: New `SubscriptionPlan.analyticsRetentionDays` field (7/30/365) seeded per plan; Free fallback 7 if null.

---

## 5. Platform analytics query patterns

- **Decision**: New aggregation queries in `analytics.repo.js` over `GroundOwnerSubscription` (grouped by plan, by status), `Invoice` (sum paid amount per period), and `SubscriptionPlan` (active subscriber counts). Endpoints under `/api/analytics/platform/*` guarded by a new `requireAdmin` middleware (Admin + Super Admin, read-only).
- **Metrics required** (FR-019/FR-020/FR-021): active subscribers per plan, MRR (sum of active plan prices, monthly-interval), status distribution, expiring-within-7-days list, new-subscription + cancellation trends.
- **Alternatives considered**: `SubscriptionPlan` only (from 003) — insufficient for status distribution and trends; queries over raw subscription rows directly in controller — violates 3-layer pattern; rejected.
- **Auth model**: Admin + Super Admin can **view** (Clarification Q2); plan mutations (confirm-payment, activate/suspend) remain Super Admin only. Confirm-payment is arguably a billing operation — decision: both Admin and Super Admin can confirm payment (operational), but plan CRUD is Super Admin only (matches PRD Module 4).

---

## 6. Payment lifecycle integration

- **Decision**: Extend `SubscriptionStatus` enum with `pending_payment` and `trial`. `subscription.service.upgrade()` changes from "immediately active + paid invoice" to: validate limits → create/update subscription with `status: "pending_payment"`, `currentPeriodStart/End` unchanged → create `Invoice` with `status: "unpaid"` → return. New admin route `POST /api/admin/subscriptions/:id/confirm-payment` sets status `active`, period end = now + interval, invoice `status: "paid"` + `paidAt`.
- **Rationale**: Matches Clarification Q1 and PRD §18.4. The current auto-activate behavior (verified in code) is the gap this closes.
- **Downgrade**: Currently blocked (`Cannot downgrade. Cancel current plan first.`). Feature requires downgrade with retention warning (FR-016/FR-018). New behavior: allow downgrade from dashboard → creates `pending_payment`-style change that activates immediately upon confirmation (downgrade needs no payment — takes effect at confirmation; frontend shows retention warning first).
- **Trial**: `trial` status used for new owners on Free plan before expiry; countdown fields read from subscription + `PlatformSetting.trial_duration_days`.

---

## 7. Dead code repair — `plan.middleware.js`

- **Decision**: Fix the broken import (`../config/prisma.js` → `../database/db.js` default export) and wire `requirePlan(...)` + `limitByPlan(groundOwnerId, field)` into the subscription + analytics routes (analytics dashboard requires plan feature `analytics: true`; upgrade/cancel require an active subscription context).
- **Rationale**: Constitution VIII requires plan-gated features. The middleware currently falls back to `req.prisma` which never exists in production. Wiring it makes FR-005/FR-013 enforceable at the route level.
- **Alternatives considered**: Rewriting to service-layer checks only — middleware is the constitution-prescribed mechanism; keep it.

---

## Consolidated decisions

| # | Unknown | Decision |
|---|---------|----------|
| 1 | Aggregation scheduling | `node-cron` daily job calling `analytics.service.aggregateDay()`; idempotent upserts self-heal |
| 2 | Chart library | `recharts` (line/bar); heatmap is custom CSS grid |
| 3 | CSV serialization | Hand-rolled RFC 4180 in `src/utils/csv.js` |
| 4 | Retention enforcement | Service-layer query filter on `plan.analyticsRetentionDays`; soft enforcement |
| 5 | Platform analytics | New repo aggregate queries; `/api/analytics/platform/*`; Admin+SuperAdmin view, SuperAdmin mutations |
| 6 | Payment lifecycle | `pending_payment` → admin confirm → `active`; unpaid invoice → paid; downgrade enabled with warning |
| 7 | plan.middleware | Fix import, wire into subscription + analytics routes |
