# Quickstart: SaaS Subscription Analytics Dashboard

**Branch**: `005-saas-subscription-analytics` | **Date**: 2026-07-31

## Prerequisites

- Node.js 20+ (Docker image uses Node 20)
- PostgreSQL 15+ (local or Docker via `docker-compose.yml`)
- npm workspaces monorepo — install from repo root (`playarena-frontend/`) or backend separately

## Local Setup

### Backend (`playarena-backend/`)

```bash
cd playarena-backend

# 1. Install dependencies
npm install

# 2. Environment
cp .env.example .env
#   DATABASE_URL="postgresql://<user>:<pass>@localhost:5432/playarena"
#   PORT=5000, CORS_ORIGIN, JWT secrets, etc. per existing .env.example

# 3. Apply schema changes (enum values + PlatformSetting + analyticsRetentionDays)
npx prisma migrate dev --name add_subscription_analytics_fields

# 4. Seed plans + platform settings (idempotent upserts)
npm run prisma:seed   # or: npx prisma db seed
```

### Frontend (`playarena-frontend/`)

```bash
cd playarena-frontend
npm install            # installs workspace packages (shared, web)

# Run dev server (Next.js App Router) — proxies /api to backend
npm run dev            # → http://localhost:3000
```

## Configuration

| Setting | Key (`platform_settings`) | Default |
|---------|---------------------------|---------|
| Trial toggle | `trial_enabled` | `"true"` |
| Trial duration | `trial_duration_days` | `"14"` |
| Cash variance threshold | `variance_threshold` | `"500"` |

| Plan | `analyticsRetentionDays` | Max grounds | Max courts |
|------|--------------------------|-------------|------------|
| Free | 7 | 1 | 2 |
| Starter | 30 | 3 | 5 |
| Professional | 365 | unlimited | unlimited |

## Verification

### Backend tests

```bash
cd playarena-backend
npx vitest run            # all suites incl. subscription, analytics, platform-analytics
```

### Frontend

```bash
cd playarena-frontend
npm run lint              # eslint
npm run build             # production build (must be 0 errors)
```

## Manual smoke test

1. Start backend (`npm run dev`) + frontend (`npm run dev`).
2. Sign up as owner → Free plan with `trial` status visible on `/subscriptions` with 14-day countdown.
3. Open `/subscriptions` → usage bars show 0/1 grounds; create a ground → 1/1 with 100% warning + upgrade CTA.
4. Click upgrade to Starter → subscription becomes `pending_payment`; invoice `unpaid`.
5. As Admin: `POST /api/admin/subscriptions/:id/confirm-payment` → status `active`, period +30d.
6. Create bookings → open `/analytics` → revenue/bookings/heatmap render; "as of" shows last aggregated day.
7. Run aggregation job (or trigger `analytics.service.aggregateDay(today-1)`) → snapshots appear; dashboard reflects them.
8. On Free plan, attempt date range older than 7 days → retention notice shown, data clamped.
9. As Admin/Super Admin → `/admin/analytics` shows subscribers per plan, MRR, status distribution.
