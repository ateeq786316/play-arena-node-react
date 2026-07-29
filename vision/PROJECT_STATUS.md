# PlayArena — Project Status

> **Sports community platform** for Pakistan — ground booking, team management, matchmaking, tournaments, ratings.
> Audit date: 2026-07-29

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Express 5 + Prisma 7 + PostgreSQL (Socket.IO) |
| **Frontend** | Next.js 15 (App Router) + Tailwind v4 + Zustand + TanStack Query |
| **Auth** | JWT + OTP via email (PBKDF2 hashing) |
| **WebSocket** | Socket.IO (chat + notifications) |
| **Shared** | npm workspace: `@playarena/shared` (Zod DTOs, types, API client) |

---

## What's COMPLETE

### Backend (Express) — 8/14 modules done, ~155+ tests, all passing

| Module | Status | Key Features |
|--------|--------|-------------|
| **auth** | ✅ Complete | JWT, OTP, signup/login/refresh/logout/profile, password reset, Google OAuth |
| **grounds** | ✅ Complete | Ground CRUD, courts, schedules, settings, RBAC (owner/manager/staff), regions/cities, staff invites |
| **bookings** | ✅ Complete | 6-state machine, slot conflict detection (SELECT FOR UPDATE), walk-in, deposits, payments, availability grid |
| **teams** | ✅ Complete | CRUD, roster (captain/co-captain/player), invites, join requests, captaincy transfer, ELO history |
| **matchmaking** | ✅ Complete | Challenge system, dual-confirmation scoring, ELO (K=32/24, floor 100), match lifecycle |
| **tournaments** | ✅ Complete | 3 bracket formats (knockout/round_robin/group_knockout), auto-advance, standings (W=3/D=1) |
| **finance** | ✅ Complete | Payment methods (global/ground level), cash sessions (open/close/variance), ground finance, reports |
| **chat** | ✅ Complete | REST (4 endpoints) + Socket.IO WebSocket, ground rooms, cursor pagination, typing indicators, unread tracking |
| **notifications** | ❌ Not started | CRUD + WebSocket, event-driven |
| **ratings** | ❌ Not started | Peer reviews, leaderboards, player stats |
| **admin** | ❌ Not started | User/ground/team management, audit logs |
| **upload** | ❌ Not started | S3 with MIME/size validation |
| **health** | ❌ Not started | DB ping with latency |

### Common Infrastructure

| Layer | Details |
|-------|---------|
| **Auth** | JWT in httpOnly cookies (accessToken 15min, refreshToken 7d), OTP via email, Google OAuth |
| **RBAC** | Ground-level (owner/manager/staff), User-level (player/super_admin) |
| **Security** | Helmet, HPP, CORS, rate limiting (100 req/min) |
| **Validation** | express-validator + Zod |
| **Logging** | Pino |
| **WebSocket** | Socket.IO (/chat namespace, ground rooms) |
| **Prisma Schema** | 49+ models covering the full domain |
| **Testing** | Vitest + supertest, 8 test files, 159 passing tests |

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
