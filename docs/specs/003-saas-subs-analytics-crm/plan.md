# Implementation Plan: SaaS Monetization & Business Tools

**Branch**: `003-saas-subs-analytics-crm` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-saas-subs-analytics-crm/spec.md`

## Summary

Add 6 SaaS backend modules (subscriptions, analytics, CRM, dynamic pricing, disputes, geolocation) + frontend screens to the existing PlayArena platform. Backend extends the Express 5/Prisma 7/PostgreSQL codebase with 18 new models. Frontend adds 35+ screens to the existing Next.js 15 monorepo.

## Technical Context

**Language/Version**: JavaScript (ESM) for backend, TypeScript 5.x for frontend
**Primary Dependencies**: Express 5, Prisma 7, Socket.IO (backend); Next.js 15, React 19, Zustand, TanStack Query, Recharts (frontend)
**Storage**: PostgreSQL (existing), AWS S3 (uploads)
**Testing**: Vitest + supertest (backend — extend existing 159 tests); Vitest + React Testing Library (frontend)
**Target Platform**: Web (Next.js 15 App Router)
**Project Type**: Web application — backend (`playarena-backend/`) + frontend (`playarena-frontend/` monorepo)
**Performance Goals**: API responses <300ms p95; analytics queries <5s for 6-month data; broadcast delivery <5min
**Constraints**: Pakistan market — Asia/Karachi timezone, PKR currency; free-tier deployment (Neon/Supabase + Vercel)
**Scale/Scope**: 6 new backend modules + 35+ frontend screens; extends existing 38 DB models by 18

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Subscription module compatible with existing User/Ground models? | ✅ Confirmed | Extends User with GroundOwnerSubscription FK |
| Analytics data source exists in Booking/Payment models? | ✅ Confirmed | All booking + payment data available for aggregation |
| Dynamic pricing integrates with existing Court price calculation? | ✅ Confirmed | Court.pricePerHour + multiplier = effective price |
| Dispute system references existing Booking model? | ✅ Confirmed | Booking FK + BookingStatus enum extended |
| Geolocation requires PostGIS or lat/lng on existing Ground? | ⚠️ Verify | Ground has lat/lng fields already; need distance query |
| Frontend SAAS pages fit existing dashboard layout? | ✅ Confirmed | Sidebar can add 6 new nav items under "Business" section |
| Feature-flag gating for paid plans already implemented? | ❌ New | Need middleware to check owner plan.features before allowing SaaS endpoints |

## Project Structure

### Documentation (this feature)

```text
specs/003-saas-subs-analytics-crm/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file
├── research.md          # Phase 0: API contract research (TBD)
├── data-model.md        # Phase 1: 18 new Prisma models (TBD)
├── tasks.md             # Phase 2: Task breakdown (created by /sp.tasks)
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
playarena-backend/                           # Existing backend
├── prisma/schema.prisma                     # Add 18 new models
├── prisma/migrations/                       # Add 6 migration files
├── src/
│   ├── modules/
│   │   ├── subscription/                    # NEW - Plans, billing, invoices
│   │   │   ├── subscription.controller.js
│   │   │   ├── subscription.service.js
│   │   │   └── subscription.route.js
│   │   ├── analytics/                       # NEW - Aggregation, reports
│   │   │   ├── analytics.controller.js
│   │   │   ├── analytics.service.js
│   │   │   └── analytics.route.js
│   │   ├── crm/                             # NEW - Broadcasts, templates
│   │   │   ├── crm.controller.js
│   │   │   ├── crm.service.js
│   │   │   └── crm.route.js
│   │   ├── pricing/                         # NEW - Rules, holidays, coupons
│   │   │   ├── pricing.controller.js
│   │   │   ├── pricing.service.js
│   │   │   └── pricing.route.js
│   │   ├── dispute/                         # NEW - Disputes, claims, penalties
│   │   │   ├── dispute.controller.js
│   │   │   ├── dispute.service.js
│   │   │   └── dispute.route.js
│   │   └── geo/                             # NEW - Nearby search
│   │       ├── geo.controller.js
│   │       ├── geo.service.js
│   │       └── geo.route.js
│   ├── middleware/
│   │   └── plan.middleware.js               # NEW - Feature flag gate
│   └── repository/                          # NEW - 6 new repositories
│       ├── subscription.repo.js
│       ├── analytics.repo.js
│       ├── crm.repo.js
│       ├── pricing.repo.js
│       ├── dispute.repo.js
│       └── geo.repo.js
└── tests/                                   # Add test files per module

playarena-frontend/                          # Existing monorepo
├── packages/
│   ├── shared/
│   │   └── src/
│   │       ├── types/index.ts              # Add 18 new interfaces
│   │       └── api/index.ts                # Add 6 new API service modules
│   └── web/
│       └── src/
│           ├── app/(dashboard)/
│           │   ├── subscriptions/           # NEW - Plans, billing history
│           │   ├── analytics/              # NEW - Dashboard, reports
│           │   ├── crm/                    # NEW - Broadcasts, templates
│           │   ├── pricing/               # NEW - Rules, holidays, coupons
│           │   └── disputes/              # NEW - My disputes, file dispute
│           ├── components/
│           │   └── domain/                 # Add SaaS-specific components
│           └── stores/                     # Subscription state (optional)
```

**Structure Decision**: Follow existing 3-layer backend pattern (Controller → Service → Repository + Prisma) for all 6 new modules. Frontend uses existing monorepo layout — new pages go in `(dashboard)` route group. Shared types extend existing TypeScript interfaces.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Feature-flag middleware per module | Ground owners on free plan must not access analytics/CRM/dynamic pricing endpoints | Role-based check insufficient — free owners can still own grounds but shouldn't access premium features |
| Payment integration (Stripe/JazzCash) in subscriptions | Subscription upgrades require real payment processing | Manual payment would require admin intervention, defeating self-service goal |

## Implementation Phases

### Phase 0: Research & Schema Design (Week 1)
- Document 18 new Prisma models with enums, indexes, relations
- Design subscription plan limits enforcement logic
- Plan analytics aggregation strategy (cron/on-demand)
- Research PostGIS vs JS distance calculation for nearby search

### Phase 1: Backend Implementation (Weeks 2-4)
- Build 6 modules (subscription, analytics, CRM, pricing, dispute, geo)
- Add feature-flag middleware
- Write migration SQL
- Add test files per module

### Phase 2: Frontend Screens (Weeks 5-7)
- Build subscription pages (plans, billing, invoices)
- Analytics dashboard with Recharts
- CRM broadcast composer + analytics
- Dynamic pricing rule editor + price preview
- Dispute filing + moderation queue
- Map view with Leaflet for nearby search

### Phase 3: Integration Testing & Polish (Week 8)
- End-to-end subscription flow (signup → select plan → pay → features enabled)
- Analytics data accuracy verification
- Broadcast delivery testing
- Dynamic pricing edge cases
- Dispute resolution workflow
- Geo-search accuracy for test coordinates
