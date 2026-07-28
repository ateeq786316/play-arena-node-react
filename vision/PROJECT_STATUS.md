# PlayArena — Project Status

> **Sports community platform** for Pakistan — ground booking, team management, matchmaking, tournaments, ratings.
> Audit date: 2026-07-02

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | NestJS 11 + Prisma 7 + PostgreSQL (Bull queues + Redis + AWS S3) |
| **Frontend** | Next.js 15 (App Router) + Tailwind v4 + Zustand + TanStack Query |
| **Auth** | JWT + OTP via email (PBKDF2 hashing) |
| **WebSocket** | Socket.IO (chat + notifications) |
| **Shared** | npm workspace: `@playarena/shared` (Zod DTOs, types, API client) |

---

## What's COMPLETE

### Backend (NestJS) — 16 modules, ~5,000+ lines of real implementation

| Module | Status | Key Features |
|--------|--------|-------------|
| **auth** | ✅ Complete | JWT, OTP, PBKDF2, signup/login/refresh/logout/me |
| **bookings** | ✅ Complete | State machine (pending→approved/rejected/expired/cancelled/completed), slot conflict detection, walk-in booking |
| **grounds** | ✅ Complete | Ground CRUD, courts, schedules, RBAC (ground_access), staff invites |
| **finance** | ✅ Complete | Idempotent payment recording, overpayment protection, cash sessions, payment methods (global/region/ground-level) |
| **teams** | ✅ Complete | CRUD, roster, invites, join requests, captaincy transfer |
| **matchmaking** | ✅ Complete | Challenge system, match lifecycle, score entry, ELO rating |
| **tournaments** | ✅ Complete | Knockout + round-robin bracket generation, standings, registration |
| **ratings** | ✅ Complete | Match peer reviews, leaderboards, player stats |
| **chat** | ✅ Complete | REST + WebSocket gateway, unread tracking, cursor pagination |
| **notifications** | ✅ Complete | CRUD + WebSocket gateway, event-driven push |
| **cash-management** | ✅ Complete | Session open/close, variance calculation |
| **admin** | ✅ Complete | Users/grounds/teams management, audit logs, CRUD for regions/cities/sports/payment methods |
| **users** | ✅ Complete | Profile update, player search |
| **upload** | ✅ Complete | S3 upload with MIME/size validation, multi-folder (avatar, ground, court, team, tournament, booking-proof, chat) |
| **health** | ✅ Complete | DB ping with latency |
| **email** | 🟡 Partial | SMTP with console fallback (no template engine) |

### Common Infrastructure

| Layer | Details |
|-------|---------|
| **Guards** | JWT (public route bypass), Roles (ground-level + user-level), Throttle (IP tracking, 100 req/min) |
| **Decorators** | `@Public()`, `@CurrentUser()`, `@Roles()`, `@GroundAccess()` |
| **Filters** | AllExceptionsFilter (structured errors, correlation IDs) |
| **Interceptors** | Logging (correlation ID, duration), Transform (standardized envelope), Timeout (30s) |
| **Pipes** | ZodValidationPipe (generic schema validation) |
| **Utils** | RatingUtil (ELO + decay), MoneyUtil (PKR), DateUtil (Asia/Karachi), GeoUtil (Haversine), IdempotencyUtil |
| **Events** | 5 event modules (booking, payment, team, match, notification) |
| **Workers** | 7 Bull workers (booking expiry, completion, cash auto-close, chat cleanup, match reminder, notification cleanup, rating decay) |
| **Queues** | notification, expiry, match-reminder |
| **Prisma Schema** | 30+ models covering the full domain |
| **Seed Data** | 4 regions, 17 Pakistan cities, 9 payment methods, 7 sports |
| **API Docs** | Swagger at `/api/docs` |

### Frontend (Next.js 15) — 33 page files, ~95% of routes functional

| Area | Status | Details |
|------|--------|---------|
| **Auth pages** (4) | ✅ Complete | login, signup, forgot-password, verify-otp |
| **Dashboard pages** (29) | ✅ ~95% | See table below |
| **UI Components** (6) | ✅ Complete | Button, Input, Card, Badge, Avatar, Tabs |
| **Layout** (3) | ✅ Complete | Providers (Query + Toaster), Sidebar (role-based, collapsible), Topbar |
| **Stores** (2) | ✅ Complete | auth (Zustand), ui (sidebar collapse) |
| **Middleware** | ✅ Complete | Auth gate, role-based redirect |
| **Config/Styling** | ✅ Complete | Tailwind v4 theme, all configs |
| **Shared package** | ✅ Complete | 6 endpoint modules, 6 Zod DTO files, full types (enums, models, API), date/money utils |

#### Dashboard Pages Detail

| Route | Status |
|-------|--------|
| /home (discover) | ✅ Complete |
| /home/ground/[id] | ✅ Complete |
| /home/ground/[id]/court/[courtId]/book | ✅ Complete |
| /bookings | ✅ Complete |
| /grounds (my grounds) | ✅ Complete |
| /grounds/create | ✅ Complete |
| /grounds/[id]/edit | 🟡 Partial (only name field, no pre-population) |
| /teams | ✅ Complete |
| /teams/[id] | ✅ Complete |
| /teams/create | ✅ Complete |
| /teams/[id]/invite | ✅ Complete |
| /matches | ✅ Complete |
| /matches/[id] | ✅ Complete |
| /matches/create | ✅ Complete |
| /matches/requests/sent | ✅ Complete |
| /matches/requests/received | ✅ Complete |
| /tournaments | ✅ Complete |
| /tournaments/[id] | ✅ Complete |
| /tournaments/create | ✅ Complete |
| /tournaments/[id]/leaderboard | ✅ Complete |
| /chat | ✅ Complete (WebSocket) |
| /finance | ✅ Complete |
| /profile | ✅ Complete |
| /notifications | ✅ Complete |
| /leaderboard | ✅ Complete |
| /ops | ✅ Complete |
| /admin | 🟡 Partial (Users tab works; Grounds/Finance/Settings are placeholders) |

---

## What's PARTIAL / IN PROGRESS

| Item | Status | Gap |
|------|--------|-----|
| **Backend tests** | 🟡 Partial | Only 1 basic e2e Hello World test. Jest configured, no real tests. |
| **Admin page (frontend)** | 🟡 Partial | Only Users tab functional — Grounds, Finance, Settings tabs are "coming soon" |
| **Ground edit page** | 🟡 Partial | Only updates name; doesn't load existing data |
| **Domain components** | 🟡 Not extracted | 8 directories exist (admin, booking, chat, finance, ground, shared, team, tournament) but all empty — UI is inlined in pages |
| **Services layer** | 🟡 Not started | `src/services/` is empty — API calls made directly from pages |
| **Email service** | 🟡 Partial | SMTP works but no template engine; falls back to console.log when SMTP unconfigured |
| **API routes** (Next.js) | 🟡 Not started | `app/api/` directory is empty — planned for auth proxy and uploads |

---

## What's NOT STARTED

| Item | Notes |
|------|-------|
| **Unit/Integration/E2E tests** | No test coverage beyond 1 stub |
| **FCM push notifications** | Planned in architecture, not implemented (no Edge Functions) |
| **Mobile app** (React Native) | Architecture doc describes it but only web frontend exists in codebase |

---

## Architecture Note

The `CLAUDE.md` in `testing and details/` describes a **React Native + Supabase-only** architecture, but the actual codebase is a **Next.js 15 web app + NestJS + PostgreSQL (Prisma)**. The web platform is the evolved/deployed implementation.

---

## Data Files

| File | Location |
|------|----------|
| **Prisma Schema** | `backend/prisma/schema.prisma` (30+ models) |
| **Seed Data** | `backend/scripts/seed.ts` (4 regions, 17 cities, 9 payment methods, 7 sports) |
| **Backend Plans** | `playarena-planning/` (stakeholder overview, backend plan, frontend plan, AWS deployment) |
| **Architecture Docs** | `testing and details/CLAUDE.md` and `testing and details/PROJECT_COMPLETE_DOCUMENTATION.md` |
| **Backend Module Code** | `backend/src/modules/` (16 modules) |
| **Frontend Pages** | `frontend/packages/web/app/` (33 page files) |
| **Shared Package** | `frontend/packages/shared/src/` (API client, DTOs, types, utils) |
