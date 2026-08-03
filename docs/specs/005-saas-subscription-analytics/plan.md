# Implementation Plan: SaaS Subscription Analytics Dashboard

**Branch**: `005-saas-subscription-analytics` | **Date**: 2026-07-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/docs/specs/005-saas-subscription-analytics/spec.md`

## Summary

Build a unified subscription + analytics dashboard. Backend: complete the subscription payment lifecycle (`pending_payment` → admin confirms → `active`), add daily analytics aggregation job (populating existing unused `AnalyticsSnapshot`/`DailyAggregation` upserts), enforce plan retention (soft enforcement by tier), add platform subscription analytics endpoints for Admin/Super Admin, and fix the dead `plan.middleware.js`. Frontend: create shared UI primitives (StatCard, charts, heatmap, table), rebuild `/subscriptions` and `/analytics` pages to the 4-states standard, and add an admin platform-analytics view.

## Technical Context

**Language/Version**: JavaScript (ESM) for backend; TypeScript 5.x for frontend
**Primary Dependencies**: Express 5, Prisma 7 with `@prisma/adapter-pg`, `pg` (backend); Next.js 16, React 19, Zustand 5, Tailwind v4, react-hook-form (frontend). NEW: `node-cron` (backend aggregation job), `recharts` (frontend charts)
**Storage**: PostgreSQL 15+ (existing), AWS S3 presigned URLs for uploads (unchanged)
**Testing**: Vitest v4 + mocked Prisma (backend — extend existing 245+ tests); Vitest + React Testing Library (frontend — new)
**Target Platform**: Web (Next.js App Router, `(dashboard)` route group)
**Project Type**: Web application — backend (`playarena-backend/`) + frontend (`playarena-frontend/` npm workspaces monorepo)
**Performance Goals**: Dashboard loads <3s (SC-001); analytics renders <5s for 12 months data (SC-002); CSV download <10s (SC-004); platform analytics <5s
**Constraints**: Pakistan market — Asia/Karachi TZ, PKR currency; no Redis (in-memory Socket.IO only); plan-gated SaaS features; daily aggregation snapshots (no real-time analytics queries); soft retention enforcement
**Scale/Scope**: Extends 48 existing DB models by 1 new model (`PlatformSetting`) + 2 enum values + 1 plan field; 3 backend modules touched (subscription, analytics, admin) + 1 new job; 3 frontend pages rebuilt + 1 new + ~8 new UI primitives

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Module follows 3-layer pattern (Route → Controller → Service → Repository) | ✅ Pass | Extends existing subscription/analytics modules; new job is standalone infra (not a route) |
| New entities added to Prisma schema with UUID PKs, timestamps, `@@map` | ✅ Pass | `PlatformSetting` follows convention; `SubscriptionStatus` enum extended with `pending_payment`, `trial` |
| API responses follow consistent `{ message, data }` shape | ✅ Pass | Follows existing controller patterns |
| Tests written with mocked Prisma, deterministic IDs, overrides pattern | ✅ Pass | Extends `subscription.test.js`, `analytics.test.js`; new `platform-analytics.test.js` |
| Frontend pages handle all 4 states (loading/empty/error/success) | ✅ Pass | Rebuilt pages must satisfy; UI primitives support skeletons |
| Shared types added to `packages/shared/src/types/` | ✅ Pass | Adds `DailyAggregation`, `PlatformSetting`, extends `SubscriptionStatus` + `SubscriptionPlan` |
| Input validation via express-validator on mutation routes | ✅ Pass | New/updated mutation routes (confirm-payment, upgrade, cancel) get validators |
| Pakistan market: PKR currency, Asia/Karachi TZ where applicable | ✅ Pass | All date computations in Asia/Karachi; currency PKR |
| No Redis dependency introduced, no `any` type, no localStorage tokens | ✅ Pass | node-cron + recharts are the only new deps; no `any` |
| Complexity justified if principle violated | ✅ Pass | Two justified entries below |

## Project Structure

### Documentation (this feature)

```text
docs/specs/005-saas-subscription-analytics/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0: tech decisions (/sp.plan command)
├── data-model.md        # Phase 1: schema changes (/sp.plan command)
├── quickstart.md        # Phase 1: local setup (/sp.plan command)
├── contracts/           # Phase 1: API contracts (/sp.plan command)
│   ├── subscriptions.contracts.md
│   └── analytics.contracts.md
└── tasks.md             # Phase 2: task breakdown (created by /sp.tasks)
```

### Source Code

```text
playarena-backend/
├── prisma/
│   ├── schema.prisma                    # MODIFY: SubscriptionStatus enum, SubscriptionPlan.analyticsRetentionDays, PlatformSetting model
│   ├── migrations/                      # ADD: new migration for enum + model changes
│   └── seed.js                          # ADD: seed 3 subscription plans + platform settings
├── src/
│   ├── jobs/
│   │   └── analytics-aggregation.job.js # NEW: daily snapshot + daily-agg aggregation (node-cron)
│   ├── middleware/
│   │   └── plan.middleware.js           # FIX: dead code — broken prisma import, wire requirePlan/limitByPlan
│   ├── modules/
│   │   ├── subscription/
│   │   │   ├── subscription.service.js  # MODIFY: pending_payment lifecycle, admin confirm, downgrade support, expiry/trial computation
│   │   │   ├── subscription.controller.js
│   │   │   └── subscription.route.js    # MODIFY: add admin confirm-payment + expiring-list routes
│   │   ├── analytics/
│   │   │   ├── analytics.service.js     # MODIFY: retention enforcement, "as of" timestamp, platform analytics, aggregation entrypoint
│   │   │   ├── analytics.controller.js
│   │   │   └── analytics.route.js       # MODIFY: add platform endpoints (admin), CSV export
│   │   └── admin/                       # MODIFY: expose subscription/platform-analytics admin handlers
│   ├── repository/
│   │   ├── subscription.repo.js         # MODIFY: admin queries (expiring, by-status, confirm payment)
│   │   └── analytics.repo.js            # MODIFY: platform aggregate queries, retention-aware reads
│   └── utils/
│       └── csv.js                       # NEW: CSV serializer (RFC 4180, hand-rolled — no new dep)
└── tests/
    ├── subscription.test.js             # MODIFY: payment lifecycle, confirm, downgrade, limits
    ├── analytics.test.js                # MODIFY: retention filter, as-of, aggregation
    └── platform-analytics.test.js       # NEW: admin platform metrics

playarena-frontend/
├── packages/
│   ├── shared/
│   │   └── src/
│   │       ├── types/index.ts           # MODIFY: add DailyAggregation, PlatformSetting; extend SubscriptionStatus, SubscriptionPlan
│   │       └── utils/index.ts           # MODIFY: getStatusColor subscription statuses
│   └── web/
│       └── src/
│           ├── app/(dashboard)/
│           │   ├── subscriptions/page.tsx        # REBUILD: plan status, usage bars, trial countdown, upgrade flow
│           │   ├── subscriptions/my/page.tsx      # REBUILD: current plan, usage vs limits, renewal
│           │   ├── analytics/page.tsx             # REBUILD: charts, heatmap, date-range, retention notice, CSV
│           │   └── admin/analytics/page.tsx       # NEW: platform subscription analytics (Admin/Super Admin)
│           ├── components/
│           │   ├── ui/                            # NEW: Button, Card, Badge, StatCard, DataTable, Skeleton
│           │   └── domain/
│           │       ├── charts/                    # NEW: RevenueChart, BookingTrendsChart (recharts)
│           │       ├── UtilizationHeatmap.tsx     # NEW
│           │       ├── UsageBar.tsx               # NEW: plan limit progress with 100% warning
│           │       ├── PlanComparisonTable.tsx    # NEW
│           │       └── RetentionNotice.tsx        # NEW
│           └── stores/                            # (unchanged — zustand auth/ui)
```

**Structure Decision**: Follow existing 3-layer backend pattern (Route → Controller → Service → Repository) for all touched modules. The aggregation job is standalone infrastructure started from `server.js` (not an HTTP route). Frontend follows the existing monorepo layout — rebuilt pages in `(dashboard)` route group, new UI primitives in `components/ui/` + `components/domain/`, shared types extended in `packages/shared`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `node-cron` scheduler dependency (new backend dep) | Constitution VIII mandates daily aggregation snapshots; no scheduler exists in the codebase | Manual `setInterval` in server.js — fragile across restarts and not observable; node-cron is the standard minimal scheduler |
| `recharts` chart library (new frontend dep) | Analytics dashboard requires revenue trends, booking trends, and utilization visualization to satisfy FR-006–FR-009 and SC-002 | Hand-rolled SVG charts — high effort, inconsistent, and unmaintainable across 4+ chart types |
| `plan.middleware.js` requires fixing dead import | Constitution VIII requires plan-gated features; current file imports nonexistent `config/prisma.js` and is never wired | Removing the middleware entirely — would violate the constitution's plan-gating principle |

## Implementation Phases

### Phase 0: Research (this file's supporting doc)
- Confirm aggregation scheduling approach (node-cron) and failure/retry semantics
- Confirm chart library + CSV serialization approach (recharts, hand-rolled CSV)
- Confirm retention enforcement point (service-layer filter on plan retention days)
- Confirm platform analytics query patterns (aggregate across `GroundOwnerSubscription`, `Invoice`)

### Phase 1: Backend
- Schema: extend `SubscriptionStatus` enum (`pending_payment`, `trial`), add `SubscriptionPlan.analyticsRetentionDays`, add `PlatformSetting` model; generate migration
- Seed script: 3 plans (Free/Starter/Professional) + settings (`trial_duration_days`, `variance_threshold`)
- Subscription service: upgrade → `pending_payment` + unpaid invoice; admin confirm → `active` + invoice `paid`; downgrade with retention warning; expiry/trial countdown computation
- Analytics service: retention-aware reads, "as of" timestamp, platform aggregate queries, aggregation entrypoint
- Aggregation job: daily run building `AnalyticsSnapshot` + `DailyAggregation` per approved ground
- Fix `plan.middleware.js`; wire `requirePlan`/`limitByPlan` into subscription + analytics routes
- CSV serializer + platform analytics routes
- Tests: extend subscription/analytics, add platform-analytics

### Phase 2: Frontend
- Shared types: `DailyAggregation`, `PlatformSetting`, `pending_payment`/`trial` statuses, `analyticsRetentionDays`
- UI primitives: Button, Card, Badge, StatCard, DataTable, Skeleton
- Domain components: RevenueChart, BookingTrendsChart, UtilizationHeatmap, UsageBar, PlanComparisonTable, RetentionNotice
- Rebuild `/subscriptions`, `/subscriptions/my` (usage bars, countdown, upgrade with pending_payment flow)
- Rebuild `/analytics` (charts, heatmap, date-range, retention notice, CSV download)
- New `/admin/analytics` (platform subscription analytics)
- Component tests: 4 states per new/rebuilt page

### Phase 3: Integration & Polish
- End-to-end: upgrade → pending_payment → admin confirms → active → analytics retention expands
- Aggregation job accuracy verification against raw bookings
- Retention soft-enforcement verification (no data leakage across tiers)
- Full backend test suite + frontend build
