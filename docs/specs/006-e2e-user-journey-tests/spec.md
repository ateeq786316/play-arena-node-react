# End-to-End User Journey Test Specification

**Feature Branch**: `006-e2e-user-journey-tests`
**Created**: 2026-07-31
**Status**: Draft
**Sources**: `docs/specs/003-saas-subs-analytics-crm/`, `docs/specs/005-saas-subscription-analytics/`, `docs/vision/vision-backend/requirement.md`, `docs/vision/vision-backend/TESTING.md`, `docs/vision/complete-project-spec.md`, `docs/vision/screens-spec.md`

---

## 1. Purpose & Scope

This specification defines **full user-journey tests** that exercise the PlayArena application across all three layers:

1. **Frontend UI interaction** — the Next.js web app (`playarena-frontend/packages/web`) as a real user would use it.
2. **Backend API endpoints** — the Express 5 server (`playarena-backend`), validating every request/response cycle (status codes, response shape, payload fields, auth/RBAC, validation errors).
3. **DB persistence** — PostgreSQL, verifying every write creates/updates the correct rows via read-only `SELECT` queries (never destructive).

Every journey is a **traceable vertical slice**: a user-story intent, the UI steps that trigger it, the exact API calls fired, the expected response contract, and the persisted state that must result.

### 1.1 Test Targets

| Layer | Tech | Location |
|---|---|---|
| Frontend | Next.js 16 (App Router), React 19, Zustand 5, Tailwind v4, react-leaflet | `playarena-frontend/packages/web` |
| Shared | API client (`api.get/post/patch/delete`) + TS types | `playarena-frontend/packages/shared` |
| Backend | Express 5, Prisma 7 (`@prisma/adapter-pg`), pg, Socket.IO, node-cron | `playarena-backend` |
| DB | PostgreSQL 16+ | local dev DB |

### 1.2 Scope Decisions

- **In scope:** 9 user stories spanning all 14 backend modules and every frontend page that calls the API.
- **Out of scope:** unit tests, pure integration suites already covered by `playarena-backend/tests/*` (293 passing), and manual exploratory QA. This spec is the **journey-level** layer on top of them.
- E2E runs against the **live dev server** (backend `npm start` on `:3000`, seeded Postgres) with real HTTP + cookies + a real browser (Playwright) or an equivalent cookie-jar HTTP client.

---

## 2. CRITICAL CONSTRAINT — Data Preservation (Read Before Anything)

> ### 🚫 Do NOT delete, truncate, or wipe seed data during or after test execution. All seed data and test-generated state MUST remain intact in the database.

This is a **hard, non-negotiable constraint**. The PlayArena database is a living dev environment with hand-crafted seed data (see §4) and previously generated E2E state. The following rules apply to every journey in this spec:

### 2.1 Absolute Prohibitions

- **NO** `DELETE FROM`, `TRUNCATE`, `DROP`, or `DROP DATABASE` statements anywhere in test setup, execution, or teardown.
- **NO** `prisma migrate reset`, `prisma db push --force-reset`, or `prisma db execute` destructive scripts.
- **NO** re-running `prisma:seed` in a way that would overwrite user-owned rows. The seed (`prisma/seed.js`) only `upsert`s `SubscriptionPlan` and `PlatformSetting` rows, so it is safe to run for those 7 rows — but it must never be pointed at a fresh schema that wipes other tables.
- **NO** bulk-cleaning test rows after the run. Test-generated state **stays**.
- **NO** mocking/pointing `DATABASE_URL` at the production DB.

### 2.2 What the Seed Actually Contains (do not disturb)

`playarena-backend/prisma/seed.js` upserts only:

| Table | Rows |
|---|---|
| `subscription_plans` | Free (0/mo, 1 ground, 2 courts, 7d retention), Starter (5000/mo, 3 grounds, 5 courts, 30d), Professional (15000/mo, unlimited, 365d) |
| `platform_settings` | `trial_enabled=true`, `trial_duration_days=14`, `variance_threshold=500`, `retention_grace_days=0` |

**No users, grounds, courts, bookings, teams, or matches are seeded.** All users/domains data is hand-created and must be preserved.

### 2.3 Test Identity & Isolation Strategy

Because state must persist, every test **creates its own uniquely-namespaced records** so runs are idempotent and identifiable, and never conflicts with pre-existing data:

- **Email namespace:** every test account uses a fixed, documented email, e.g. `e2e.player.<scenario>.@example.com` (see §5 identity table). Registration is the ONLY way accounts are created (never direct DB inserts for users), so re-runs reuse the same accounts instead of duplicating.
- **Unique codes/references:** coupons, idempotency keys, team names, and ground names get a stable per-scenario suffix (e.g. `E2E-<SCENARIO>-GROUND`) so re-runs can look them up and assert on them rather than re-creating duplicates.
- **Idempotent assertions:** assertions are written to tolerate "already exists" for the fixed identities (e.g., a re-run may see `409 ALREADY EXIST` for a duplicate team join; the test then verifies the pre-existing row is unchanged instead of failing).
- **Row attribution:** all test-created rows carry the test email/name in their foreign key columns, making them greppable and clearly separated from hand-made seed rows.

### 2.4 Teardown Policy

- **Default: no teardown.** The spec explicitly forbids deleting test state.
- Where a journey must not leave visible cruft (e.g., a broadcast that would spam), it uses **soft state transitions already built into the app** (cancel, withdraw, dismiss) — never hard deletes.
- The only permitted "cleanup" is calling the app's own soft-delete endpoints (e.g., `DELETE /api/teams/:id` soft-deletes; `PATCH /api/disputes/:id/resolve` with `action:"dismissed"` closes a dispute) — these preserve rows.

### 2.5 Verification of the Constraint

Each journey's **DB assertion phase** MUST begin with a "preservation check": read row counts of the seed tables and confirm they match expected values (3 plans, 4 settings) before proceeding, and confirm no pre-existing hand-created ground/booking rows disappeared.

---

## 3. Test Environment & Setup

### 3.1 Prerequisites

| Requirement | Command |
|---|---|
| Node 20+, PostgreSQL running | — |
| Backend deps + env | `cd playarena-backend && npm install && cp .env.example .env` |
| Apply schema (already applied in dev DB) | `npx prisma migrate dev` (non-destructive) |
| Seed plans + settings (idempotent, safe) | `npm run prisma:seed` |
| Frontend deps | `cd playarena-frontend && npm install` |
| Frontend API base | `NEXT_PUBLIC_API_URL=http://localhost:3000` (default) |

### 3.2 Services Under Test

| Service | Start | Port |
|---|---|---|
| Backend (Express + Socket.IO + cron) | `cd playarena-backend && npm start` (`tsx server.js`) | `3000` |
| Frontend (Next.js) | `cd playarena-frontend && npm run dev` | `3001` (proxies `/api` → `3000`) |

> **Note:** backend has **no file watcher** (`npm start` = `tsx server.js`). Restart it after any backend code change before running E2E.

### 3.3 E2E Client Requirements

- **Cookie jar required.** Auth is cookie-based (`accessToken` + `refreshToken`, httpOnly). A bare `Authorization` header will NOT authenticate. The shared API client sends `credentials: "include"` and auto-refreshes on 401 via `POST /api/user/refresh`.
- **Browser E2E (recommended):** Playwright (Chromium). Assert real DOM (status badges, error messages, redirects) AND intercept the network to validate each `api.*` call's request/response.
- **API-only E2E (CI-friendly):** a cookie-jar HTTP client (Node `fetch` with `Cookie` headers, or curl). Use this for the request/response-cycle and DB-persistence assertions; add a thin Playwright layer for the UI-step columns.
- **Socket.IO client** required for chat/notification journeys (`socket.io-client` with `auth.token` from cookie).

### 3.4 Global Rate Limit

`security.middleware.js` applies **500 req / 15 min / IP**. Spread the journeys (§8 execution order) so a full run stays under the limit; if a `429 RATE_LIMIT_EXCEEDED` is hit, pause until the window resets — do not lower the limit or bypass it (bypassing invalidates the test).

### 3.5 Global Auth & Cookie Handling

1. `POST /api/user/register` / `POST /api/user/login` → server sets `accessToken` (15 min) + `refreshToken` (7 d) cookies.
2. `authMiddleware` reads `req.cookies.accessToken`, verifies with `env.ACCESSTOKEN`, sets `req.userId`. No Bearer support — always send cookies.
3. Frontend auto-refresh: on 401 the shared client calls `POST /api/user/refresh` once and retries. E2E should assert this retry-once behavior at least once (journey §7.1).
4. Logout: `POST /api/user/logout` clears cookies → subsequent protected calls must 401.

### 3.6 Roles Under Test

| Role | How obtained | Notes |
|---|---|---|
| `player` | signup default | can book, teams, matches, tournaments, chat |
| `owner` | signup default → create a ground | ground-scoped RBAC owner |
| `manager` / `staff` | `POST /api/grounds/:groundId/invites` (owner) or direct role update | ground-scoped roles |
| `admin` | DB role update (no API) | `requireAdmin` accepts `admin` + `super_admin` |
| `super_admin` | DB role update (no API) | `/api/admin/*` service requires exactly `super_admin` |

> **No API promotes roles.** E2E setup script updates `users.role` via a read-only-by-convention psql one-liner that only touches the specific test account row (never `DELETE`/`TRUNCATE`). This is the single permitted direct-DB mutation and it is scoped to the test email.

---

## 4. Seed Data Inventory (Preservation Baseline)

### 4.1 Subscription Plans (seeded — must remain)

| Plan | price | maxGrounds | maxCourtsPerGround | commissionRate | analyticsRetentionDays | features |
|---|---|---|---|---|---|---|
| Free | 0 | 1 | 2 | 0.10 | 7 | `{analytics:true, crm:false, advanced_reports:false}` |
| Starter | 5000 | 3 | 5 | 0.05 | 30 | `{analytics:true, crm:true, advanced_reports:false}` |
| Professional | 15000 | -1 | -1 | 0.02 | 365 | `{analytics:true, crm:true, advanced_reports:true}` |

### 4.2 Platform Settings (seeded — must remain)

`trial_enabled=true`, `trial_duration_days=14`, `variance_threshold=500`, `retention_grace_days=0`

### 4.3 Pre-existing hand-created data (preserve)

Grounds, courts, bookings, teams, subscriptions created in prior E2E/manual work (e.g., the 005 smoke run: ground `907c414f-…`, court `5b4efe0a-…`, owner `e2eowner.test@example.com`, super_admin `test@test.com`) are **fixtures to assert against**, not to remove. Journeys reference them by their stable IDs/emails where useful.

---

## 5. Test Identity Table (created once, reused across runs)

| Alias | Email | Role | Fixed unique ids/suffixes |
|---|---|---|---|
| PLAYER_A | `e2e.player.a@example.com` | player | ground-scope: none |
| PLAYER_B | `e2e.player.b@example.com` | player | — |
| OWNER | `e2e.owner@example.com` | owner | ground name `E2E Cricket Ground`; court `E2E Court 1` |
| STAFF | `e2e.staff@example.com` | staff (of OWNER ground) | — |
| ADMIN | `e2e.admin@example.com` | admin | — |
| SUPER_ADMIN | `e2e.superadmin@example.com` | super_admin | — |

Every account is created by `POST /api/user/register` + OTP verify (§7.1). Re-running a journey reuses these accounts (login) rather than re-registering.

---

## 6. Request/Response Cycle Validation (applies to ALL steps)

Every API call in every journey MUST be validated against the following contract rules:

### 6.1 Response Envelope Checks

| Kind | Assert |
|---|---|
| Success | `2xx`; JSON body parses; no unexpected keys; `content-type: application/json` |
| Auth failure | `401` + `{ message }` when cookie missing/expired |
| RBAC failure | `403` `FORBIDDEN` (requireAdmin/requirePlan) or `401` (AdminService exact-`super_admin`) |
| Not found | `404` + `{ message }` |
| Conflict | `409` (duplicate team join, duplicate dispute per booking, coupon conflict, booking slot conflict) |
| Validation | `400`/`422` with `errors[]: { field, msg }` where express-validator is wired (auth register/login, subscription upgrade/downgrade, admin confirm-payment, analytics expiring) |
| Rate limit | `429` `RATE_LIMIT_EXCEEDED` (expected only under deliberate load test) |

### 6.2 Response-Shape Gotchas (verified against real controllers)

| Endpoint | Real response shape (frontend depends on it) |
|---|---|
| `GET /api/tournaments/:id/bracket` | **bare `TournamentMatch[]` array** (not wrapped) |
| `GET /api/pricing/preview` | **direct `PricePreview` object** `{basePrice, multiplier, finalPrice, source}` (no wrapper) |
| `GET /api/geo/nearby` | direct `NearbySearchResponse` `{grounds[], pagination, center}` |
| `GET /api/analytics/:groundId/dashboard` | `{snapshots[], revenue{totalRevenue,totalBookings,avgBookingValue}, bookings{total,completed,cancelled}, dataAsOf, retentionDays, retentionNotice}` |
| `GET /api/analytics/:groundId/heatmap` | `{heatmap: DailyAggregation[]}` |
| `GET /api/analytics/:groundId/report` | **CSV download** (not JSON) |
| list endpoints | `{ key: [...] }` wrapper, e.g. `{bookings}`, `{grounds}`, `{teams}`, `{disputes}`, `{notifications}`, `{rules}`, `{coupons}`, `{broadcasts}`, `{plans}`, `{invoices}`, `{unreadCounts}`, `{messages}`, `{categories}`, `{finance}` |

### 6.3 Monetary & Date Formats

- Money: `Decimal(12,2)` PKR. JSON serializes as string or number depending on controller; frontend formats via `formatCurrency`. Assert value equality, not type.
- `Booking.date` is `@db.Date` — the backend compares by **UTC date component**; tests must build date params with `_utcMidnight` semantics (see known bug T053 in AGENTS.md). Use ISO `YYYY-MM-DD` strings in query params.
- Times are strings `"HH:mm"` (e.g., `startTime:"10:00", endTime:"12:00"`).

### 6.4 Auth/RBAC matrix

| Route group | Allowed |
|---|---|
| `/api/user/*` (except profile/update-password) | public |
| `/api/grounds`, `/api/bookings/courts/:id/slots`, `/api/teams` (list), `/api/tournaments` (list/detail/bracket/standings), `/api/leaderboard`, `/api/players/:id/stats`, `/api/finance/payment-methods`, `/api/pricing/preview`, `/api/pricing/coupon/validate`, `/api/geo/nearby`, `/api/health` | public |
| everything else | `authMiddleware` (cookie JWT) |
| `/api/admin/subscriptions/*`, `/api/analytics/platform/*` | `authMiddleware` + `requireAdmin` (roles `admin`/`super_admin` → else 403) |
| `/api/admin/*` (users, grounds, teams, finance, audit-logs, regions, cities, sports, payment-methods) | service-level exact `super_admin` (else 401) |
| `/api/analytics/:groundId/*` | `authMiddleware` + `requirePlan("analytics")` (active/trial sub + feature) |
| `/api/subscriptions/cancel` | `requirePlan()` (active/trial) |

---

## 7. User Journeys

> Notation per row: **Step** | **Actor** | **UI action (page)** | **API request** | **Expected response** | **DB persistence assertion**.

Journeys are ordered so earlier journeys create the data later ones depend on. Each is independently re-runnable (idempotent identities per §5).

---

### J1 — Auth & Onboarding Journey

**User story:** Sign up, verify email, log in, refresh profile, update profile, logout.

| # | Actor | UI action (page) | API request | Expected response | DB persistence |
|---|---|---|---|---|---|
| 1 | anon | `/signup` fill name/email/password/mobile | `POST /api/user/register` `{name,email,password,mobile}` | `201` `{message, user}`; `Set-Cookie: accessToken`; user `isVerified:false` | `users` row exists for email, `authProvider:"local"`, `isVerified:false`, `role:"player"` |
| 2 | PLAYER_A | `/verify-otp` enter 6-digit OTP | `POST /api/user/verify-otp` `{email, otp}` | `200`; `isVerified:true` | `users.isVerified=true`, `otpCode` cleared |
| 3 | PLAYER_A | (re)open `/login` | `POST /api/user/login` `{email,password}` | `200` `{message, user}`; cookies set | session valid; no new row |
| 4 | PLAYER_A | app mounts → `/home` | `GET /api/user/profile` | `200` `{user}` matching login | — |
| 5 | PLAYER_A | `/profile` edit name | `PATCH /api/user/profile` `{name}` | `200` | `users.name` updated |
| 6 | PLAYER_A | `/profile` Sign out | `POST /api/user/logout` | `200`; cookies cleared | — |
| 7 | PLAYER_A | attempt `/bookings` without cookie | `GET /api/bookings/my` (no cookie) | `401` | — |
| 8 | anon | `/login` wrong password | `POST /api/user/login` `{email,"password":"wrong"}` | `401` + message | no session, no password change |
| 9 | anon | `/signup` duplicate email | `POST /api/user/register` (existing email) | `409`/`400` with duplicate-email error | no second row |
| 10 | anon | `/forgot-password` | `POST /api/user/forgot-password` `{email}` | `200` | (email sent; no destructive change) |
| 11 | anon | `/reset-password?token=` valid token | `GET /api/user/reset-password/:token` → `POST /api/user/reset-password/confirm` `{token,password}` | `200` `{userId}` then `200` | `users.password` hash changes |

**Known frontend gap to assert (documented, not fixed here):** `/verify-otp` reads `localStorage.pendingEmail`, which no frontend code writes. E2E must set it before the OTP step: `localStorage.setItem("pendingEmail", email)`. Assert the OTP step otherwise fails gracefully.

---

### J2 — Ground Ownership & Management Journey

**User story:** Owner creates a ground, adds courts + schedules, configures settings, invites staff; admin verifies the ground.

Prereq: OWNER account (J1), SUPER_ADMIN (J1 + role update).

| # | Actor | UI action (page) | API request | Expected response | DB persistence |
|---|---|---|---|---|---|
| 1 | OWNER | `/grounds/create` fill name/address/desc/phone | `POST /api/grounds` `{name,address,description,contactPhone}` | `201` `{ground:{id}}` | `grounds` row `ownerId=OWNER`, `isVerified:false`, `isActive:true`; `ground_access` row `accessRole:"owner"`; default `ground_settings` row |
| 2 | OWNER | `/grounds` list | `GET /api/grounds/my` | `200` `{grounds[]}` includes new ground with `isVerified:false` | — |
| 3 | OWNER | ground detail add court | `POST /api/grounds/:groundId/courts` `{name, sportType, basePrice, pricePerHour}` | `201` `{court}` | `courts` row under groundId |
| 4 | OWNER | add 2nd court | `POST /api/grounds/:groundId/courts` | `201` | count = 2 |
| 5 | OWNER | add weekly schedule | `PUT /api/grounds/:groundId/schedules/:dayOfWeek` `{openTime, closeTime, slotDuration}` | `200` | `ground_schedules` upserted for dayOfWeek |
| 6 | OWNER | update settings | `PATCH /api/grounds/:groundId/settings` `{allowOnlineBooking:true, allowWalkinBooking:true, requireDeposit:true, depositPercentage:50}` | `200` | `ground_settings` updated |
| 7 | OWNER | invite staff | `POST /api/grounds/:groundId/invites` `{name, email, role}` | `201` | `ground_invites` pending row |
| 8 | STAFF | accept invite | (UI or `POST /api/teams/join/:id` analog for ground) — if API absent, assert via `GET /api/grounds/:groundId` access | `200` | `ground_access` row `accessRole:"staff"` |
| 9 | OWNER | attempt to verify own ground | `PATCH /api/admin/grounds/:id/verify` | `401` (super_admin only) | no change |
| 10 | SUPER_ADMIN | `/admin/grounds` find ground → Verify | `PATCH /api/admin/grounds/:id/verify` | `200` | `grounds.isVerified=true`; `audit_logs` row (action=verify, entity=ground) |
| 11 | PUBLIC | `/home` browse | `GET /api/grounds/:id` | `200` `{ground}` with `isVerified:true` | — |
| 12 | SUPER_ADMIN | suspend test (optional) | `PATCH /api/admin/grounds/:id/suspend` | `200` | `isActive:false`; audit log row; revert via verify/suspend toggling preserved |
| 13 | NON-OWNER (PLAYER_B) | attempt update | `PATCH /api/grounds/:id` | `403`/`401` | no change |

**Preservation note:** the ground created here (fixed name `E2E Cricket Ground`) becomes a fixture for J3–J8. Never delete it.

---

### J3 — Booking & Payment Journey

**User story:** Player finds a ground, previews the price, applies a coupon, creates a booking, records payment, follows the state machine.

Prereq: J2 (verified ground + 2 courts). Uses OWNER ground.

| # | Actor | UI action (page) | API request | Expected response | DB persistence |
|---|---|---|---|---|---|
| 1 | PLAYER_A | `/home` → `/grounds/:id` | `GET /api/grounds/:id`, `GET /api/grounds/:id/courts`, `GET /api/grounds/:id/schedules` | `200` each | — |
| 2 | PLAYER_A | booking form pick court/date/start/end | `GET /api/pricing/preview?groundId=&courtId=&date=&startTime=&endTime=` | `200` **direct** `PricePreview {basePrice, multiplier, finalPrice, source}` | no write |
| 3 | PLAYER_A | apply coupon | `POST /api/pricing/coupon/validate` `{code, bookingAmount}` | `200` `{valid, coupon, discount, finalAmount}` | no write |
| 4 | PLAYER_A | check slot availability | `GET /api/bookings/courts/:courtId/slots?date=` | `200` | — |
| 5 | PLAYER_A | Confirm booking | `POST /api/bookings` `{groundId, courtId, date, startTime, endTime}` | `201` `{booking}` status `pending_payment_verification` | `bookings` row; `booking_finance` row `paymentStatus:"unpaid"` |
| 6 | PLAYER_A | double-book same slot | `POST /api/bookings` (same court/date/slot) | `409` `SLOT_CONFLICT` / "already booked" | no second row |
| 7 | STAFF | record payment | `POST /api/bookings/:id/payment` `{amount, method, channel, idempotencyKey}` | `201` (idempotent — repeat with same key returns existing) | `booking_payments` row (append-only, no update); `booking_finance.paymentStatus:"paid"` |
| 8 | STAFF | approve booking | `PATCH /api/bookings/:id/status` `{status:"approved"}` | `200` | `bookings.status:"approved"`; audit log if wired |
| 9 | PLAYER_A | `/bookings` list | `GET /api/bookings/my` | `200` `{bookings[]}` includes booking | — |
| 10 | PLAYER_A | `/bookings/:id` detail | `GET /api/bookings/:id` | `200` `{booking}` with `finance.paymentStatus:"paid"` | — |
| 11 | PLAYER_A | cancel | `PATCH /api/bookings/:id/cancel` | `200` | `bookings.status:"cancelled"`, `cancelledAt` set |
| 12 | STAFF | walk-in booking | `POST /api/grounds/:groundId/walkin` `{courtId, date, startTime, endTime, playerName, playerPhone}` | `201` status `approved`/auto-paid | `bookings` row with `playerName`, no user link |
| 13 | PLAYER_B | non-owner cancel | `PATCH /api/bookings/:id/cancel` on OWNER-owned flow | `403`/`401` | no change |

**Idempotency check (J3 row 7):** re-POST the same `idempotencyKey` → same payment returned, not duplicated. Assert `booking_payments` count for the booking stays at 1.

---

### J4 — Subscriptions & SaaS Analytics Journey

**User story:** Owner upgrades from Free → Starter → Professional, admin confirms payment, analytics retention applies, platform analytics visible.

Prereq: OWNER account with ≥1 verified ground (J2). Seed plans exist (preservation check).

| # | Actor | UI action (page) | API request | Expected response | DB persistence |
|---|---|---|---|---|---|
| 1 | OWNER | `/subscriptions` | `GET /api/subscriptions/plans` | `200` `{plans[]}` — 3 seeded plans | preservation check: 3 rows |
| 2 | OWNER | `/subscriptions` | `GET /api/subscriptions/my` | `200` `MySubscriptionResponse` (trial or free) | subscription row `status:"trial"` or `active` (Free) |
| 3 | OWNER | upgrade to Starter | `POST /api/subscriptions/upgrade` `{planId: <Starter>}` | `201` `{message}` | `ground_owner_subscriptions` status `pending_payment`; `invoices` row status `unpaid`, `dueDate` |
| 4 | ADMIN | admin confirm payment | `POST /api/admin/subscriptions/:id/confirm-payment` | `200` | status `active`; `invoices.status:"paid"`, `paidAt` set; `currentPeriodEnd` +30d |
| 5 | PLAYER_B (non-admin) | confirm payment | `POST /api/admin/subscriptions/:id/confirm-payment` | `403` | no change |
| 6 | OWNER | `/analytics` | `GET /api/analytics/:groundId/dashboard?startDate=&endDate=` | `200` DashboardData; `requirePlan` satisfied (Starter: retention 30d) | — |
| 7 | OWNER | heatmap | `GET /api/analytics/:groundId/heatmap?startDate=&endDate=` | `200` `{heatmap[]}` | — |
| 8 | OWNER | CSV report | `GET /api/analytics/:groundId/report?startDate=&endDate=` | `200` CSV body (content-type text/csv) | — |
| 9 | OWNER | downgrade to Free | `POST /api/subscriptions/downgrade` `{planId:<Free>}` | `200` | status `active` plan=Free immediately; retention clamp to 7d on dashboard (`retentionNotice` present) |
| 10 | OWNER | upgrade back to Professional (or Starter) | `POST /api/subscriptions/upgrade` | `201` | pending_payment → admin confirm → active (365d retention) |
| 11 | OWNER | invoices page | `GET /api/subscriptions/invoices` | `200` `{invoices[]}` includes rows from steps 3/4 | — |
| 12 | OWNER | cancel subscription | `POST /api/subscriptions/cancel` | `200` | status `cancelled`; `cancelledAt` set; plan remains until period end |
| 13 | OWNER | analytics without active/trial | `GET /api/analytics/:groundId/dashboard` | `403` `"Active subscription required"` | — |
| 14 | ADMIN | `/admin/analytics` | `GET /api/analytics/platform/summary` | `200` `PlatformSummary {subscribersPerPlan[], mrr, statusDistribution}` | — |
| 15 | ADMIN | trends | `GET /api/analytics/platform/trends` | `200` `{trends[]}` | — |
| 16 | ADMIN | expiring | `GET /api/analytics/platform/expiring?days=7` | `200` `{subscriptions[]}` | — |
| 17 | PLAYER_A (non-admin) | platform summary | `GET /api/analytics/platform/summary` | `403` | — |

**Preservation note:** J4 step 12 cancels the subscription — that's an app-level transition, rows preserved. Re-runs login as OWNER and see `cancelled`; the journey re-upgrades via step 10 to restore active state.

---

### J5 — Dynamic Pricing & Coupons Journey

**User story:** Owner creates pricing rules + coupons; price preview reflects rules; coupon validates at checkout.

Prereq: J2 ground. 

| # | Actor | UI action (page) | API request | Expected response | DB persistence |
|---|---|---|---|---|---|
| 1 | OWNER | `/pricing` rules tab | `GET /api/pricing/ground/:groundId/rules` | `200` `{rules[], holidays[]}` | — |
| 2 | OWNER | create weekend rule | `POST /api/pricing/rules` `{groundId, name:"Weekend +20%", dayOfWeek:6, startTime:"08:00", endTime:"23:00", multiplier:1.2, priority:0}` | `201` `{rule}` | `pricing_rules` row |
| 3 | PLAYER_A | preview Saturday slot | `GET /api/pricing/preview?...&date=<a Saturday>` | `200` `PricePreview` with `multiplier:1.2`, `source:"rule"` | — |
| 4 | OWNER | create coupon | `POST /api/pricing/coupons` `{groundId, code:"E2E10", discountPercent:10, maxUses:100}` | `201` `{coupon}` | `coupons` row |
| 5 | PLAYER_A | validate coupon | `POST /api/pricing/coupon/validate` `{code:"E2E10", bookingAmount:1200}` | `200` `{valid:true, discount:120, finalAmount:1080}` | no write |
| 6 | PLAYER_A | validate bad coupon | `POST /api/pricing/coupon/validate` `{code:"NOPE", bookingAmount:1200}` | `200` `{valid:false}` or `404` | — |
| 7 | OWNER | list coupons | `GET /api/pricing/ground/:groundId/coupons` | `200` `{coupons[]}` includes `E2E10` with `usedCount:0` | — |
| 8 | OWNER | delete rule | `DELETE /api/pricing/rules/:id` | `200` | `pricing_rules` row soft/inactive or removed — assert `isActive:false` if soft, row absent if hard (match repo impl) |

---

### J6 — Disputes & Resolution Journey

**User story:** Player files a dispute on a booking, admin moderates, penalty applied for no-show.

Prereq: J3 booking (or any completed/approved booking). Uses `DisputeType` enum: `booking_conflict | no_show | damage | other`.

| # | Actor | UI action (page) | API request | Expected response | DB persistence |
|---|---|---|---|---|---|
| 1 | PLAYER_A | `/disputes/new` select booking | `GET /api/bookings/my` | `200` `{bookings[]}` | — |
| 2 | PLAYER_A | file dispute | `POST /api/disputes/file` `{bookingId, type:"booking_conflict", reason:"Double booked", description?, evidence?}` | `201` | `disputes` row `status:"pending"`, `filedById=PLAYER_A` |
| 3 | PLAYER_A | duplicate file (same booking) | `POST /api/disputes/file` (same bookingId) | `409` "already exists" | no second row |
| 4 | PLAYER_A | `/disputes` list | `GET /api/disputes/my` | `200` `{disputes[]}` | — |
| 5 | ADMIN | `/admin/disputes` | `GET /api/disputes/all?status=pending` | `200` `{disputes[]}` (filter works) | — |
| 6 | ADMIN | `/disputes/:id` detail | `GET /api/disputes/:id` | `200` `{dispute}` | — |
| 7 | ADMIN | resolve | `PATCH /api/disputes/:id/resolve` `{resolution:"Refund issued", action:"resolved"}` | `200` | `disputes.status:"resolved"`, `resolution`, `resolvedAt` |
| 8 | ADMIN | no-show penalty dispute | `PATCH /api/disputes/:id/resolve` `{resolution:"No-show penalty", action:"no_show_penalty"}` | `200` | `no_show_penalties` row `amount:500`, `status:"applied"` |

> **Security note (assert the current behavior, flag for fix):** `GET /api/disputes/all` and `PATCH /api/disputes/:id/resolve` have **no role gate** — any authenticated user can list/resolve. J6 rows 5–7 are written for admin, but the spec MUST also assert that a plain player currently *can* hit these (documented gap), or the test should be updated once the gate is added.

---

### J7 — Teams, Matches, ELO & Leaderboard Journey

**User story:** Players create teams, challenge each other, play a match, submit scores, ratings update ELO and leaderboard.

| # | Actor | UI action (page) | API request | Expected response | DB persistence |
|---|---|---|---|---|---|
| 1 | PLAYER_A | `/teams/create` | `GET /api/teams/sports` | `200` `{categories[]}` | — |
| 2 | PLAYER_A | create team | `POST /api/teams` `{name:"E2E Alpha", sport:"Cricket", description}` | `201` `{team:{id}}` | `teams` row `elo:1200`, `captainId=PLAYER_A`; `team_members` captain row |
| 3 | PLAYER_B | create team | `POST /api/teams` `{name:"E2E Beta", sport:"Cricket"}` | `201` | team row |
| 4 | PLAYER_B | join request to Alpha | `POST /api/teams/:alphaId/join-request` | `201` | `join_requests` pending row |
| 5 | PLAYER_A | accept join request | `POST /api/teams/:alphaId/join-requests/:uid/accept` | `200` | member added; request accepted |
| 6 | PLAYER_A | challenge Beta | `POST /api/matches/requests/:betaTeamId` `{...}` | `201` | `match_requests` pending row |
| 7 | PLAYER_B | accept challenge | `PATCH /api/matches/requests/:id/accept` | `200` | `team_matches` row `status:"scheduled"`, `matchRequestId` linked |
| 8 | PLAYER_A | start match | `PATCH /api/matches/:id/start` | `200` | status `in_progress`, `startedAt` |
| 9 | PLAYER_A | submit score | `PATCH /api/matches/:id/score` `{scoreChallenger, scoreOpponent}` | `200` | `scoreSubmittedBy=A`, score stored |
| 10 | PLAYER_B | submit matching score | `PATCH /api/matches/:id/score` (same) | `200` | status `completed`, `completedAt`; ELO recalculated on both teams (winner +, loser −) |
| 11 | PUBLIC | `/leaderboard` | `GET /api/leaderboard` or `GET /api/ratings/leaderboard` | `200` `{teams[]}` sorted by elo desc | — |
| 12 | PLAYER_A | rate match | `POST /api/matches/:id/rating` `{skillRating, sportsmanshipRating, punctualityRating, reviewText}` | `201` | `match_ratings` row |
| 13 | PLAYER_B | duplicate rating | `POST /api/matches/:id/rating` | `409` | no second row |
| 14 | PLAYER_A | record player stats | `POST /api/matches/:id/player-stats` `{...}` | `201` | `player_stats`/`player_match_stats` rows |
| 15 | PLAYER_A | leave team (optional cleanup via app) | `DELETE /api/teams/:id/members/me` | `200` | membership row removed; team preserved |

---

### J8 — Tournaments Journey

**User story:** Owner creates a tournament, teams register, bracket generates, results advance, standings show.

| # | Actor | UI action (page) | API request | Expected response | DB persistence |
|---|---|---|---|---|---|
| 1 | OWNER | `/tournaments/create` | `POST /api/tournaments` `{name:"E2E Cup", sport:"Cricket", format:"knockout", maxTeams:4, description}` | `201` `{tournament:{id}}` | `tournaments` row `status:"registration_open"` (or upcoming), `ownerId=OWNER` |
| 2 | PUBLIC | `/tournaments` | `GET /api/tournaments` | `200` `{tournaments[]}` | — |
| 3 | PLAYER_A | register team | `POST /api/tournaments/:id/register` `{teamId}` | `201` | `tournament_teams` row |
| 4 | PLAYER_B | register team | `POST /api/tournaments/:id/register` `{teamId}` | `201` | row |
| 5 | OWNER | generate bracket | `POST /api/tournaments/:id/generate-bracket` | `200` | `tournament_matches` rows (rounds) |
| 6 | PUBLIC | `/tournaments/:id/bracket` | `GET /api/tournaments/:id/bracket` | `200` **bare `TournamentMatch[]`** | — |
| 7 | OWNER | enter match result | `POST /api/tournaments/:id/matches/:matchId/result` `{score1, score2, winnerId}` | `200` | match `winnerId`, status `completed`; next-round auto-advance |
| 8 | PUBLIC | standings | `GET /api/tournaments/:id/standings` | `200` | `tournament_teams` points updated |
| 9 | PLAYER_A | duplicate register | `POST /api/tournaments/:id/register` (same team) | `409` | no duplicate row |

---

### J9 — Finance, Cash Sessions & Reports Journey

**User story:** Staff opens a cash session, records payments, closes with variance; owner sees finance summary + reports.

Prereq: J2/J3 ground + payment methods.

| # | Actor | UI action (page) | API request | Expected response | DB persistence |
|---|---|---|---|---|---|
| 1 | PUBLIC | payment methods | `GET /api/finance/payment-methods` | `200` `{paymentMethods[]}` (active only) | — |
| 2 | STAFF | open session | `POST /api/finance/grounds/:groundId/cash-session/open` `{openingCash:1000}` | `201` | `cash_sessions` row `status:"open"`, one open per ground enforced (2nd open → error) |
| 3 | STAFF | second open (conflict) | `POST .../cash-session/open` | `4xx` "already open" | still one open row |
| 4 | STAFF | close session | `POST /api/finance/grounds/:groundId/cash-session/:sessionId/close` `{closingCash:1500}` | `200` `{variance}` | `expectedCash` = opening + cash payments; `variance = closingCash - expectedCash`; status `closed` |
| 5 | OWNER | finance summary | `GET /api/finance/grounds/:groundId/finance` | `200` | aggregate matches booking_payments |
| 6 | OWNER | reports | `GET /api/finance/grounds/:groundId/reports?startDate=&endDate=` | `200` | — |
| 7 | PLAYER_A | cash sessions (no access) | `GET /api/finance/grounds/:groundId/cash-sessions` | `403`/`401` | — |
| 8 | OWNER | toggle payment method | `PATCH /api/finance/grounds/:id/payment-methods/:methodId` | `200` | `ground_payment_methods.isActive` toggled; revert after to preserve state |

---

### J10 — Chat & Notifications Journey (Socket.IO + REST)

**User story:** Team/ground members exchange messages in real time; notifications surface events and can be marked read.

Prereq: J2 (ground) + ground access for the chat participant (chat is ground-scoped: `/api/chat/:groundId/...`).

| # | Actor | UI action (page) | API request / socket event | Expected response | DB persistence |
|---|---|---|---|---|---|
| 1 | STAFF | `/chat` | `GET /api/chat/unread` | `200` `{unreadCounts[]}` | — |
| 2 | STAFF | socket connect `/chat` | `io(API+"/chat", {auth:{token}})` → emit `joinGround(groundId)` | joined room; no error | — |
| 3 | STAFF | `/chat/:groundId` history | `GET /api/chat/:id/messages` | `200` `{messages[]}` cursor-paginated | — |
| 4 | STAFF | send message (socket) | emit `sendMessage({groundId, content})` | server emits `newMessage` to room | `chat_messages` row |
| 5 | PLAYER_A | mark read | `POST /api/chat/:id/read` | `200` | `unread_count` reset |
| 6 | PLAYER_A | notifications | `GET /api/notifications` | `200` `{notifications[]}` | — |
| 7 | PLAYER_A | unread count | `GET /api/notifications/unread-count` | `200` `{count}` | — |
| 8 | PLAYER_A | mark one read | `PATCH /api/notifications/:id/read` | `200` | `notifications.readAt` set |
| 9 | PLAYER_A | mark all read | `PATCH /api/notifications/read-all` | `200` | all unread → readAt set |
| 10 | PLAYER_A | delete notification | `DELETE /api/notifications/:id` | `200` | `deletedAt` set (soft delete — row preserved) |
| 11 | STAFF | invalid message (>2000 chars) | emit `sendMessage` long content | server error / `400` | no row |

---

### J11 — Geolocation & Discovery Journey

**User story:** Player finds grounds near their location via map + list.

| # | Actor | UI action (page) | API request | Expected response | DB persistence |
|---|---|---|---|---|---|
| 1 | anon | `/home` featured | `GET /api/grounds/featured` | `200` `{grounds[]}` (verified only) | — |
| 2 | PLAYER_A | click 📍 Near Me | `GET /api/geo/nearby?latitude=24.86&longitude=67.00&radius=10` | `200` `NearbySearchResponse {grounds[] (with distance_km), pagination, center}` | — |
| 3 | PLAYER_A | map renders markers | (Leaflet map, dynamic import `ssr:false`) | markers = grounds.length | — |
| 4 | PLAYER_A | radius filter | `GET /api/geo/nearby?...&radius=1` | `200`; results within ~1km of center | — |
| 5 | anon | sport filter | `GET /api/geo/nearby?...&sport=Cricket` | `200`; only cricket grounds | — |

---

## 8. Execution Order & CI

Run journeys in dependency order. Each journey's fixtures come from earlier ones (J2 ground feeds J3–J9; J4 builds on J2).

```
Run 1:  Preservation baseline check (§2.5) + J1 auth/onboarding
Run 2:  J2 ground ownership + management (creates the shared E2E ground)
Run 3:  J3 booking & payment → J5 pricing & coupons (uses ground + preview)
Run 4:  J4 subscriptions & SaaS analytics (own subscription; admin confirm)
Run 5:  J6 disputes → J9 finance & cash (booking/payment fixtures)
Run 6:  J7 teams & matches → J8 tournaments (player teams, ELO)
Run 7:  J10 chat & notifications → J11 geolocation (final read-mostly)
```

### 8.1 CI Gating (same constraints apply)

- Run backend `vitest` (293) first — they are the fast guardrail.
- Run E2E journeys only against a **dedicated staging/dev DB**, never CI ephemeral-reset databases, because the spec forbids wiping. If the CI DB is disposable-by-design, that is an *exception* documented in the pipeline config — but the constraint is the default.
- Frontend `npm run lint`, `npm run build` must be green before E2E starts (they are preconditions, not E2E steps).
- Report format: per-journey pass/fail with (a) HTTP status, (b) response-shape check (§6), (c) DB persistence assertion, (d) preservation-baseline re-check at journey end.

---

## 9. Traceability Matrix

| Journey | Vision req (docs/vision/vision-backend/requirement.md) | Frontend pages | Backend module(s) | Spec FRs |
|---|---|---|---|---|
| J1 Auth | §2.1 Auth | `/signup /verify-otp /login /profile /forgot-password /reset-password` | auth | 003 FR-auth |
| J2 Ground | §2.2 Ground | `/grounds/create /grounds /grounds/[id]` + `/admin/grounds` | ground, admin | 003 FR-ground |
| J3 Booking | §2.3 Booking | `/bookings /bookings/[id] /grounds/[id] /ops` | booking, finance, pricing | 003 FR-booking |
| J4 Subscriptions | §2.1 + 005 spec US1–US5 | `/subscriptions /subscriptions/my /subscriptions/billing /analytics /admin/analytics` | subscription, analytics | 003 FR-001..005, 005 FR-001.. |
| J5 Pricing | §2.4 Dynamic pricing | `/pricing /grounds/[id]` | pricing | 003 FR-020.. |
| J6 Disputes | §2.5 Disputes | `/disputes /disputes/new /disputes/[id] /admin/disputes` | dispute | 003 FR-018..020 |
| J7 Teams/Matches | §2.4/§2.5 Teams/Matchmaking, §2.10 Ratings | `/teams /teams/create /teams/[id] /matches /matches/[id] /leaderboard` | team, match, rating | 003 FR-teams/matches |
| J8 Tournaments | §2.6 Tournaments | `/tournaments /tournaments/create /tournaments/[id]` | tournament | 003 FR-tournaments |
| J9 Finance | §2.7 Finance | `/finance` | finance | 003 FR-finance |
| J10 Chat/Notif | §2.8/§2.9 | `/chat /chat/[id] /notifications` | chat, notification | 003 FR-chat/notif |
| J11 Geo | §2.6 US6 (003) | `/home` + NearMeMap | geo, ground | 003 FR-geo |

---

## 10. Known Gaps & Quirks the E2E Must Handle (documented from code audit)

1. **`pendingEmail` localStorage gap** — `/verify-otp` reads `localStorage.pendingEmail` but nothing writes it. E2E must set it before OTP (J1 step 2). Assert graceful failure if missing.
2. **Response-shape inconsistency** — bracket returns bare array; `PricePreview` and `NearbySearchResponse` return direct objects; most lists use `{key:[]}`. The contract table in §6.2 is the source of truth for assertions.
3. **`/matches/[id]` is actually a teamId** — index links `/matches/{team.id}`, detail calls `/api/matches/detail/{id}`. J7 uses explicit team IDs.
4. **Admin enforcement inconsistent** — `requireAdmin` (roles admin/super_admin) only on platform analytics + admin subscription routes; `/api/admin/*` service requires exact `super_admin`; `/api/disputes/all` + resolve have no gate. J6 asserts current behavior; flag as security debt.
5. **Upload shadowing** — `POST /api/upload/:type` shadows `/avatar` and `/tournament-poster` handlers; avatar upload does not update `users.avatar`. Do not assert avatar persistence.
6. **`/api/finance/admin/finance`** checks `userId === "admin-placeholder"` → always 401 for real JWTs. Assert 401; use `/api/admin/finance` for platform finance instead.
7. **Rate limit 500/15min** — throttle; never bypass.
8. **Booking.date UTC semantics** — build `date` params as `YYYY-MM-DD` UTC (T053 fix in AGENTS.md); avoid local-midnight off-by-one.
9. **Chat is ground-scoped** (rooms `ground:<groundId>`), not team-scoped, in the current code — J10 uses groundId.

---

## 11. Deliverables

- [ ] `docs/specs/006-e2e-user-journey-tests/plan.md` — execution plan, milestones, effort
- [ ] `docs/specs/006-e2e-user-journey-tests/spec.md` — this document
- [ ] `docs/specs/006-e2e-user-journey-tests/tasks.md` — checklist of journey-by-journey implementation tasks
- [ ] E2E runner (Playwright + cookie-jar client) scaffolded in `playarena-frontend` or a `tests/e2e/` workspace
- [ ] Preservation-check utility (row-count baseline for seed tables)
