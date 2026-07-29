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

### 2026-07-29 — Teams Module Implementation
- Extended Prisma schema with 6 new models: SportCategory, Team, TeamMember, TeamInvite, JoinRequest, TeamRatingHistory
- Added TeamRole enum (captain, co_captain, player) and JoinRequestStatus enum (pending, accepted, rejected)
- Added team relations to User model (ownedTeams, teamMemberships, teamInvites, sentInvites, joinRequests)
- Ran migration `add-teams-module` — database in sync
- Created `src/repository/team.repo.js` — full CRUD for all 6 team entities
- Created `src/modules/team/team.service.js` — RBAC (captain/co-captain/player), invites, join requests, transfer captaincy
- Created `src/modules/team/team.controller.js` — 20 endpoint handlers
- Created `src/modules/team/team.route.js` — 21 routes under `/api/teams`
- Registered `/api/teams` in app.js
- Created `tests/team.test.js` — 27 tests, all passing
- Team endpoints: create, list, my-teams, detail, update, delete, members (get/update/remove), leave, transfer-captaincy, invite (send/accept/reject), join-request (create/list/accept/reject), stats, rating-history, sport-categories

### 2026-07-29 — Matchmaking Module Implementation
- Extended Prisma schema with MatchRequest and TeamMatch models
- Added MatchRequestStatus enum (pending, accepted, rejected, cancelled, expired) and MatchStatus enum (scheduled, in_progress, completed, cancelled, score_pending)
- Added match relations to Team model
- Ran migration `add-matchmaking-module` — database in sync
- Created `src/repository/match.repo.js` — CRUD for requests and matches with team ELO queries
- Created `src/modules/match/match.service.js` — challenge flow (create/accept/reject/cancel), dual-confirmation scoring (both teams match → complete, mismatch → staff mediation), match lifecycle (start/cancel), ELO calculation (K-factor 32/24, baseline 1200, floor 100)
- Created `src/modules/match/match.controller.js` — 11 endpoint handlers
- Created `src/modules/match/match.route.js` — 11 routes under `/api/matches`
- Registered `/api/matches` in app.js
- Created `tests/match.test.js` — 15 tests, all passing
- Match endpoints: create challenge, sent/received challenges, accept/reject/cancel challenge, list matches, match detail, submit score (dual-confirmation), start match, cancel match

### 2026-07-29 — Tournaments Module Implementation
- Extended Prisma schema with Tournament, TournamentTeam, TournamentMatch models + enums (TournamentFormat, TournamentStatus, TournamentMatchStatus)
- Added TournamentFormat enum: knockout, round_robin, group_knockout
- Added TournamentStatus enum: upcoming, registration_open, registration_closed, ongoing, completed, cancelled
- Added TournamentMatchStatus enum: scheduled, in_progress, completed, cancelled
- Ran migration `add-tournament-module` — database in sync
- Created `src/repository/tournament.repo.js` — CRUD for tournament, teams, matches
- Created `src/modules/tournament/tournament.service.js`:
  - Bracket generation: knockout (single elimination with seeding + byes), round_robin (all vs all), group_knockout (round robin per group)
  - Knockout advancement: winners auto-advance to next round
  - Standings tracking: points (win=3, draw=1), played/won/lost/drawn/goals
  - Registration flow with capacity check, duplicate prevention, tournament owner exemption
  - Ownership checks on all mutation endpoints
- Created `src/modules/tournament/tournament.controller.js` — 12 endpoint handlers
- Created `src/modules/tournament/tournament.route.js` — 12 routes under `/api/tournaments`
- Registered `/api/tournaments` in app.js
- Created `tests/tournament.test.js` — 29 tests, all passing
- Tournament endpoints: create, list, my, detail, update, delete, register team, withdraw team, bracket, standings, enter match result, generate bracket

### 2026-07-29 — Finance Module Implementation
- Extended Prisma schema with PaymentMethod, GroundPaymentMethod, RegionPaymentMethod, CashSession, CashSessionPayment models
- Added CashSessionStatus enum (open, closed)
- Added opposite relations to Ground, Region, User, BookingPayment
- Ran migration `add-finance-module` — database in sync
- Created `src/repository/finance.repo.js` — payment methods, cash sessions, aggregates
- Created `src/modules/finance/finance.service.js`:
  - Payment methods: list active, ground-level enabled/disabled, toggle (owner-only)
  - Cash sessions: open (one per ground enforced), close with variance calc
  - Ground finance: booking + payment aggregates, date-filtered reports
  - RBAC: owner/manager for reports, staff+ for cash sessions
- Created `src/modules/finance/finance.controller.js` — 9 endpoint handlers
- Created `src/modules/finance/finance.route.js` — 9 routes under `/api/finance`
- Registered `/api/finance` in app.js
- Created `tests/finance.test.js` — 14 tests, all passing
- Note: POST /api/bookings/:id/payment + GET /api/bookings/:id/finance already exist in booking module
- Finance endpoints: list payment methods, ground payment methods, toggle method, ground finance, reports, open/close cash session, list sessions

### 2026-07-29 — Chat Module Implementation
- Extended Prisma schema with ChatMessage, ChatParticipant, UnreadCount models
- Added chat relations to User model (chatMessages, chatParticipants, unreadCounts)
- Ran migration `add-chat-module` — database in sync
- Installed socket.io dependency
- Created `src/repository/chat.repo.js` — messages (cursor pagination), participants, unread counts with upsert/increment logic
- Created `src/modules/chat/chat.service.js` — ground-scoped access control, message validation (1-2000 chars), participant tracking, mark-as-read, cursor-based pagination
- Created `src/modules/chat/chat.controller.js` — 4 endpoint handlers
- Created `src/modules/chat/chat.route.js` — 4 routes under `/api/chat`
- Created `src/socket/socket.js` — Socket.IO /chat namespace with JWT auth handshake, ground rooms (ground:{groundId}), sendMessage/newMessage/typing events, access check on join
- Updated `src/app.js` — use createServer(http) wrapper for Socket.IO, register /api/chat routes, call setupSocket
- Updated `server.js` — use returned httpServer directly
- Created `tests/chat.test.js` — 9 tests covering getMessages (access, pagination), sendMessage (content validation, access), markAsRead, getUnreadCounts
- Updated `tests/setup.js` — added mock methods for chatMessage, chatParticipant, unreadCount
- Updated Postman collection with 4 chat endpoints

### 2026-07-29 — Notifications Module Implementation
- Extended Prisma schema with Notification model (id, userId, type, title, message, data, readAt, deletedAt)
- Added notifications relation to User model
- Ran migration `add-notifications-module` — database in sync
- Created `src/repository/notification.repo.js` — paginated list, unread count, markAsRead/markAllAsRead, soft delete, create
- Created `src/modules/notification/notification.service.js` — 5 REST operations + createNotification with socket emit
- Created `src/modules/notification/notification.controller.js` — 5 endpoint handlers
- Created `src/modules/notification/notification.route.js` — 5 routes under `/api/notifications`
- Updated `src/socket/socket.js` — added /notifications namespace with auto-join user rooms, exported getNotificationNamespace for service use
- Updated `src/app.js` — registered /api/notifications routes
- Created `tests/notification.test.js` — 9 tests (get paginated, clamp params, unread count, markAsRead found/not-found, markAllAsRead, soft delete, create)
- Updated `tests/setup.js` — added notification mock + socket module mock
- Updated Postman collection with 5 notification endpoints

### 2026-07-29 — Ratings Module Implementation
- Extended Prisma schema with MatchRating, PlayerStat, PlayerMatchStat models
- Added rating relations to User (matchRatings, playerStats, playerMatchStats) and TeamMatch (ratings, playerStats)
- Ran migration `add-ratings-module` — database in sync
- Created `src/repository/rating.repo.js` — match ratings, team queries for leaderboard, player stats upsert, player match stats, team member checks
- Created `src/modules/rating/rating.service.js`:
  - submitRating: captain-only, completed matches only, ratings 1-5, duplicate prevention
  - getLeaderboard: global or sport-filtered teams sorted by ELO
  - getPlayerStats: aggregate stats with zero defaults
  - recordPlayerStats: captain-only, per-match stats with auto-upsert of player aggregates
- Created `src/modules/rating/rating.controller.js` — 4 endpoint handlers
- Created `src/modules/rating/rating.route.js` — 5 routes under `/api/` (leaderboard, player-stats, match-rating, match-player-stats)
- Updated `src/app.js` — registered /api rating routes
- Created `tests/rating.test.js` — 12 tests (submitRating valid/not-found/not-completed/not-captain/duplicate/out-of-range, leaderboard global/sport-filtered, playerStats found/empty, recordPlayerStats valid/not-captain)
- Updated `tests/setup.js` — added matchRating, playerStat, playerMatchStat mocks
- Updated Postman collection with 5 rating endpoints

### 2026-07-29 — Admin Module Implementation
- Extended Prisma schema with AuditLog, AppLog models — append-only audit trail
- Ran migration `add-admin-module` — database in sync
- Created `src/repository/admin.repo.js` — paginated users/grounds/teams queries, platform finance aggregates, audit logs, CRUD for reference data
- Created `src/modules/admin/admin.service.js` — super_admin RBAC via `_requireSuperAdmin`, ground verify/suspend with audit logging, finance summary, reference data management (regions/cities/sports/payment-methods)
- Created `src/modules/admin/admin.controller.js` — 12 endpoint handlers (GET users, GET user/:id, GET grounds, PATCH verify/suspend, GET teams, GET finance, GET audit-logs, GET/POST regions/cities/sports/payment-methods)
- Created `src/modules/admin/admin.route.js` — 20+ routes under `/api/admin` with authMiddleware
- Updated `src/app.js` — registered /api/admin routes
- Created `tests/admin.test.js` — 9 tests (getUsers super_admin/player, getUserDetail, getGrounds, verifyGround, suspendGround, getTeams, getFinance, getAuditLogs)
- Updated `tests/setup.js` — added auditLog, city, sportCategory, paymentMethod mocks; added count to user/ground/team, findUnique to paymentMethod
- Updated Postman collection with all 12 admin endpoint groups

### 2026-07-29 — Upload Module Implementation
- Installed `@aws-sdk/client-s3`, `@aws-sdk/lib-storage`, `multer`
- Created `src/config/upload/s3.js` — S3Client singleton (reads from env)
- Created `src/repository/upload.repo.js` — PutObjectCommand (upload) and DeleteObjectCommand (delete) to S3
- Created `src/modules/upload/upload.service.js` — 6 upload types (avatar, booking-proof, ground-image, team-logo, tournament-poster, general) each with MIME whitelist and size limits (5MB images, 10MB PDF). Ground-scoped uploads for ground-image and booking-proof with RBAC check
- Created `src/modules/upload/upload.controller.js` — 3 handlers (generic upload, ground-scoped upload, avatar upload with auto-update user.avatar)
- Created `src/modules/upload/upload.route.js` — 5 routes with multer memoryStorage, 10MB limit, authMiddleware
- Updated `src/app.js` — registered /api/upload
- Created `tests/upload.test.js` — 6 tests (valid upload, no file, invalid mime, too large, pdf in booking-proof, pdf rejected in avatar)
- Updated Postman collection with upload endpoints

### 2026-07-29 — Updated Anchored Summary
- Bumped total: 8/14 modules done, 150+ tests, 49+ Prisma models