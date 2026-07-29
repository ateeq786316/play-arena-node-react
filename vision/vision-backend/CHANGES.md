# PlayArena Backend — Change Log

> Log every change here BEFORE and AFTER implementation.

---

## Template: Date | Change Description | Files Affected | Reason

---

## Change Log

| Date | Change | Files | Reason |
|------|--------|-------|--------|
| 2026-07-28 | Created vision-backend docs | RULES.md, PLAN.md, CHANGES.md, STEPS.md, TESTING.md, COMMANDS.md | Establish documentation discipline for backend development |
| 2026-07-28 | Switched DB: MongoDB → PostgreSQL (Prisma) | package.json, .env.example, .env, src/config/env.js, src/database/db.js, src/models/auth.model.js, src/repository/auth.repo.js, src/modules/auth/auth.service.js, src/modules/auth/auth.controller.js, src/constant/app.constant.js | Migrate from Mongoose to Prisma ORM for PostgreSQL |
| 2026-07-28 | Auth module completion (OTP, refresh, profile, forgot/reset password) | prisma/schema.prisma, src/config/nodemailer.js, src/utils/emailTemplates.js, src/middlewares/auth.middleware.js, src/modules/auth/auth.route.js, src/modules/auth/auth.controller.js, src/modules/auth/auth.service.js, src/repository/auth.repo.js, server.js, src/constant/app.constant.js, vision/postman-collection.json | Add OTP verification, JWT refresh, user profile, password reset flow |
| 2026-07-28 | Security fix: update-password uses JWT, refresh reads cookie | src/modules/auth/auth.route.js, src/modules/auth/auth.controller.js, src/modules/auth/auth.service.js | Prevent userId tampering, auto-detect refresh token from cookie |

---

## Detailed Entries

### 2026-07-28 — Initial Documentation Setup
- Created `vision/vision-backend/` folder with 6 tracking `.md` files
- These files will be updated throughout development

### 2026-07-28 — DB Migration: MongoDB → PostgreSQL (Prisma)
- Removed `mongoose` from dependencies
- Added `@prisma/client` and `prisma` (devDep)
- Created `prisma/schema.prisma` with User model (UUID, name, email, password, authProvider, mobile, etc.)
- Created `src/database/prisma.js` — Prisma client singleton
- Updated `src/database/db.js` — connect/disconnect Prisma
- Updated `src/config/env.js` — MONGO_URL → DATABASE_URL, added new env vars
- Refactored `src/repository/auth.repo.js` — Mongoose → Prisma queries
- Refactored `src/modules/auth/auth.service.js` — removed Mongoose-specific patterns
- Removed `src/models/auth.model.js` (schema lives in Prisma now)
- Updated `.env.example` and `.env` with PostgreSQL DATABASE_URL
- Ran `prisma migrate dev` to create initial migration

### 2026-07-28 — Auth Module Completion
- Added OTP fields to User model (otpCode, otpExpiry, isVerified)
- Created `src/config/nodemailer.js` — SMTP email transport
- Created `src/utils/emailTemplates.js` — HTML templates for OTP and password reset
- Created `src/middlewares/auth.middleware.js` — JWT auth middleware for protected routes
- Added endpoints: POST /verify-otp, POST /resend-otp, POST /refresh, POST /logout, GET /profile, PATCH /profile
- Fixed Google OAuth nested route bug
- Updated cookie maxAge for refreshToken to 7 days
- Added error handlers in server.js for better debugging
- Created `vision/postman-collection.json` with all auth API tests

### 2026-07-28 — Auth Security Fixes
- Changed `/update-password` from URL param to JWT-based auth (prevents userId tampering)
- Changed `/refresh` to read refreshToken from cookie first, fall back to body

### 2026-07-29 — Ground Module Implementation
- Extended Prisma schema with 8 new models: Region, City, Ground, Court, GroundSchedule, GroundSetting, GroundImage, GroundAccess, GroundInvite
- Added AccessRole enum (owner, manager, staff) and InviteStatus enum (pending, accepted, rejected, expired)
- Added `role` field to User model (default "player")
- Ran migration `add-ground-module` — database in sync
- Created `src/repository/ground.repo.js` — full CRUD for all ground entities
- Created `src/modules/ground/ground.service.js` — business logic with RBAC checks
- Created `src/modules/ground/ground.controller.js` — 18 endpoints
- Created `src/modules/ground/ground.route.js` — all routes registered with authMiddleware
- Registered `/api/grounds` routes in app.js
- Ground endpoints: create, read, update, delete, list (public), featured, my-grounds (auth)
- Court endpoints: CRUD per ground with manager-level access
- Schedule endpoints: upsert, list, delete per dayOfWeek
- Setting endpoints: upsert per ground (owner-only)
- Region/City endpoints: list regions with nested cities
- Image endpoints: add/remove ground images
- Invite endpoints: invite staff (owner-only)
### 2026-07-29 — Created requirement.md Master Spec
- Created `vision/vision-backend/requirement.md` — comprehensive single-source-of-truth for all 14 backend modules
- Captured all endpoints (done + not started), business rules, DB models, screen mappings
- Mapped full implementation order (Phase 2→13)
- Verified current status: 2/14 modules done (Auth ✅, Ground ✅), ~30/120+ endpoints implemented
- Updated from vision/project-scope.md, over-all-observation.md, screens-spec.md
- Added module-by-module endpoint tables, state machines, RBAC rules, Pakistan-specific context

### 2026-07-29 — Booking Module Implementation
- Extended Prisma schema with Booking, BookingFinance, BookingPayment models
- Added BookingStatus enum (6 states) and PaymentStatus enum (4 states)
- Added booking relations to User, Ground, Court models
- Ran migration `add-booking-module` — database in sync
- Created `src/repository/booking.repo.js` — full CRUD with conflict detection, finance/payment queries, idempotency key lookup
- Created `src/modules/booking/booking.service.js` — 6-status state machine, deposit calculation, slot conflict detection with serialized transactions, walk-in booking (auto-approved), payment recording with aggregate channel tracking, slot availability grid generation
- Created `src/modules/booking/booking.controller.js` — 10 endpoint handlers
- Created `src/modules/booking/booking.route.js` — booking routes under `/api/bookings`
- Registered walk-in + ground bookings under `/api/grounds/:groundId/` in app.js
- Booking endpoints: create, my-bookings, detail, cancel, walkin, ground-bookings, status-update, record-payment, finance-detail, slots-availability