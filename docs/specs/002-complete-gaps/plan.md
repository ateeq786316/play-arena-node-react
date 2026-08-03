# Implementation Plan: Platform Gap Closure — Missing Modules & SaaS Features

**Branch**: `002-complete-gaps` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-complete-gaps/spec.md` + codebase research

## Summary

The PlayArena backend (Express 5 + Prisma 7 + PostgreSQL) is **fully implemented** with 12 modules (auth, grounds, bookings, teams, matchmaking, tournaments, finance, chat, notifications, ratings, admin, upload, health) and **159+ passing tests**. The primary gap is the **frontend (Next.js 15)** which is completely unstarted. Secondary gaps are **advanced SaaS features** (subscriptions, analytics, CRM, dynamic pricing, dispute resolution, geolocation) which require both backend extension and full frontend implementation.

This plan covers: Phase 0 (research backend contracts), Phase 1 (frontend foundation + all screens), Phase 2 (SaaS backend features), Phase 3 (SaaS frontend features).

## Technical Context

**Language/Version**: TypeScript 7.0 / JavaScript (ESM) — backend uses JS, frontend uses TS  
**Primary Dependencies**: Express 5, Prisma 7, PostgreSQL, Socket.IO (backend); Next.js 15, React 19, Tailwind v4, Zustand, TanStack Query (frontend)  
**Storage**: PostgreSQL (primary), AWS S3 (file uploads), Redis (Socket.IO)  
**Testing**: Vitest + supertest (backend — 159 tests); need frontend testing setup  
**Target Platform**: Web (Next.js 15 server-side rendered)  
**Project Type**: Web application (backend + frontend)  
**Performance Goals**: API responses <200ms p95; page loads <2s; WebSocket delivery <500ms  
**Constraints**: Pakistan market — Asia/Karachi timezone, PKR currency, Urdu/English bilingual support  
**Scale/Scope**: 12 backend modules complete, ~38 DB models, 0 frontend code; need 145+ screens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Frontend architecture matches backend module structure? | ⚠️ Verify | Backend has 12 modules; frontend must mirror this |
| API contracts are documented and stable? | ⚠️ Verify | Need to research all route signatures before building frontend |
| Auth flow (JWT cookie) is compatible with Next.js? | ✅ Known | httpOnly cookie with SameSite=Lax works with SSR |
| Socket.IO client pattern is established? | ✅ Known | Backend uses `/chat` and `/notifications` namespaces |
| Frontend scaffold needs Next.js 15 + Tailwind v4? | ✅ Known | Use `create-next-app` with App Router |
| SaaS features impact existing DB schema? | ⚠️ Verify | Need schema migrations for 7+ new tables |

## Project Structure

### Documentation (this feature)

```text
specs/002-complete-gaps/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file
├── research.md          # Phase 0: API contract research
├── data-model.md        # Phase 1: New SaaS entity design
├── quickstart.md         # Phase 1: Frontend dev setup guide
├── contracts/           # Phase 1: API contract docs per module
│   ├── auth.contracts.md
│   ├── grounds.contracts.md
│   ├── bookings.contracts.md
│   ├── teams.contracts.md
│   ├── matchmaking.contracts.md
│   ├── tournaments.contracts.md
│   ├── finance.contracts.md
│   ├── chat.contracts.md
│   ├── notifications.contracts.md
│   ├── ratings.contracts.md
│   ├── admin.contracts.md
│   ├── upload.contracts.md
│   └── health.contracts.md
└── tasks.md             # Phase 2: Task breakdown (created by /sp.tasks)
```

### Source Code (repository root)

```text
playarena-backend/                           # ✅ COMPLETE — 12 modules, 159 tests
├── src/
│   ├── app.js                               # Express factory
│   ├── config/                              # Env, logger, nodemailer, S3
│   ├── constant/
│   ├── database/                            # Prisma client singleton
│   ├── middlewares/                         # Auth, error handler, security
│   ├── modules/                             # 12 feature modules
│   │   ├── auth/
│   │   ├── ground/
│   │   ├── booking/
│   │   ├── team/
│   │   ├── match/
│   │   ├── tournament/
│   │   ├── finance/
│   │   ├── chat/
│   │   ├── notification/
│   │   ├── rating/
│   │   ├── admin/
│   │   ├── upload/
│   │   └── health/
│   ├── repository/                          # Data access layer per module
│   ├── shared/                              # ApiError, error classes
│   ├── socket/                              # Socket.IO setup
│   ├── utils/                               # asyncHandler, emailTemplates, JWT
│   └── validation/                          # Express-validator rules
├── prisma/
│   └── schema.prisma                        # 38 models, 13 enums
└── tests/                                   # 14 test files, 159+ tests

playarena-frontend/                           # ⬜ UNSTARTED — needs full build
├── packages/
│   ├── shared/                              # Zod DTOs, types, API client, utils
│   │   ├── src/
│   │   │   ├── api/                         # 12+ API client modules
│   │   │   ├── dtos/                        # Zod validation schemas
│   │   │   ├── types/                       # Shared TypeScript types
│   │   │   └── utils/                       # Date/money formatting
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                                 # Next.js 15 App Router application
│       ├── app/
│       │   ├── (auth)/                      # Login, signup, verify-otp, forgot-password, reset-password
│       │   ├── (dashboard)/
│       │   │   ├── home/                    # Ground discovery, search, map
│       │   │   ├── bookings/                # My bookings, booking detail
│       │   │   ├── teams/                   # Teams CRUD, roster, invites
│       │   │   ├── matches/                 # Matches, challenges, score entry
│       │   │   ├── tournaments/             # Tournaments, brackets, standings
│       │   │   ├── leaderboard/             # ELO ranking, player profiles
│       │   │   ├── chat/                    # Real-time messaging
│       │   │   ├── notifications/           # Notification list, preferences
│       │   │   ├── finance/                 # Cash sessions, reports
│       │   │   ├── grounds/                 # Ground management (owner)
│       │   │   ├── ops/                     # Staff operations dashboard
│       │   │   ├── profile/                 # User profile, settings
│       │   │   └── admin/                   # Super admin panel
│       │   ├── subscriptions/               # Billing & plans (SaaS)
│       │   ├── analytics/                   # Business intelligence (SaaS)
│       │   ├── pricing/                     # Dynamic pricing rules (SaaS)
│       │   ├── crm/                         # Broadcast & campaigns (SaaS)
│       │   ├── disputes/                    # Dispute resolution (SaaS)
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/                      # shadcn/ui primitives
│       │   │   ├── layout/                  # Sidebar, Topbar, Providers
│       │   │   └── domain/                  # GroundCard, TeamCard, BookingCard, etc.
│       │   ├── stores/                      # Zustand stores (auth, ui)
│       │   ├── hooks/                       # Custom React hooks
│       │   ├── lib/                         # Utilities, API client instance
│       │   └── middleware.ts                # Auth gate, role-based redirect
│       ├── package.json
│       ├── next.config.js
│       ├── tailwind.config.js
│       └── tsconfig.json
│   ├── package.json                         # Root workspace config
│   └── tsconfig.base.json

docs/                                        # Documentation
├── CONTEXT.md                               # Project context and domain language
└── architecture.md                          # Architecture decisions
```

**Structure Decision**: Monorepo with npm workspaces (`packages/shared` + `packages/web`). Backend is separate at `playarena-backend/`. This matches the established pattern from the observation document (the old `play-arena` project used this layout). The frontend mirrors the 12 backend modules as page groups.

## Implementation Phases

### Phase 0: Research & Contract Mapping (Week 1)
**Goal**: Document every backend API contract to guide frontend development

| Step | Action | Output |
|------|--------|--------|
| 0.1 | Read all backend route files to extract endpoint signatures | `contracts/*.md` per module |
| 0.2 | Read Prisma schema for full type definitions | `data-model.md` entity reference |
| 0.3 | Read all Zod DTOs (if any exist) or express-validator rules | Contract validation rules |
| 0.4 | Map Socket.IO events (chat + notifications namespaces) | WebSocket contract doc |
| 0.5 | Document auth flow (cookie names, refresh mechanism, middleware behavior) | Auth flow doc |
| 0.6 | Verify test patterns (vitest + supertest setup) | Quickstart test guide |

### Phase 1: Frontend Foundation (Weeks 2-3)
**Goal**: Scaffold Next.js 15 project, shared package, auth flow, and layout

| Step | Action | Dependencies |
|------|--------|-------------|
| 1.1 | `create-next-app` with TypeScript, App Router, Tailwind v4 | None |
| 1.2 | Initialize npm workspace: `packages/shared` + `packages/web` | 1.1 |
| 1.3 | Build shared package: TypeScript types (enums, models, API responses), Zod DTOs, API client with `fetch` + cookie auth, utility functions (date, money) | 0.1-0.5 |
| 1.4 | Set up shadcn/ui primitives: Button, Input, Card, Badge, Avatar, Tabs, Dialog, Dropdown, Select, Toast | 1.2 |
| 1.5 | Build layout: Role-based Sidebar (13 nav items, collapsible 240px/60px), Topbar, QueryClient + Toaster Providers | 1.4 |
| 1.6 | Implement Zustand stores: `auth` (user, login, signup, logout, refreshUser), `ui` (sidebarCollapsed) | 1.5 |
| 1.7 | Build Next.js middleware: read `accessToken` cookie, redirect unauthenticated to `/login?redirect=`, redirect authenticated away from auth pages | 0.5 |
| 1.8 | Implement auth pages: Login, Signup, Verify-OTP, Forgot Password, Reset Password — all with react-hook-form + Zod validation | 1.6, 1.7 |

### Phase 2: Core Dashboard Pages (Weeks 4-8)
**Goal**: Build all 29+ dashboard pages across 12 modules, each handling loading/empty/error/success states

| Module | Pages | Priority |
|--------|-------|----------|
| **Home/Discovery** | Home (search + featured + sport filters), Search Results, Map View, Ground Detail, Court Booking Flow, Booking Confirmation | P1 |
| **My Bookings** | Bookings list (Upcoming/Past/All tabs), Booking Detail | P1 |
| **Teams** | My Teams, Team Detail (Roster/Matches/Stats tabs), Create Team, Invite Member, Join Requests, Team Invitations | P1 |
| **Matchmaking** | My Matches, Match Detail, Create Challenge, Score Entry, Requests Sent/Received | P1 |
| **Tournaments** | Tournament List, Detail (Bracket/Standings/Teams tabs), Create, Register, Result Entry | P1 |
| **Leaderboard** | Global Leaderboard (Teams/Players tabs), Player Public Profile, Match Rating form | P2 |
| **Chat** | Chat Rooms list, Chat Room (real-time messages + pagination + typing indicators) | P2 |
| **Notifications** | Notifications List (unread indicators, mark read, mark all read), Preferences | P2 |
| **Finance (Owner)** | Finance Dashboard, Cash Session Open/Close, Session History, Record Payment, Reports, Ground Finance Summary | P2 |
| **Ground Mgmt (Owner)** | My Grounds, Ground Dashboard, Create/Edit Ground, Court Management, Schedule Management, Settings, Staff Management, Images, Payment Methods | P2 |
| **Operations (Staff)** | Ops Dashboard, Walk-in Booking, Today's Bookings, Booking Approval, Court Status | P2 |
| **Profile** | My Profile, Edit Profile, Account Settings, Communication Preferences, Privacy | P2 |
| **Admin (Super Admin)** | Admin Dashboard, User Management, Ground Moderation, Finance Analytics, Audit Logs, Regions/Cities/Sports/Payment Methods CRUD | P2 |

### Phase 3: SaaS Backend Features (Weeks 9-11)
**Goal**: Extend backend with subscription, analytics, CRM, dynamic pricing, dispute resolution, geolocation

| Feature | New Modules/Models | Key Endpoints |
|---------|-------------------|--------------|
| **Subscriptions** | `subscription` module: SubscriptionPlan, GroundOwnerSubscription, Invoice models | `POST /api/subscriptions/upgrade`, `GET /api/subscriptions/plans`, `GET /api/subscriptions/invoices`, `POST /api/subscriptions/cancel` |
| **Analytics** | `analytics` module: AnalyticsSnapshot, DailyAggregation models | `GET /api/grounds/:id/analytics`, `GET /api/grounds/:id/analytics/utilization-heatmap`, `GET /api/admin/analytics` |
| **CRM** | `crm` module: BroadcastMessage, CommunicationLog, UserCommunicationPreference models | `POST /api/grounds/:id/broadcasts`, `GET /api/grounds/:id/broadcasts`, `POST /api/crm/campaigns/toggle` |
| **Dynamic Pricing** | `pricing` module: PricingRule, HolidayPricing, Coupon, CouponUsage models | `GET/POST /api/grounds/:id/pricing-rules`, `POST /api/coupons/validate`, `CRUD /api/grounds/:id/coupons` |
| **Disputes** | `dispute` module: Dispute, DamageClaim, NoShowPenalty models | `POST /api/disputes`, `GET /api/disputes`, `PATCH /api/admin/disputes/:id/resolve` |
| **Geolocation** | Extend `ground` module with geo-indexed queries | `POST /api/grounds/nearby` (lat, lng, radius, sport, city) |

### Phase 4: SaaS Frontend Features (Weeks 12-14)
**Goal**: Build frontend screens for all Phase 3 SaaS features

| Feature | Pages | Priority |
|---------|-------|----------|
| **Subscriptions** | Plans comparison, My Subscription, Change Plan, Billing History, Invoice Detail, Payment Methods, Cancel Subscription | P3 |
| **Analytics** | Analytics Dashboard, Revenue Analytics, Utilization Heatmap, Booking Analytics, Customer Analytics, Revenue Forecast, Download Reports | P3 |
| **Dynamic Pricing** | Pricing Rules list, Create/Edit Rule, Holiday Pricing, Coupon Management, Create/Edit Coupon, Price Preview | P3 |
| **CRM** | Broadcast Messages, Create Broadcast, Broadcast Analytics, Templates, Re-engagement Campaigns, Communication Preferences | P3 |
| **Disputes** | My Disputes, File Dispute, Dispute Detail, Damage Claim (Staff), Moderation Queue (Admin), Moderation Detail (Admin) | P3 |
| **Geolocation** | Map View (Leaflet integration with markers, clusters, sync with results list), "Near Me" button on home page | P3 |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Monorepo with npm workspaces (packages/shared + packages/web) | Enforces type safety across shared DTOs, API client, and types between frontend and backend | Single package would duplicate types and validation logic |
| 3-layer backend (Controller → Service → Repository) | Existing pattern in codebase; all 12 modules follow this | Direct Prisma calls in controllers would violate existing conventions |
| All 145+ screens in one Next.js app | Single SPA with role-based routing is simpler than micro-frontends | Multiple apps would complicate auth, shared state, and deployment |

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| API contracts change during frontend development | High — breaks frontend builds | Medium | Lock API contracts in Phase 0; version API as `/api/v1` |
| Backend auth flow incompatible with Next.js SSR | High — breaks all authenticated pages | Low | httpOnly cookies work with SSR; middleware reads cookie server-side |
| Socket.IO client pattern undocumented | Medium — chat/notification pages delayed | Low | Backend socket code is clear; 2 namespaces with established patterns |
| 145+ screens is large scope | High — timeline pressure | High | Prioritize P1 pages (auth + home + bookings + teams + matches); P2/P3 can be incremental |
| No frontend tests configured | Medium — quality risk | High | Add Vitest + React Testing Library in Phase 1 foundation |
