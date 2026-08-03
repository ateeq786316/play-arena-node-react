# PlayArena — Comprehensive Project Specification

> Generated: 2026-07-24
> Source: Workspace-wide file-by-file observation (221+ files)
> Format: Discrete single-point items. Every requirement, rule, workflow, and constraint is an independent actionable point.

---

## 1. Executive Summary & Project Vision

### 1.1 Primary Purpose and Scope
- PlayArena is a full-stack sports community platform targeting the Pakistan market.
- The platform enables ground booking, team management, matchmaking, tournament organization, and player rating/leaderboards.
- The platform operates as a multi-tenant SaaS where each ground is a tenant boundary.
- Every operational record is scoped to a ground_id (tenant boundary).
- All monetary transactions are recorded in PKR (Pakistan Rupee).
- All timestamps are stored in UTC and displayed in Asia/Karachi timezone.
- The platform does NOT process payments in-app — it only records payment proof and tracks financial ledgers.
- The platform is deployed as a web application (Next.js 15) with a separate NestJS backend.
- There is no mobile app — only the web frontend exists.
- Ground owners monetize via tiered subscription plans (Free/Starter/Professional/Enterprise) with recurring monthly or yearly billing.
- Platform revenue comes from subscription fees AND per-booking commission (percentage varies by subscription tier).
- The platform provides business intelligence analytics, dynamic pricing engine, automated CRM communications, geolocation search, and dispute resolution for ground owners.
- Push notifications via FCM are planned but NOT yet implemented.

### 1.2 Target User Personas
- **Player**: End-user who books grounds, joins teams, participates in matches and tournaments.
- **Ground Owner**: User who registers sports grounds, manages courts, schedules, staff, and pricing.
- **Ground Manager**: User delegated by owner to oversee ground operations and staff.
- **Ground Staff**: Front-desk/operations user who handles walk-in bookings, cash sessions, and payment recording.
- **Super Admin**: Platform-level administrator with global user, ground, and finance oversight.

### 1.3 Core Business Goals
- Provide a centralized discovery and booking system for sports grounds across Pakistani cities.
- Enable team formation, match challenge workflows, and skill-based matchmaking via ELO ratings.
- Support tournament creation with automated bracket generation.
- Provide ground owners with staff management, cash tracking, and financial reporting tools.
- Maintain an append-only audit trail for all sensitive financial and administrative actions.
- Ensure double-booking prevention through database-level exclusion constraints and row-level locking.
- Enforce ground-scoped role-based access control (RBAC) separate from user-level roles.

### 1.4 Success Metrics
- 13+ Pakistani cities supported with active ground listings.
- 7+ sport categories available for booking and competition.
- ELO rating system with 1200 baseline for all new teams.
- Peer review system with 1-5 scoring for skill, sportsmanship, and punctuality.
- Booking state machine with 6 statuses and no illegal transitions.
- Idempotent payment recording to prevent duplicate entries.
- Cash session variance tracking with automated overage/shortage detection.

---

## 2. Technical Stack & Architecture Standards

### 2.1 Backend Framework and Runtime
- Backend framework is NestJS 11 (Node.js 22 runtime on Alpine Linux).
- TypeScript 5.7 is the programming language for the entire backend.
- The backend follows modular architecture with 16 feature modules.
- NestJS CLI is configured with deleteOutDir: true and @nestjs/swagger plugin.
- The backend exposes a RESTful API at /api/v1 base path.
- OpenAPI 3.0 specification is auto-generated via @nestjs/swagger at /api/docs.

### 2.2 Database Technologies and ORM
- Primary database is PostgreSQL 16 running on Alpine Linux.
- ORM is Prisma 7 with @prisma/adapter-pg for PostgreSQL connectivity.
- Prisma client is generated to backend/generated/prisma (outside node_modules).
- Prisma schema uses snake_case table names via @@map on every model.
- All primary keys use UUIDv4 with gen_random_uuid() default.
- Prisma config uses the new defineConfig API from Prisma 7.
- Redis 7 Alpine is used for Bull queue backend and caching.
- Redis cache TTL is 300 seconds (5 minutes) by default.

### 2.3 Real-Time Communication
- WebSocket communication uses Socket.IO (server: @nestjs/platform-socket.io).
- Two Socket.IO namespaces exist: /chat and /notifications.
- Chat namespace supports ground-scoped rooms (users join ground:{groundId}).
- Notification namespace supports user-scoped rooms (users join user:{userId}).
- Client-side uses socket.io-client for WebSocket connections.
- JWT authentication is required on WebSocket handshake (auth.token or query param).

### 2.4 Security Baselines and Authentication
- Authentication uses stateless JWT with 7-day access token expiry and 30-day refresh token expiry.
- Passwords are hashed using PBKDF2 with SHA-512, 1,000 iterations, 64-byte key, 16-byte random salt.
- Password hash format is salt:hex_hash (both hex-encoded).
- JWT secret must be at least 32 characters (256-bit key minimum).
- Access tokens are stored in httpOnly cookies named access_token with SameSite=Lax.
- Global JwtAuthGuard requires authentication on ALL routes unless marked @Public().
- Role-based access control operates at two levels: user-level role (player/super_admin) and ground-level role (owner/manager/staff via GroundAccess table).
- Rate limiting is applied globally at 100 requests per minute per IP.
- Helmet security headers are applied to all HTTP responses.
- CORS origin defaults to * in development.
- Correlation IDs are propagated via x-correlation-id header across request/response.

### 2.5 Background Processing
- Bull queue (backed by Redis) is used for background job processing.
- Three Bull queues exist: notification-delivery, booking-expiry, and match-reminder.
- Seven cron workers run via @nestjs/schedule @Cron decorator within the NestJS process.
- Workers include: BookingExpiryWorker, BookingCompletionWorker, CashSessionAutoCloseWorker, ChatCleanupWorker, MatchReminderWorker, NotificationCleanupWorker, RatingDecayWorker.
- Booking expiry worker runs every 5 minutes to expire pending bookings.
- Rating decay worker runs weekly on Sunday at 2:00 AM.

### 2.6 Event-Driven Architecture
- In-process event emitter (@nestjs/event-emitter) is used for synchronous event propagation.
- Five event modules exist: booking, match, team, notification, and payment.
- Total 13 event classes span the core domain workflows.
- Events carry only IDs and minimal context, not full data objects.
- Booking events: BookingCreatedEvent, BookingApprovedEvent, BookingRejectedEvent, BookingCancelledEvent.
- Match events: MatchRequestedEvent, MatchRequestAcceptedEvent, MatchCompletedEvent, RatingSubmittedEvent.
- Team events: TeamCreatedEvent, TeamMemberJoinedEvent, TeamMemberLeftEvent.
- Notification event: NotificationCreatedEvent.
- Payment event: PaymentRecordedEvent.

### 2.7 Observability and Logging
- Logging uses pino (nestjs-pino) with configurable log level (default: info).
- LoggingInterceptor logs method, URL, status code, and duration for every request.
- Correlation ID is included in every log entry and error response.
- Structured API error responses follow format: { error: { code, message, correlationId } }.
- 13 distinct error codes map to HTTP status codes (VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, SLOT_CONFLICT, RATE_LIMIT_EXCEEDED, INTERNAL_ERROR).
- AllExceptionsFilter catches ALL exceptions globally.

### 2.8 File Uploads and Storage
- File storage uses AWS S3 via @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner.
- Eight upload folder types are supported: avatar, ground-image, team-logo, tournament-poster, booking-proof, chat-attachment, general.
- MIME type and file size validation is enforced per upload type.
- Booking proof uploads accept jpeg/png/webp/pdf up to 10MB.
- Ground image uploads accept jpeg/png/webp up to 5MB.
- Avatar uploads accept jpeg/png/webp up to 5MB.
- AWS region is ap-southeast-1 (Singapore).
- S3 bucket naming convention: playarena-uploads-dev (with -dev suffix).

### 2.9 Frontend Framework and Build
- Frontend framework is Next.js 15 with App Router.
- React 19 is the UI library.
- Tailwind CSS v4 is the styling framework with postcss plugin @tailwindcss/postcss.
- shadcn/ui design system is used for UI primitives with CSS variable color theming.
- Zustand v5 is used for client-side state management.
- TanStack Query v5 is used for server state management.
- react-hook-form with @hookform/resolvers and zod is the form validation pipeline.
- lucide-react provides iconography.
- sonner provides toast notifications.
- recharts provides chart components.
- date-fns provides date utility functions.
- next-themes provides dark mode support (class strategy).
- Radix UI primitives are used for accessible unstyled components (avatar, dialog, dropdown, label, popover, select, separator, slot, tabs, toast, tooltip).
- The frontend organizes as an npm workspace with packages/shared (@playarena/shared) and packages/web.
- The shared package contains Zod DTOs, TypeScript types, API client, and utilities.
- The web package transpiles @playarena/shared via transpilePackages in next.config.js.
- OptimizePackageImports is configured for lucide-react and recharts.

### 2.10 Middleware and Auth Gate
- Next.js middleware reads access_token cookie on every request.
- Middleware matcher excludes /api, /_next/static, /_next/image, /favicon.ico, and file extensions.
- Root path / redirects authenticated users to /home, unauthenticated to /login.
- Auth route group (login, signup, forgot-password, verify-otp) redirects authenticated users to /home.
- All other routes redirect unauthenticated users to /login with ?redirect= preserving original destination.
- Middleware does NOT perform role-based checks — only authenticated vs unauthenticated.

### 2.11 API Client Architecture
- Shared API client uses fetch with credentials: 'include' for cookie-based auth.
- API_BASE defaults to NEXT_PUBLIC_API_URL or http://localhost:5173/api/v1.
- ApiError class captures status, code, message, and field-level details from error responses.
- buildQuery() utility filters out empty/null/undefined query parameter values.
- apiUpload<T>() handles FormData multipart uploads (no Content-Type header — browser sets boundary).

---

## 3. Module-by-Module Functional Specifications

### 3.1 Authentication & User Management

**Registration Parameters and Constraints**
- User registration requires phone, email, and password.
- Phone must match international format: +?[1-9]\d{6,14}.
- Password must be 8-128 characters.
- Email is the primary identity — OTP is sent via email, not phone.
- User role defaults to "player" (string, not enum — allows dynamic role creation).
- Password is nullable (passwordHash: String?) — supports future OTP-only login.
- All users sign up as generic accounts — no role/type selection during signup.

**OTP Generation and Verification Workflow**
- OTP is a cryptographically secure 6-digit number via crypto.randomInt(100000, 999999).
- OTP expiry is 10 minutes (hardcoded: 10 * 60 * 1000 ms).
- OTP is sent to the user's email address via the email module.
- Post-signup OTP verification is required before account activation.
- Verify OTP endpoint accepts email + 6-digit OTP code.
- Successful OTP verification returns access + refresh token pair.
- Forgot-password flow sends OTP to the registered email.
- Forgot-password endpoint uses vague response: "If the email exists, reset instructions have been sent" — prevents email enumeration.
- Reset-password endpoint accepts email + OTP + new password.
- Reset-password requires the user to re-enter email (not auto-filled from forgot-password page).

**Login Session Management**
- Login accepts email OR phone + password.
- Successful login returns accessToken + refreshToken.
- Access token is stored in an httpOnly cookie named access_token with 1-day expiry and SameSite=Lax.
- Refresh token has 30-day expiry.
- Token refresh endpoint exists but is NOT called by the frontend (no refresh interceptor).
- Logout calls the server (fire-and-forget), clears the access_token cookie, and resets Zustand auth state.
- Logout is a no-op on the server — JWT tokens cannot be revoked without a blacklist (not implemented).
- The auth store calls refreshUser() on app mount to restore session from existing cookie via /auth/me endpoint.

**Password Security Rules**
- PBKDF2 with SHA-512, 1,000 iterations, 64-byte key, 16-byte cryptographically random salt.
- Salt and hash are hex-encoded and stored in format salt:hash.
- 1,000 iterations is BELOW current OWASP minimum (600,000 for SHA-512) — known security gap.
- JWT_SECRET must be at least 32 characters via Zod validation (.min(32)).
- Token expiry (JWT_EXPIRES_IN) defaults to 7d.

**User Profile Management**
- Users can update their display name (only editable field on frontend).
- Email and phone are read-only after registration.
- User profile endpoint PATCH /auth/profile updates displayName.
- authApi.updateProfile() updates the auth store via setUser() on success.
- Player search is available via GET /players with filters (name, city, sport).
- Player profile endpoint GET /players/:id shows aggregate stats.
- Player teams endpoint GET /players/:id/teams lists all teams a player belongs to.

### 3.2 Ground Discovery & Booking Engine

**Ground Search and Filter Parameters**
- Public endpoint GET /grounds lists verified grounds with optional city filter.
- Public endpoint GET /grounds/featured returns top 10 featured grounds.
- Authenticated endpoint GET /grounds/my returns user's managed grounds (owner/manager/staff).
- Ground detail endpoint GET /grounds/:id returns full ground info with images, schedules, and settings.
- Public endpoints do NOT require authentication (ground browsing is open).
- Frontend homepage shows featured grounds by default.
- Frontend search filters on keystroke and replaces featured grid with search results.

**Ground Creation and Management**
- Ground creation is restricted to users with owner role.
- Creating a ground auto-assigns the creator as owner in GroundAccess table (transactional).
- Ground fields: name, ownerId, address, city, region, latitude, longitude, description, contactPhone, isVerified, isActive.
- Coordinates use Decimal(10, 7) — approximately 11mm precision at equator.
- Ground soft delete sets deletedAt and isActive: false.
- Ground update requires owner role.
- Ground settings allow online booking toggle, walk-in booking toggle, deposit percentage, cancellation policy, advance booking days, min/max booking duration.
- Deposit percentage defaults to 50%.

**Court Management**
- Courts belong to a ground and have a sportType, basePrice, pricePerHour, depositAmount, maxPlayers, and amenities (JSON).
- Available 60-minute time slots are calculated between open/close time minus already-booked slots.
- Slot availability endpoint GET /courts/:id/slots returns a complete availability grid for a given date.
- Courts can be soft-deleted by owner/manager role.

**Schedule Management**
- Ground schedules define weekly operating hours: dayOfWeek (0-6), openTime, closeTime, slotDuration.
- Slot duration defaults to 60 minutes for availability grid generation.
- Schedules can be upserted, updated per day, or removed per day by owner/manager role.

**Time Slot Grid Algorithm**
- All 60-minute slots between openTime and closeTime are generated.
- Already-booked slots for the requested date are removed from the grid.
- The result is a complete availability grid with startTime, endTime, isAvailable, and price per slot.
- Price is calculated as hours × pricePerHour; falls back to basePrice.

**Booking Lifecycle States**
- Booking has exactly 6 statuses in a state machine: pending_payment_verification, approved, rejected, expired, cancelled, completed.
- Transition: pending_payment_verification → approved (staff approves).
- Transition: pending_payment_verification → rejected (staff rejects with reason).
- Transition: pending_payment_verification → expired (auto-expiry after configured minutes).
- Transition: approved → cancelled (player cancels own booking).
- Transition: approved → completed (auto-completion after match time).
- No illegal state transitions are permitted.
- Booking expiry minutes are configurable via BOOKING_EXPIRY_MINUTES env var (default: 30 minutes).
- Booking expiry worker runs every 5 minutes and batch-updates pending bookings older than cutoff to expired status.

**Deposit and Payment Rules**
- Deposit is calculated as totalAmount × depositPercentage (default 50%).
- Deposit is skipped entirely if GroundSetting.allowDeposit is false.
- Booking creation requires deposit calculation and conflict-free slot availability.
- Slot conflict detection uses SELECT ... FOR UPDATE row-level locking within a Prisma transaction.
- Booking finance tracks totalAmount, onlineReceived, offlineReceived, and paymentStatus.
- Payment statuses: unpaid, partial, paid, overpaid.
- Overpayment is detected by checking existing payments before recording a new one.

**Walk-In Booking Workflow**
- Walk-in bookings are created by ground staff (bypasses online booking flow).
- Walk-in bookings are automatically set to approved status.
- Walk-in bookings are automatically marked as paid.
- Walk-in booking requires playerName and playerPhone (not user-bound — walk-ins can be non-registered).
- Walk-in booking creates a Booking record linked to the ground and court.

**Booking Endpoints and Permissions**
- POST /bookings — any authenticated user (player) — creates booking with deposit and slot conflict detection.
- GET /bookings/my — any authenticated user — lists own bookings.
- GET /bookings/:id — any authenticated user — booking details with finance and payments.
- PATCH /bookings/:id/cancel — booking owner — cancels own booking.
- POST /grounds/:id/walkin — ground staff — creates walk-in booking.
- GET /grounds/:id/bookings — ground staff — lists ground's bookings.
- PATCH /bookings/:id/status — ground staff — approves or rejects booking.

### 3.3 Financials & Cash Management

**Supported Payment Channels**
- Five payment methods are pre-seeded: Cash, JazzCash, Easypaisa, Bank Transfer, Credit/Debit Card.
- Channel classification: jazzcash, easypaisa, and online are "online" channels.
- Channel classification: cash and bank_transfer are "offline" channels.
- Payment methods follow a hierarchy: Global → Region → Ground-level overrides.
- Public endpoint GET /payment-methods lists all enabled payment methods.
- Authenticated endpoint GET /payment-methods/ground/:id returns effective methods for a specific ground.
- Owner can toggle payment methods on/off per ground via PATCH /grounds/:id/payment-methods/:methodId.

**Payment Recording and Idempotency**
- Payment recording uses an idempotencyKey (unique constraint) to prevent duplicate entries.
- BookingPayment table is append-only — records are never updated or deleted.
- Payment recording accepts bookingId, amount, channel, paymentMethod, and idempotencyKey.
- BookingFinance totals (onlineReceived, offlineReceived) are derived from BookingPayment records.
- Overpayment protection checks existing payment sum before recording new payment.
- POST /bookings/:id/payment requires staff role.
- GET /bookings/:id/finance requires staff role — returns booking finance details.
- GET /grounds/:id/finance returns ground finance summary — requires owner/manager role.
- GET /grounds/:id/reports returns ground financial report — requires owner role.

**Cash Session Shift Workflow**
- Cash session tracks openingCash, closingCash, and expectedCash.
- Only one open cash session is allowed per ground at any time.
- Opening a cash session POST /grounds/:id/cash-session/open requires staff role.
- Closing a cash session POST /grounds/:id/cash-session/close requires staff role.
- Variance is calculated as: closingCash - (openingCash + cashPaymentsTotal).
- Positive variance = overage (more cash than expected).
- Negative variance = shortage (less cash than expected).
- Cash session statuses: open → closed → reconciled.
- GET /grounds/:id/cash-sessions lists sessions — requires owner/manager role.
- CashSessionAutoCloseWorker auto-closes cash sessions at end of day.

**Finance Module Integration**
- Finance module connects booking payments to cash sessions.
- CashSessionPayment table links cash session payments to booking payments.
- Payment recording optionally links cash payments to the currently open cash session.
- Finance endpoints support per-ground financial reports and summaries.
- Admin-level endpoint GET /admin/finance returns platform-wide finance summary (totalRevenue, online/offline split, bookingCount).

### 3.4 Teams & Matchmaking (ELO System)

**Team Creation Rules**
- Team creation requires team name and sport category (optional).
- Creator is auto-assigned as captain role in TeamMember.
- Team has a default ELO rating of 1200 (standard starting rating).
- Team fields: name, sportCategoryId, rating (ELO), wins/losses/draws, isActive, deletedAt.
- Team can be soft-deleted.
- Team update requires captain or co-captain role.
- Teams are permanent entities (not tournament-scoped).

**Player Roster Management**
- TeamMember roles: captain, co_captain, player.
- Team roster endpoint GET /teams/:id/members returns all members with roles.
- Captaincy can be transferred to another member via PATCH /teams/:id/transfer-captaincy/:uid.
- Member role can be updated by captain via PATCH /teams/:id/members/:uid.
- Member can be removed by captain via DELETE /teams/:id/members/:uid.
- Player can leave team via DELETE /teams/:id/members/me.
- Join request system: player requests to join, captain accepts or rejects.
- Join request list endpoint GET /teams/:id/join-requests — captain only.
- Invitation system: captain invites player by email, player joins via accept flow.
- Invitation statuses: pending, accepted, rejected, expired.

**Match Challenge Request Workflow**
- Only captains and co-captains can create challenges (match requests).
- Match request requires fromTeamId, toTeamId, and proposedDate.
- Challenge system prevents duplicate pending challenges between same teams in either direction.
- Match request statuses: pending, accepted, rejected, cancelled, expired.
- Pending requests auto-expire after 24 hours.
- Sender can cancel pending request via PATCH /match-requests/:id/cancel.
- Receiver can accept challenge via PATCH /match-requests/:id/accept — creates a TeamMatch record.
- Receiver can reject challenge via PATCH /match-requests/:id/reject.
- Only captains and co-captains can accept or reject challenges.

**Match Lifecycle and Score Entry**
- TeamMatch statuses: scheduled, ongoing, completed, cancelled, forfeited.
- Match round types: friendly, league, knockout, group_stage.
- Match requires dual-confirmation scoring — both teams must submit matching scores.
- First team submits score via PATCH /matches/:id/score (stored as pending).
- Second team submits score — if scores match, match auto-completes with ELO update.
- If scores don't match, both entries remain pending (ground staff mediates disputes).
- Match can be started via PATCH /matches/:id/start.
- Match can be cancelled via PATCH /matches/:id/cancel.
- Match history is available per team via GET /teams/:id/matches.

**ELO Rating System Formulas and Rules**
- Baseline ELO rating for new teams is 1200.
- Expected score formula: 1 / (1 + 10^((Rb - Ra) / 400)).
- K-factor: 32 for new teams (< 30 matches played).
- K-factor: 24 for established teams (>= 30 matches played).
- Winner gains K × (1 - expectedScore) points.
- Loser loses K × (0 - expectedScore) points (negative adjustment).
- Rating floor is 100 — teams cannot drop below 100 ELO.
- Inactivity decay: teams lose 2 ELO per week after 30 days of inactivity.
- RatingDecayWorker runs weekly on Sunday at 2:00 AM.
- Rating decay uses raw SQL via prisma.$queryRaw for complex subquery.
- Decay operation is wrapped in $transaction for atomic team update + rating history insert.
- Each decay is recorded in TeamRatingHistory (ratingBefore, ratingAfter, change, reason).
- Rating history is queryable per team via GET /teams/:id/rating-history.

### 3.5 Tournaments & Brackets

**Tournament Setup Options**
- Tournament formats: knockout, round_robin, group_knockout.
- Tournament statuses: upcoming, registration_open, registration_closed, ongoing, completed, cancelled.
- Required fields: name, sportType, format, entryFee, prizePool, maxTeams, startDate, endDate, registrationDeadline.
- Team size per tournament entry is configurable.

**Bracket Generation and Seeding**
- Knockout format generates single-elimination bracket with proper round structure.
- Round-robin format generates a full round-robin schedule where every team plays every other team.
- Group knockout format generates group stages followed by knockout bracket for top teams.
- TournamentMatch tracks round, matchOrder, team1/team2 IDs, scores, winnerId, court, and status.
- TournamentMatch statuses: scheduled, ongoing, completed, cancelled, forfeited.
- Bracket is auto-generated when tournament status moves to registration_closed or ongoing.

**Team Registration and Entry Fees**
- Teams register via POST /tournaments/:id/register (requires team captain).
- TournamentTeam links teams to tournaments with verification status.
- Registration is only allowed during registration_open status.
- Team withdrawal is possible before registration closes.
- Entry fee collection and prize pool tracking are recorded but not processed in-app.

**Tournament Lifecycle**
- Tournament CRUD: create, read, update, delete.
- Tournament match results can be entered via POST /tournaments/:id/matches/:matchId/result.
- Tournament standings are queryable via GET /tournaments/:id/standings.
- Bracket visualization is available via GET /tournaments/:id/bracket.
- Leaderboard per tournament via GET /tournaments/:id/leaderboard.
- My tournaments endpoint GET /tournaments/my returns tournaments the user's teams are registered in.

### 3.6 Ratings, Leaderboards & Reviews

**Post-Match Peer Review Criteria**
- Peer review has three scoring dimensions: skillRating (1-5), sportsmanshipRating (1-5), punctualityRating (1-5).
- Review also includes optional reviewText (free text).
- Only captains can submit peer ratings via POST /matches/:id/rating.
- Ratings are upserted — only the most recent rating per match per rater is kept.
- RatingSubmittedEvent is emitted when a peer review is submitted.
- MatchRating stores all reviews per match for visibility on player profiles.

**Player Statistics Aggregation**
- PlayerStat aggregates per-user stats per sport: matchesPlayed, wins, goalsScored, assists, manOfMatch, ratingAverage.
- PlayerMatchStat records per-match stats: goalsScored, assists, isManOfMatch, performanceRating.
- Only captains can submit per-match player stats via POST /matches/:id/player-stats.
- PlayerStat aggregates are running totals updated on every match completion.
- Player stats are queryable via GET /players/:id/stats.

**Leaderboard Rankings**
- Global leaderboard GET /leaderboard returns teams sorted by ELO rating descending (paginated).
- Sport-filtered leaderboard GET /leaderboard/:sportId filters by sport category.
- Leaderboard entries show team name, ELO rating, wins/losses/draws record.
- Frontend highlights top 3 teams with gold/silver/bronze icons and green podium border.

### 3.7 Real-Time Chat & Communications

**WebSocket Room Architecture**
- Chat operates under the /chat Socket.IO namespace.
- Users join ground:{groundId} rooms based on GroundAccess or ChatParticipant records.
- Access control checks both GroundAccess (staff roles) and ChatParticipant records before allowing room join.
- JWT authentication on WebSocket handshake validates token from handshake.auth.token or query parameter.

**Message Broadcasting and Unread Tracking**
- Send message event (client → server): sendMessage with content (1-2000 chars).
- New message event (server → room): newMessage broadcasts to all room members.
- Typing indicator (bidirectional): typing event for real-time typing awareness.
- Messages use cursor-based pagination with before timestamp cursor.
- Paginated response includes hasMore boolean and nextCursor for infinite scroll.
- Unread count per ground uses raw SQL: INSERT ... ON CONFLICT DO UPDATE for efficient upsert.
- Unread counts are queryable via GET /chat/unread.
- Mark-as-read endpoint POST /chat/:id/read updates lastReadAt for ChatParticipant.
- Chat messages support soft delete (deletedAt field).

**REST Chat Endpoints**
- GET /chat/:id/messages — cursor-based paginated messages for a ground.
- POST /chat/:id/messages — send a new message to a ground.
- GET /chat/unread — unread counts per ground for current user.
- POST /chat/:id/read — mark all messages as read for a ground.

### 3.8 Notifications Architecture

**Notification Types and Storage**
- Notification stores: title, body, type, metadata (JSON), userId, status, retryCount.
- Notification statuses: queued, sent, failed, dead_letter.
- Notifications support soft delete (deletedAt).
- Notifications are event-driven — NotificationCreatedEvent triggers WebSocket broadcast.
- Notification gateway listens for notification.created events and broadcasts to user:{userId} room.

**Notification Endpoints and Permissions**
- GET /notifications — paginated notification list for current user.
- GET /notifications/unread-count — count of unread notifications.
- PATCH /notifications/:id/read — mark single notification as read.
- PATCH /notifications/read-all — mark all notifications as read.
- DELETE /notifications/:id — soft delete a notification.
- NotificationCleanupWorker periodically purges old sent/failed notifications (90-day retention).

**Notification Trigger Points**
- Booking created → notification to ground staff.
- Booking approved → notification to player.
- Booking rejected → notification to player (with reason).
- Booking cancelled → notification to ground staff.
- Match challenge received → notification to receiving team captain.
- Match challenge accepted → notification to challenging team captain.
- Match completed → notification to both teams.
- Payment recorded → notification to ground staff.
- Team invitation → notification to invited player.
- Join request → notification to team captain.

### 3.9 Super-Admin Control Panel

**Platform-Wide Financial Analytics**
- GET /admin/finance returns totalRevenue, onlineReceived, offlineReceived, and bookingCount across the entire platform.
- Admin finance view aggregates ALL bookings (not per-ground).
- All monetary values are in PKR.

**Global User and Ground Moderation**
- GET /admin/users — paginated user list with search capability.
- GET /admin/users/:id — user detail including city, grounds owned, recent bookings.
- PATCH /admin/grounds/:id/verify — mark a ground as verified.
- PATCH /admin/grounds/:id/suspend — suspend a ground (deactivate).
- GET /admin/grounds — all grounds with court count and booking count.
- GET /admin/teams — all teams with member counts.

**System-Wide Audit Logging**
- AuditLog is an append-only table — records are never updated or deleted.
- AuditLog fields: action, entityType, entityId, performedBy (userId), ipAddress, groundId, metadata (JSON), createdAt.
- GET /admin/audit-logs — paginated audit log list filterable by action, entityType, groundId, and date range.
- Audit logging is triggered on all sensitive actions: booking status changes, payment recording, ground verification/suspension, user role changes.

**Reference Data Management**
- CRUD operations for payment methods, regions, cities, and sport categories.
- Regions endpoint includes nested cities sorted by displayOrder.
- All reference data CRUD is restricted to super_admin role.
- Payment methods have hierarchical availability: Global → Region → Ground overrides.

### 3.10 File Upload Module

**Upload Endpoints and MIME Restrictions**
- POST /upload — general upload (default MIME types, default size).
- POST /upload/booking-proof — jpeg, png, webp, pdf — 10MB max.
- POST /upload/ground-image — jpeg, png, webp — 5MB max.
- POST /upload/team-logo — jpeg, png, webp — 5MB max.
- POST /upload/tournament-poster — jpeg, png, webp — 5MB max.
- POST /upload/avatar — jpeg, png, webp — 5MB max.
- Upload uses S3 with @aws-sdk/client-s3 for server-side upload.
- MIME type and file size validation occurs server-side before S3 upload.

**Folder Organization**
- Uploads are organized into 8 folder types within the S3 bucket.
- Folder types: avatar, ground-image, team-logo, tournament-poster, booking-proof, chat-attachment, general, (reserved).
- Each folder type may have different access control (e.g., booking-proof requires staff role).
- Booking-proof upload requires staff role.
- Ground-image upload requires owner role.
- Tournament-poster upload requires owner/manager role.
- Avatar upload requires any authenticated user.

### 3.11 Health Monitoring

**Health Check Endpoint**
- GET /health — public endpoint (no authentication).
- Health check performs SELECT 1 to test database connectivity.
- Healthy response: { status: "ok", timestamp, services: { database: { status: "up", latencyMs } } }.
- Degraded response: { status: "degraded", timestamp, services: { database: { status: "down", latencyMs } } }.
- Latency is measured and reported in milliseconds.

---

## 4. Role-Specific Actionable Implementation Points

### 4.1 Backend Developers

**API Routing Conventions**
- All API routes are prefixed with /api/v1.
- Module routes follow NestJS module pattern with @Controller decorator.
- All controllers use the module path segment (e.g., @Controller('auth')).
- Every route requires authentication unless explicitly decorated with @Public().
- Route handler parameters use @CurrentUser() decorator to extract authenticated user.
- JSON request bodies are validated using ZodValidationPipe with Zod schemas.
- All responses are wrapped in TransformInterceptor: { data, meta: { timestamp, path } }.
- Paginated responses follow { data, meta: { total, page, limit, totalPages } } format.
- Error responses follow { error: { code, message, correlationId } } format.

**Payload Validation Rules**
- All DTOs use Zod schemas imported from @playarena/shared.
- ZodValidationPipe is a generic pipe that validates any Zod schema automatically.
- Validation failures return 400 with VALIDATION_ERROR code and field-level details.
- Password: min 8, max 128 characters.
- Phone: international format +?[1-9]\d{6,14}.
- OTP: exactly 6 characters (digits only).
- Email: validated via Zod's built-in email validation.
- Time format: HH:mm regex.
- Chat message: min 1, max 2000 characters.

**Error Handling Standards**
- AllExceptionsFilter catches every unhandled exception globally.
- HTTP exceptions map to specific error codes (14 codes total).
- 400 — VALIDATION_ERROR (BadRequestException).
- 401 — UNAUTHORIZED (UnauthorizedException).
- 403 — FORBIDDEN (ForbiddenException).
- 404 — NOT_FOUND (NotFoundException).
- 409 — CONFLICT or SLOT_CONFLICT (ConflictException).
- 429 — RATE_LIMIT_EXCEEDED (ThrottlerException).
- 500 — INTERNAL_ERROR (any unhandled exception).
- SLOT_CONFLICT is a custom code for booking slot conflicts — detected via ConflictException.constructor.name check.
- Correlation ID is included in every error response for debugging.
- 500 error messages are generic ('Internal server error') — no stack trace leakage.

**Database Migration Policies**
- Prisma migrations are stored in prisma/migrations directory.
- Migration path is configured in prisma.config.ts.
- Seed script is prisma/seed.ts, executed via ts-node prisma/seed.ts.
- Seed script cleans all data in reverse-dependency order before seeding (37 deleteMany calls in transaction).
- Seed data is Pakistan-specific: 2 regions (Karachi, Lahore), 8 cities, 4 sports, 12 users, 3 grounds, 12 courts, 6 teams.
- All seed user passwords are hashed with PBKDF2 (password123).
- Seed phone numbers use +92300 series (realistic Pakistan mobile format).
- Seed pricing: Futsal PKR 1,500-4,000/hr, Basketball PKR 2,000-2,500/hr, Badminton PKR 800/hr, Cricket nets PKR 1,000-1,200/hr.

**Indexing Strategies**
- Every Prisma model has at least one index; most have 2-3 indexes.
- Unique constraints on multi-field combinations: GroundAccess(groundId, userId), ChatParticipant(groundId, userId), UnreadCount(userId, groundId), TeamMember(teamId, userId), TeamInvite(teamId, userId).
- BookingPayment has unique constraint on idempotencyKey.
- Indexes are defined on all foreign key columns and frequently queried filter fields.
- Composite indexes serve common query patterns (e.g., userId + status on bookings).

**Data Integrity Constraints**
- All IDs use UUIDv4 with gen_random_uuid() default.
- Decimal(12, 2) for all monetary fields — supports up to 99,999,999,999.99 PKR.
- Decimal(10, 7) for coordinate fields — ~11mm precision.
- @@map on all models maps Prisma model names to snake_case table names (e.g., users_public, ground_access).
- Soft delete pattern (deletedAt nullable timestamp) on Ground, Booking, Team, ChatMessage, Notification.
- BookingPayment and AuditLog are append-only — no UPDATE or DELETE operations.
- JSON fields used for flexible metadata: GroundSetting.amenities, Notification.metadata, AuditLog.metadata, AppLog.metadata, PaymentMethod.metadata.

**Rate-Limiting Policies**
- Global rate limit: 100 requests per minute per IP (from @nestjs/throttler).
- ThrottleGuard is registered as APP_GUARD — applies to ALL routes by default.
- Rate limit exceeded returns 429 with error code RATE_LIMIT_EXCEEDED.
- Rate limiting is IP-based.

**Security Middleware Requirements**
- Helmet is applied globally for HTTP security headers.
- CORS is configured per environment (wildcard * in development).
- JwtAuthGuard is global — ALL routes require authentication unless @Public().
- RolesGuard checks user-level role (user.role) + ground-level role (GroundAccess table).
- GroundAccess lookup queries database on every request with @Roles() and params.groundId.
- Request timeout interceptor cancels requests exceeding 30 seconds.
- Correlation ID is propagated on all requests via LoggingInterceptor.

### 4.2 Frontend Developers

**State Management Patterns**
- Zustand v5 manages client-side state: auth store (user, isAuthenticated, isLoading, login, signup, logout, refreshUser, setUser) and UI store (sidebarCollapsed, toggleSidebar).
- TanStack Query v5 manages server state with QueryClient (staleTime: 60000ms, retry: 1, refetchOnWindowFocus: false).
- Auth state is initialized on mount via refreshUser() call to /auth/me.
- Mutations invalidate related queries on success (e.g., booking creation invalidates bookings + slots queries).
- Server data is never duplicated into Zustand stores — only auth state lives in Zustand.

**Reactive UI/UX State Handling**
- Every data-fetching page handles four states: loading (skeleton components with animate-pulse), empty (illustration + CTA button), error (error message + retry option), success (data rendering).
- Loading skeletons match the layout shape of actual content (card skeletons for card grids, row skeletons for tables).
- Empty states show contextual illustrations and call-to-action buttons (e.g., "Create Your First Team").
- Mutation states use query.isPending to drive loading state on submit buttons.
- Form validation errors are displayed inline below each input field in red (--color-destructive).

**Real-Time Socket Event Listeners**
- Socket.IO client connects to backend WebSocket server.
- Chat namespace: listen for newMessage events to update message list in real time.
- Chat namespace: emit sendMessage for outbound messages.
- Chat namespace: emit and listen for typing indicators.
- Notifications namespace: listen for notification events to update notification count and list.
- Frontend joins user:{userId} room on notification namespace after auth.
- Frontend joins ground:{groundId} room on chat namespace after accessing a ground chat.
- Connection recovery is handled by Socket.IO's built-in reconnection logic.

**Responsive Design Breakpoints**
- Sidebar collapses from 240px (full text + icons) to 60px (icons only) on mobile.
- Mobile hamburger button (<Menu>) visible only at lg:hidden breakpoint.
- User name in topbar hidden at sm breakpoint (avatar only on mobile).
- Content padding switches from p-4 (mobile) to p-6 lg:p-6 (desktop).
- Auth pages use centered layout with max-w-md container.
- Ground detail page uses 2-column image gallery.
- Card grids use responsive grid layout (auto-fill, minmax pattern).

**Form Validation Feedback Loops**
- Zod schemas shared between frontend and backend (@playarena/shared DTOs).
- react-hook-form with @hookform/resolvers/zod connects form state to Zod validation.
- Inline validation: errors appear below each input field on form submission.
- Password confirmation is validated client-side before API call (password !== confirmPassword blocks submission).
- OTP input sanitization: replace(/\D/g, '').slice(0, 6) — digits only, max 6 chars.
- Submit buttons disable during mutation.isPending to prevent double-submission.
- Success actions: toast notification, query invalidation, redirect to relevant page.

**Auth Flow on Frontend**
- Login form sends email + password, sets access_token cookie, updates Zustand store.
- Login redirect respects ?redirect= query param (falls back to /home).
- Signup form collects email + phone + password, redirects to /verify-otp?email=.
- Verify OTP auto-fills email from query param, sends OTP, auto-login on success.
- Forgot password sends email, always shows success message (prevents email enumeration).
- Reset password requires email + OTP + new password + confirm, redirects to /login.
- Profile shows avatar + display name + role + email (disabled) + phone (disabled).
- Profile edit only allows display name changes.
- Logout clears cookie and resets Zustand state (fire-and-forget API call).

**Component Architecture**
- UI primitives (6): Button, Input, Card, Badge, Avatar, Tabs — all in src/components/ui/.
- Layout components (3): Providers (QueryClient + Sonner Toaster), Sidebar (collapsible, role-based), Topbar (fixed header).
- Button: 5 variants (primary, secondary, outline, ghost, danger), 3 sizes (sm/md/lg), loading state with spinner, forwardRef + Slot pattern.
- Input: label, error, icon props, dynamic left padding for icon, red border on error.
- Badge: auto-formats status text, applies color mapping from getStatusColor().
- Card: 3 sub-components (Card, CardHeader, CardContent), supports asChild for polymorphism.
- Avatar: 3 sizes (sm/md/lg), initials fallback, image mode with object-cover.
- Tabs: custom implementation (not Radix UI), controlled + uncontrolled, context-based, unmounts hidden content.

**Sidebar Navigation and Role-Based Access**
- 13 nav items with per-item roles array for visibility filtering.
- Player role sees: Home, My Bookings, Teams, Matches, Tournaments, Leaderboard, Notifications, Profile.
- Owner role sees: Home, Tournaments, My Grounds, Add Ground, Finance, Notifications, Profile.
- Staff role sees: Home, Operations, Notifications, Profile.
- Manager role sees: Home, Tournaments, Finance, Operations, Notifications, Profile.
- Super Admin role sees: Home, Admin, Profile.
- Active route detection uses pathname.startsWith(item.href).
- Sidebar collapses between 60px (icon-only) and 240px (full text) via useUI store.
- Logo shows Trophy icon + "PLAYARENA" branding.
- User section at bottom shows avatar + display name + role + logout button.

### 4.3 QA & Testers

**Test Matrix Requirements**
- Unit tests cover utility functions: ELO calculation (RatingUtil), PKR formatting (MoneyUtil), status formatting, date formatting.
- Unit tests cover validation schemas: all Zod DTOs in @playarena/shared.
- Integration tests cover API endpoints: auth flow (signup → verify → login → refresh → me → logout).
- Integration tests cover booking state machine: all 6 state transitions.
- Integration tests cover payment idempotency: duplicate idempotencyKey returns existing record.
- Integration tests cover ELO rating updates: expected score calculation and rating change verification.
- Integration tests cover slot availability: booked slots excluded from available slot grid.
- Integration tests cover role-based access: player cannot access staff endpoints.
- E2E tests cover full user journey: signup → verify → login → browse grounds → create booking → view booking.
- E2E tests cover ground owner flow: create ground → add court → set schedule → manage bookings.
- E2E tests cover team flow: create team → invite member → accept invite → create challenge → play match.
- Test configuration uses Jest with ts-jest transformer.
- E2E test config (test/jest-e2e.json) matches .e2e-spec.ts files.
- Unit test config (package.json) matches *.spec.ts files in src/.
- Coverage is collected to coverage/ directory.

**Critical Edge Cases**
- Concurrent double-booking: two users booking the same court/time simultaneously must result in exactly one success.
- Slot conflict detection uses SELECT ... FOR UPDATE row-level locking within a transaction.
- Payment idempotency: submitting the same idempotencyKey twice must return the same result without duplicate entry.
- Overpayment protection: total payments exceeding booking total must be rejected.
- Cash session enforcement: only one open session per ground at any time.
- Pending challenge deduplication: same teams cannot have multiple pending challenges in either direction.
- Score entry dual-confirmation: match only completes when both teams submit matching scores.
- Soft delete isolation: soft-deleted records are excluded from all queries.
- OTP expiry: expired OTP verification must fail with clear error.
- Token expiry: expired JWT must return 401 UNAUTHORIZED.
- Refresh token rotation: using an already-refreshed token must fail.
- Ground access revocation: removed staff must lose access to ground operations immediately.
- Tournament registration closure: teams cannot register after deadline.
- Booking expiry auto-transition: pending bookings older than cutoff auto-transition to expired.

**Security Vulnerability Test Scenarios**
- Cross-ground data access: staff of Ground A must not access Ground B's data.
- Role escalation: player must not access admin endpoints.
- GroundAccess tampering: user must not create/modify GroundAccess records for grounds they don't own.
- IDOR: user must not access another user's bookings, teams, or profile via ID manipulation.
- SQL injection: all endpoints must reject malicious SQL strings in inputs.
- XSS: chat messages and review text must be sanitized to prevent script injection.
- CSRF: httpOnly cookie + SameSite=Lax provides CSRF protection.
- Rate limit bypass: exceeding 100 requests/min must be throttled.
- JWT secret brute force: secret must be at least 32 characters (256-bit).
- Password hash cracking: PBKDF2 with 1,000 iterations — document as known weakness for upgrade.

### 4.4 Team Leads & Project Owners

**Sprint Task Breakdowns**
- Phase 1 — Auth & User Management: implement signup flow, login flow, JWT strategy, OTP system, password reset, user profile CRUD.
- Phase 2 — Ground Module: implement ground CRUD, court CRUD, schedule management, settings management, image upload, slot availability engine.
- Phase 3 — Booking Engine: implement create booking with conflict detection, booking state machine, approval/rejection workflow, walk-in flow, booking expiry worker.
- Phase 4 — Finance & Cash: implement payment recording with idempotency, booking finance tracking, cash session open/close/reconcile, variance calculation, payment method hierarchy.
- Phase 5 — Teams & Matchmaking: implement team CRUD, roster management, invites/join requests, match challenge system, dual-confirmation scoring, ELO rating calculations.
- Phase 6 — Tournaments: implement tournament CRUD, bracket generation (knockout + round-robin), team registration, match scheduling per round, standings/leaderboard.
- Phase 7 — Ratings & Leaderboards: implement peer review submission, player stats aggregation, per-match stats, global and per-sport leaderboards.
- Phase 8 — Chat & Notifications: implement Socket.IO namespaces, ground-scoped chat rooms, cursor-based pagination, unread tracking, notification CRUD, event-driven notifications.
- Phase 9 — Admin Panel: implement user management, ground moderation, finance analytics, audit log viewer, reference data CRUD.
- Phase 10 — Admin UI: implement functional admin tabs (Users done, Grounds/Finance/Settings pending).

**Dependency Mapping**
- Auth module is a dependency for ALL other modules (global JwtAuthGuard requires working auth).
- Ground module is a dependency for Bookings, Finance, Chat (all require ground context).
- Booking module is a dependency for Finance (payment recording references bookings).
- Team module is a dependency for Matchmaking (match challenges require teams).
- Team + Court modules are dependencies for Matchmaking (matches require both).
- Team + Tournament modules are dependencies for Tournament registration.
- Match module is a dependency for Ratings (peer reviews reference matches).
- Event modules (Booking, Match, Team, Payment events) are dependencies for Notifications.
- Upload module is standalone but referenced by Grounds, Teams, Tournaments, and Users.
- Admin module depends on ALL other modules (it aggregates data from every domain).

**Acceptance Criteria for Feature Sign-Offs**

*Auth Module Acceptance:*
- User can sign up with email, phone, and password.
- User receives 6-digit OTP via email within 10 seconds.
- User can verify OTP and receive JWT token pair.
- User can log in with email + password or phone + password.
- User can refresh token and receive new token pair.
- User can log out (cookie cleared, local state reset).
- User can request password reset via email OTP.
- User can reset password with valid OTP.
- User profile is retrievable via /auth/me.
- User can update display name only.

*Ground Module Acceptance:*
- Verified grounds are searchable by city, sport type, and search term.
- Ground detail shows images, schedules, courts, settings, and amenities.
- Owner can create, update, and soft-delete grounds.
- Owner can manage courts (CRUD with pricing and max players).
- Owner can manage schedules (weekly operating hours per day).
- Owner can configure settings (deposit %, advance booking days, cancellation policy).
- Owner can invite staff by phone with role assignment.
- Staff can accept/reject invites.
- Slot availability grid correctly excludes booked slots.

*Booking Module Acceptance:*
- User can book a court for a specific date and time slot.
- Deposit is correctly calculated as totalAmount × depositPercentage.
- Slot conflict detection prevents double-booking of the same court+time.
- Staff can approve or reject pending bookings.
- Booking auto-expires after configured minutes if not approved.
- User can cancel own booking.
- Walk-in bookings are auto-approved and marked paid.
- Booking status transitions follow the state machine with no illegal transitions.

*Finance Module Acceptance:*
- Staff can record payments with idempotency key.
- Duplicate idempotency key returns the same result without double-charge.
- Overpayment is detected and prevented.
- Cash session can be opened (only one open session per ground).
- Cash session closing calculates correct variance.
- Payment methods follow Global → Region → Ground hierarchy.
- Ground finance summary shows accurate totals.

*Team and Matchmaking Acceptance:*
- User can create a team and is auto-assigned as captain.
- Captain can invite players by email.
- Players can accept/reject team invitations.
- Players can request to join a team.
- Captain can accept/reject join requests.
- Captaincy can be transferred.
- Captain can challenge another team via match request.
- Receiving team captain can accept or reject challenge.
- Match scores require dual-confirmation to finalize.
- ELO ratings update correctly after completed matches.
- Rating decay applies weekly to inactive teams.
- Team rating history is queryable.

*Tournament Acceptance:*
- Owner can create tournaments in knockout, round-robin, or group-knockout format.
- Teams can register during the registration period.
- Brackets are auto-generated when tournament starts.
- Match results can be entered per round.
- Standings and leaderboard reflect accurate results.
- Registration respects maxTeams limit.

*Chat and Notifications Acceptance:*
- Users can send and receive real-time messages in ground chat.
- Messages use cursor-based pagination with hasMore/nextCursor.
- Unread counts update in real time.
- Users receive notifications for booking status changes, match updates, and team events.
- Notifications are persisted and queryable.
- Read/unread status is tracked per notification.

*Admin Acceptance:*
- Admin can view paginated user list with search.
- Admin can view user details with associated data.
- Admin can verify or suspend grounds.
- Admin can view platform-wide finance analytics.
- Admin can view and filter audit logs.
- Admin can CRUD reference data (regions, cities, sports, payment methods).

---

## 5. Known Gaps and Technical Debt

### 5.1 Testing Coverage
- Backend has exactly ONE test file (app.e2e-spec.ts) — the default NestJS starter test.
- The starter test expects 'Hello World!' but the actual controller returns a JSON object — test is STALE.
- No unit tests exist for any service, utility, guard, interceptor, or filter.
- No integration tests exist for any module.
- No E2E tests cover real PlayArena API endpoints.
- Jest is fully configured but has zero real test coverage across 16 modules.
- Frontend has no testing framework configured in package.json.

### 5.2 Email Module
- Email module has NO template engine — all transactional emails are plain text.
- SMTP falls back to console.log when unconfigured.
- No HTML email support for rich formatting.
- No email queue implementation (emails are sent synchronously).

### 5.3 Authentication Security Gap
- PBKDF2 iteration count is 1,000 — far below OWASP minimum of 600,000 for SHA-512.
- Logout is a no-op on the server (no token blacklist or revocation mechanism).
- No refresh token rotation or reuse detection.
- No brute-force protection on login endpoint (beyond global rate limit).

### 5.4 Push Notifications
- FCM push notifications are planned but NOT implemented.
- No Firebase Admin SDK integration exists.
- Notification module only supports in-app notifications via WebSocket.

### 5.5 Admin Frontend
- Only Users tab is functional in the admin panel.
- Grounds, Finance, and Settings tabs show "coming soon" placeholders.
- toggleUserStatus has empty mutation body (no-op — admin cannot deactivate users).
- Admin grounds query uses raw fetch('/api/v1/grounds') instead of API client.
- Toggle button icon doesn't match action intent.

### 5.6 Ground Edit Page
- Ground edit page only has a name field — cannot update city, address, description, courts, images, or schedule.
- Ground edit page does NOT pre-populate existing data — starts with empty form.
- Ground edit is minimally functional for name-only changes.

### 5.7 Frontend Services Layer
- src/services/ directory is empty — no API abstraction layer.
- API calls are made directly from page components.
- No error boundary components exist.
- No API response caching layer beyond TanStack Query default.

### 5.8 Next.js API Routes
- app/api/ directory is empty — no Next.js API routes for auth proxy or uploads.
- All API calls go directly to the NestJS backend (bypassing Next.js API route layer).

### 5.9 Domain Components
- 8 domain component directories exist but are empty.
- UI logic is inlined in page components with no reusability.
- No shared domain components for GroundCard, TeamCard, BookingCard, etc.

### 5.10 Dead Code and Redundancies
- backend/src/app.service.ts returns 'PlayArena API v1' but AppController returns hardcoded object — service is unused.
- Two versions of generate-spec script exist (generate-spec.ts and generate-spec.mjs) with slight differences.
- cn() function exists in TWO places with different implementations: lib/utils.ts uses clsx, shared/src/utils/index.ts uses filter(Boolean).join(' ').
- Frontend has both tailwind.config.js (v3 style) and @tailwindcss/postcss (v4) — transitional state.

### 5.11 Security Concerns
- CORS origin set to * in development (production should restrict).
- Dockerfile runs as root (no USER directive).
- No HEALTHCHECK in Dockerfile.
- No secure headers configuration for production.
- AWS credentials are optional — upload module may fail silently.

---

## 6. Deployment Architecture

### 6.1 Local Development (Docker Compose)
- Three services: api (NestJS), db (PostgreSQL 16 Alpine), cache (Redis 7 Alpine).
- API depends on db (health check: pg_isready) and cache.
- Ports: 3000 (API), 5432 (PostgreSQL), 6379 (Redis).
- Named volumes: pgdata (Postgres), redisdata (Redis) — data persists across restarts.
- No network definition — uses default bridge network.
- No .env file — environment variables hardcoded in compose file (development only).
- Dockerfile uses multi-stage build: builder (node:22-alpine, full toolchain) → runner (node:22-alpine, minimal output).

### 6.2 Production Deployment (AWS)
- Target: ECS Fargate with multi-stage Docker build.
- Database: RDS Aurora (PostgreSQL-compatible).
- Cache: ElastiCache (Redis).
- Storage: S3 bucket.
- CI/CD: GitHub Actions with build → test → deploy → health check stages.
- Estimated monthly cost: ~$405 production, ~$145 staging, ~$77 development.
- AWS CDK (TypeScript) for infrastructure as code.
- Route 53 → CloudFront → ALB → ECS Fargate architecture.
- Multi-AZ deployment for disaster recovery (RPO 5 min, RTO 15 min).

### 6.3 Environment Configuration
- 23 environment variables across backend configuration.
- ConfigService validates all env vars with Zod schema at startup (fail-fast).
- DATABASE_URL is the only truly required field — app crashes if missing.
- All other vars have defaults or are optional.
- AWS credentials, SMTP credentials, and Twilio credentials are optional with graceful fallback.

---

## 7. Database Schema Summary (31 Models)

### 7.1 Core Business Models (17)
- User: phone, email, passwordHash, role (default "player"), city relation, OTP fields (otpHash, otpExpiresAt).
- Ground: name, ownerId, address, city, region, lat/lng, description, contactPhone, isVerified, isActive, deletedAt.
- Court: groundId, name, sportType, basePrice (Decimal 12,2), pricePerHour (Decimal 12,2), depositAmount (Decimal 12,2), maxPlayers, amenities (JSON), isActive, deletedAt.
- Booking: groundId, courtId, playerId, date, startTime, endTime, totalAmount, depositAmount, status (BookingStatus enum), deletedAt.
- BookingFinance: bookingId (unique), totalAmount, onlineReceived, offlineReceived, paymentStatus (PaymentStatus enum).
- BookingPayment: bookingId, amount, channel, paymentMethodId, idempotencyKey (unique), recordedById. Append-only.
- GroundAccess: userId, groundId, accessRole (AccessRole enum), isActive. Unique constraint on (groundId, userId).
- GroundSetting: groundId (unique), allowOnlineBooking, allowWalkinBooking, requireDeposit, depositPercentage, cancellationPolicy, advanceBookingDays, minBookingDuration, maxBookingDuration. One-to-one with Ground.
- Team: name, sportCategoryId, rating (default 1200), wins, losses, draws, isActive, deletedAt.
- TeamMember: teamId, userId, role (TeamMemberRole enum), jerseyNumber. Unique constraint on (teamId, userId).
- TeamMatch: team1Id, team2Id, courtId, matchDate, scores, winnerId, status, roundType (MatchRoundType enum).
- MatchRequest: fromTeamId, toTeamId, proposedDate, status (MatchRequestStatus enum).
- Tournament: name, sportType, format, entryFee (Decimal 12,2), prizePool (Decimal 12,2), maxTeams, status (TournamentStatus enum), startDate, endDate, registrationDeadline.
- TournamentMatch: tournamentId, round, matchOrder, team1Id, team2Id, scores, winnerId, courtId, status (TournamentMatchStatus enum).
- MatchRating: matchId, raterId, ratedTeamId, skillRating (1-5), sportsmanshipRating (1-5), punctualityRating (1-5), reviewText.
- PlayerStat: userId, sportCategoryId, matchesPlayed, wins, goalsScored, assists, manOfMatch, ratingAverage. Aggregate per user per sport.
- PlayerMatchStat: matchId, teamId, userId, goalsScored, assists, isManOfMatch, performanceRating. Per-match per-player.

### 7.2 Supporting Models (14)
- GroundImage: groundId, url, isPrimary, displayOrder.
- GroundSchedule: groundId, dayOfWeek (0-6), openTime, closeTime, slotDuration, isActive.
- GroundInvite: groundId, inviteePhone, accessRole (AccessRole enum), status (InviteStatus enum), expiresAt.
- GroundPaymentMethod: groundId, paymentMethodId, isEnabled. Junction table.
- PaymentMethod: methodId, label, type, category, icon, displayOrder, isEnabled, isGlobal, metadata (JSON).
- RegionPaymentMethod: regionId, paymentMethodId, isEnabled. Region-level overrides.
- Region: name (unique), code (unique), isActive.
- City: name, regionId, displayOrder, isActive.
- Notification: userId, title, body, type, metadata (JSON), status (NotificationStatus enum), retryCount, readAt, deletedAt.
- ChatMessage: groundId, senderId, content, deletedAt. Soft-deletable.
- ChatParticipant: groundId, userId, lastReadAt. Unique constraint on (groundId, userId).
- TournamentTeam: tournamentId, teamId, isVerified.
- CashSession: groundId, openedById, closedById, openingCash (Decimal 12,2), closingCash (Decimal 12,2), expectedCash (Decimal 12,2), variance (Decimal 12,2), status (CashSessionStatus enum), openedAt, closedAt.
- CashSessionPayment: cashSessionId, bookingPaymentId. Links cash sessions to payments.
- UnreadCount: userId, groundId, count. Materialized via ON CONFLICT DO UPDATE pattern.
- AuditLog: action, entityType, entityId, performedById, ipAddress, groundId, metadata (JSON). Append-only.
- AppLog: correlationId, level, event, userId, groundId, bookingId, metadata (JSON). TTL-managed.

### 7.3 Enums (10)
- BookingStatus: pending_payment_verification, approved, rejected, expired, cancelled, completed.
- PaymentStatus: unpaid, partial, paid, overpaid.
- AccessRole: owner, manager, staff.
- NotificationStatus: queued, sent, failed, dead_letter.
- InviteStatus: pending, accepted, rejected, expired.
- CashSessionStatus: open, closed, reconciled.
- TournamentStatus: upcoming, registration_open, registration_closed, ongoing, completed, cancelled.
- TournamentMatchStatus: scheduled, ongoing, completed, cancelled, forfeited.
- TeamMemberRole: captain, co_captain, player.
- TeamInviteStatus: pending, accepted, rejected, expired.
- MatchRequestStatus: pending, accepted, rejected, cancelled, expired.
- TeamMatchStatus: scheduled, ongoing, completed, cancelled, forfeited.
- MatchRoundType: friendly, league, knockout, group_stage.

---

## 8. Planned SaaS Features & Current Gaps

> **Status:** The following features are NOT yet implemented. They represent the gap between the current MVP and a production-grade SaaS platform. Each feature is specified as discrete single-point items for future implementation.

### 8.1 Subscription & Billing Model (SaaS Monetization)

**Tiered Subscription Plans**
- Ground owners must subscribe to a paid plan to list venues and accept bookings.
- Free tier allows exactly 1 ground listing with up to 3 courts, basic analytics, and 5% platform commission per booking.
- Starter tier ($19/month or PKR equivalent) allows up to 3 grounds, 10 courts per ground, basic analytics, staff management, and 3% platform commission.
- Professional tier ($49/month) allows unlimited grounds, unlimited courts, full analytics suite, dynamic pricing, CRM tools, and 1% platform commission.
- Enterprise tier ($99/month) includes everything plus dedicated support, custom branding, API access, and 0% commission.
- Each tier has a max_bookings_per_month soft cap with overage fees.
- Tier downgrade at end of billing cycle (no mid-cycle downgrades).
- Tier upgrade takes effect immediately with prorated billing.

**Recurring Subscription Management**
- Subscriptions auto-renew monthly or yearly (owner chooses billing cycle).
- Yearly subscription offers 2 months free (pay 10 months for 12).
- Payment failures trigger 3 retries over 7 days.
- After 7 days of failed payment, subscription moves to past_due status.
- After 14 days past_due, subscription is suspended — grounds become invisible in search, existing bookings honored but new bookings disabled.
- After 30 days past_due, subscription is cancelled — all grounds soft-deactivated.
- Owner receives email notifications at day 0 (payment failed), day 3, day 7 (warning), day 14 (suspended), day 30 (cancelled).
- Subscriptions are managed via SubscriptionPlan table with planId, name, price, interval (monthly/yearly), features JSON, maxGrounds, maxCourtsPerGround, commissionRate.
- Subscription table tracks: groundOwnerId, planId, status (active/past_due/suspended/cancelled/expired), currentPeriodStart, currentPeriodEnd, cancelledAt.
- Subscription status transitions: active → past_due (payment failed) → suspended (14 days) → cancelled (30 days).
- Subscription status transitions: active → cancelled (owner cancels) → expired (end of billing cycle).
- Feature gating is enforced at the backend Guard/Interceptor level — all ground owner endpoints check subscription status and tier limits.

**Automated Invoicing**
- Invoice is generated at the start of each billing cycle.
- Invoice includes: plan name, billing period, amount, commission summary, previous period usage stats.
- Invoice PDF is generated and sent via email.
- Invoice statuses: pending, paid, overdue, cancelled, refunded.
- Invoice records have unique invoiceNumber format: INV-{YYYYMM}-{sequential}.
- Payment gateway integration (Stripe/JazzCash API) for invoice payment.
- Successful payment triggers webhook that updates subscription status, clears past_due/suspended flags.

**Feature Gating Logic**
- Backend FeatureGateGuard checks subscription tier before allowing ground creation, court addition beyond tier limit, analytics access, CRM tool access, dynamic pricing toggles.
- Frontend conditionally renders/hides features based on user subscription tier.
- Exceeding maxGrounds or maxCourtsPerGround blocks new creation with clear error message.
- Commission rate is applied at booking payment recording time (platformFee = totalAmount × commissionRate).

**New Database Models for Subscriptions**
- SubscriptionPlan: planId (uuid), name, price (Decimal 12,2), interval (monthly/yearly), maxGrounds (int), maxCourtsPerGround (int), maxBookingsPerMonth (int), commissionRate (Decimal 5,4), features (JSON), isActive, sortOrder.
- GroundOwnerSubscription: subscriptionId (uuid), groundOwnerId (uuid, FK to User), planId (uuid, FK to SubscriptionPlan), status (SubscriptionStatus enum), currentPeriodStart (timestamp), currentPeriodEnd (timestamp), stripeCustomerId (string?), stripeSubscriptionId (string?), cancelledAt (timestamp?), createdAt, updatedAt.
- Invoice: invoiceId (uuid), subscriptionId (uuid, FK to GroundOwnerSubscription), groundOwnerId (uuid), invoiceNumber (string, unique), amount (Decimal 12,2), status (InvoiceStatus enum), periodStart, periodEnd, paidAt (timestamp?), paymentMethod, paymentGatewayReference (string?), createdAt.
- SubscriptionStatus enum: active, past_due, suspended, cancelled, expired.
- InvoiceStatus enum: pending, paid, overdue, cancelled, refunded.

### 8.2 Multi-Tenancy & Enhanced Venue Management

**Granular Sub-Account Hierarchy**
- A ground owner can manage multiple distinct venue locations from a single account.
- Each venue is an independent tenant with its own GroundAccess roles.
- Owner can delegate venue-specific managers who operate independently — Manager A cannot access Venue B's data.
- GroundAccess role hierarchy: owner (full control, can delete venue) → manager (ops, staff management, reports) → staff (bookings, cash, walk-ins only).
- Owner can set operating hours, pricing, and settings per venue independently.
- Owner dashboard shows aggregate metrics across all venues plus per-venue drill-down.
- Owner can transfer venue ownership to another user (both must confirm via email).

**Venue-Specific Unique Configuration**
- Each venue has independent: operating hours per day, holiday closures, slot duration, pricing per court, deposit rules, cancellation policy, payment methods accepted.
- Venue closure dates (holidays/maintenance) are managed via GroundClosure table.
- GroundClosure: groundId, startDate, endDate, reason, isRecurring (yearly). During closure, all slots for those dates return isAvailable: false.

**Role-Based Dashboard Views**
- Owner global dashboard: all venues overview, revenue across venues, top-performing venues, alerts.
- Venue manager dashboard: single-venue focus, daily ops, staff schedule, booking queue, cash session status.
- Staff dashboard: today's bookings list, walk-in booking form, payment recording form, cash session controls.
- Super-admin dashboard: platform-wide metrics, subscription revenue, commission earned, active/past_due/cancelled counts, top grounds by revenue.

**New/Extended Database Models for Multi-Tenancy**
- GroundClosure: closureId (uuid), groundId (uuid, FK), startDate, endDate, reason, isRecurring (boolean), createdAt. (NEW)
- TransferOwnershipRequest: requestId (uuid), groundId (uuid), fromUserId (uuid), toUserId (uuid), status (TransferStatus enum: pending/approved/rejected/expired), expiresAt, createdAt. (NEW)
- Extend AccessRole enum: owner, manager, staff, accountant (new role with finance-only access).

### 8.3 Analytics & Business Intelligence Dashboard

**Revenue Analytics**
- Daily revenue chart (last 30 days, with previous period comparison).
- Monthly revenue breakdown by payment method (cash vs JazzCash vs Easypaisa vs card vs bank transfer).
- Revenue by sport category (futsal vs basketball vs cricket vs badminton).
- Platform commission earned vs ground owner net revenue.
- Revenue forecasting based on 7-day moving average and year-over-year comparison.
- MTD (Month-to-Date) and YTD (Year-to-Date) revenue summaries.
- Average revenue per booking and per court.

**Booking Utilization Analytics**
- Peak-hour heatmap: day-of-week × hour-of-day grid showing booking density (0-100% utilization).
- Court utilization rate: booked slots / total available slots, per court and per venue.
- Utilization trend line (last 90 days) to identify growing or declining demand.
- Most and least booked time slots across the venue.
- Average booking lead time (how far in advance users book).
- Booking cancellation rate (%) with trend.
- Walk-in vs online booking ratio.

**Customer & Retention Metrics**
- Total unique customers (players who booked at least once).
- Repeat booking rate: % of customers with 2+ bookings.
- Average bookings per customer.
- Customer acquisition trend (new vs returning customers per month).
- Top 10 most active players.
- Inactive player count (no booking in 90 days) for re-engagement campaigns.

**Operational Analytics**
- Average cash session variance (shortage/overage) per staff member.
- Most profitable courts (by revenue).
- Least profitable courts (by revenue) — candidates for price adjustment.
- Peak booking days (day-of-week breakdown).
- On-time booking start vs late start rates.
- Average match completion time.

**Analytics Implementation Requirements**
- Analytics data is pre-computed via nightly cron jobs (not queried live on large datasets).
- Aggregated data stored in AnalyticsSnapshot table: metricName, metricValue, dimension (groundId/sportType/day/hour), period (daily/weekly/monthly), snapshotDate.
- Analytics endpoint GET /grounds/:id/analytics returns dashboard data with startDate/endDate filter.
- Analytics endpoint GET /grounds/:id/analytics/revenue-forecast returns forecasted revenue.
- Analytics endpoint GET /admin/analytics returns platform-wide analytics (super-admin only).
- Analytics endpoint GET /grounds/:id/analytics/utilization-heatmap returns 7×24 grid.
- Frontend uses recharts for chart rendering (line, bar, area, heatmap chart types).
- Charts support date range picker and drill-down (click chart segment for detail).
- Analytics data refresh indicator shows last snapshot timestamp.
- Download report as CSV button on all analytics views.

**New Database Models for Analytics**
- AnalyticsSnapshot: snapshotId (uuid), metricName (string), metricValue (Decimal 15,2), dimension (string — e.g., groundId, sportType, staffId), dimensionValue (string), period (enum: daily/weekly/monthly), snapshotDate, createdAt. Indexed on (metricName, period, snapshotDate) and (dimension, dimensionValue).
- DailyAggregation: aggregationId (uuid), groundId (uuid), date, totalBookings, totalRevenue (Decimal 12,2), totalCommission (Decimal 12,2), totalCashCollected (Decimal 12,2), totalOnlineCollected (Decimal 12,2), newCustomers (int), returningCustomers (int), bookingCancellations (int), walkInCount (int), avgBookingValue (Decimal 12,2), utilizationRate (Decimal 5,4), createdAt. Unique on (groundId, date).

### 8.4 Automated Customer Communications (CRM)

**Transactional Communication Triggers**
- Booking confirmation: sent immediately after booking is created. Includes ground name, court, date, time, amount, deposit required, cancellation policy.
- Booking approved: sent when staff approves booking. Includes confirmation code, directions link.
- Booking reminder: sent 24 hours before booking time. Includes ground name, court, time, weather note.
- Booking completion follow-up: sent 2 hours after booking end time. Includes link to rate the ground and submit peer reviews.
- Match challenge received: push notification + email to receiving team captain.
- Match confirmed: notification to both teams with date, time, venue.
- Match reminder: 2 hours before match time to both team captains.
- Team invitation: notification + email to invited player.
- Join request: notification to team captain.
- Payment receipt: notification + email with payment details and booking reference.
- Subscription payment reminder: 3 days before renewal.
- Subscription payment failed: day 0, 3, 7 (warning), 14 (suspended), 30 (cancelled).

**Promotional Broadcast Tools**
- Ground owner can send promotional broadcasts to all players who have booked at their venue(s).
- Broadcast channels: in-app notification + email. Optional: SMS/WhatsApp (requires additional integration).
- Broadcast frequency limit: max 2 broadcasts per month per ground to prevent spam.
- Broadcast content: subject (max 100 chars), body (max 2000 chars), optional CTA button (label + URL).
- Broadcast audience filterable by: booking recency (last 30/60/90 days), sport preference, booking frequency.
- BroadcastUsage table tracks: broadcastId, groundId, sentById, subject, body, audienceCount, sentAt. Enforces monthly limit.
- Broadcast analytics: sent count, delivered count, click rate on CTA (if applicable).

**SMS and WhatsApp Integration Requirements**
- Twilio or WhatsApp Business API integration for SMS/WhatsApp messages.
- Opt-in requirement: users must consent to SMS/WhatsApp communication during signup or profile settings.
- User profile includes optInSms and optInWhatsapp boolean flags (default false).
- Message template management: pre-approved templates for each message type to comply with WhatsApp policy.
- Outbound message queue via existing Bull infrastructure (notification-delivery queue).
- Message delivery status tracking: queued, sent, delivered, failed, read (WhatsApp only).

**Re-Engagement Campaigns (Automated)**
- Inactive player (no booking in 60 days): automated email "We miss you! Book your favorite court and get 10% off."
- Inactive team (no match in 30 days): automated notification to captain "Your team hasn't played in a while. Challenge a team today!"
- Unread notification reminder: weekly digest for users with unread notifications.
- Subscription expiring: email series at T-30, T-14, T-7, T-3, T-1 days.
- Subscription lapsed (cancelled): email at T+1, T+7, T+30 with re-activation offers.

**New Database Models for CRM**
- BroadcastMessage: broadcastId (uuid), groundId (uuid), sentById (uuid, FK to User), subject (string), body (string), ctaLabel (string?), ctaUrl (string?), audienceFilter (JSON), audienceCount (int), sentCount (int), deliveredCount (int), clickCount (int), createdAt. Enforces 2/month per ground.
- MessageTemplate: templateId (uuid), channel (enum: sms/whatsapp/email), templateName (string), templateBody (string), variables (JSON — list of variable names), isApproved (boolean), createdAt.
- CommunicationLog: logId (uuid), userId (uuid), channel (enum: email/sms/whatsapp/push/in-app), messageType (string), templateId (uuid?), referenceType (string — booking/match/subscription), referenceId (uuid), status (enum: queued/sent/delivered/failed/read), sentAt, deliveredAt, readAt, errorMessage (string?), createdAt.
- UserCommunicationPreference: userId (uuid), optInEmail (boolean, default true), optInSms (boolean, default false), optInWhatsapp (boolean, default false), optInPush (boolean, default true), updatedAt.

### 8.5 Dynamic Pricing Engine

**Peak/Off-Peak Hour Pricing Rules**
- Ground owner defines time-based pricing rules per court or per sport.
- Each rule has: dayOfWeek (0-6 or * for all), startTime, endTime, priceMultiplier (Decimal 3,2, e.g., 1.5 for 50% surge).
- Peak hours (e.g., evenings 6PM-10PM, weekends) apply multiplier > 1.0 (e.g., 1.5×).
- Off-peak hours (e.g., weekday mornings 6AM-12PM) apply multiplier < 1.0 (e.g., 0.7× for 30% discount).
- Standard hours apply multiplier = 1.0 (base price).
- Multiple rules per day with time ranges must not overlap (validation on save).
- Rule with highest priority (most specific dayOfWeek match) wins when multiple rules cover same time.

**Weekend Surge Pricing**
- Saturday and Sunday automatically apply configurable weekend multiplier (default 1.25×).
- Weekend multiplier is overridable per ground.
- Special holiday pricing: owner can mark specific dates as holidays and set custom multiplier.
- Holiday pricing overrides both peak and weekend rules.

**Discount Coupon Code Management**
- Coupon codes are created by ground owners or super-admins.
- Coupon types: percentage (e.g., 10% off), fixed_amount (e.g., PKR 500 off).
- Coupon constraints: minBookingAmount, maxDiscountAmount, usageLimit (total uses), perUserLimit (uses per user), validFrom, validUntil, applicableSportIds (array of sport IDs).
- Coupon code is alphanumeric, 6-12 characters, case-insensitive.
- Coupon is applied at booking creation — discount is calculated on totalAmount before deposit.
- CouponUsage table tracks: couponId, bookingId, userId, discountAmount, appliedAt. Enforces usage limits.
- Coupon eligibility check endpoint POST /coupons/validate returns discount amount if valid.
- Expired or fully-used coupons return clear error message.

**Dynamic Rule Application Algorithm**
- When calculating slot price, the engine evaluates all applicable PricingRule records for the slot's day and time.
- Rules are prioritized: specific dayOfWeek > wildcard dayOfWeek.
- Within same day, more recently created rule wins ties.
- Holiday-specific price overrides all other rules.
- Final slot price = court.basePrice × highestPriorityRule.priceMultiplier (or 1.0 if no rule matches).
- If a coupon is applied, final price = slotPrice - couponDiscount (capped at minBookingAmount if > 0).

**New Database Models for Dynamic Pricing**
- PricingRule: ruleId (uuid), groundId (uuid), courtId (uuid? — null means all courts), sportCategoryId (uuid? — null means all sports), dayOfWeek (int, 0-6, or -1 for all), startTime (time), endTime (time), priceMultiplier (Decimal 3,2), isActive, priority (int), createdAt. Constraint: no overlapping time ranges for same (groundId, courtId, dayOfWeek).
- HolidayPricing: holidayPricingId (uuid), groundId (uuid), name (string — e.g., "Eid Special"), date (date), priceMultiplier (Decimal 3,2), isActive, createdAt. Unique on (groundId, date).
- Coupon: couponId (uuid), groundId (uuid? — null means platform-wide), code (string, unique, 6-12 chars), type (enum: percentage/fixed_amount), value (Decimal 12,2), minBookingAmount (Decimal 12,2? — null means no min), maxDiscountAmount (Decimal 12,2? — null means no cap), usageLimit (int? — null means unlimited), perUserLimit (int? — null means unlimited), usedCount (int), validFrom (timestamp), validUntil (timestamp), applicableSportIds (uuid[]), isActive, createdById (uuid), createdAt.
- CouponUsage: usageId (uuid), couponId (uuid), bookingId (uuid), userId (uuid), discountAmount (Decimal 12,2), appliedAt. Unique on (couponId, bookingId) — one coupon per booking.

### 8.6 Dispute & Refund Resolution Workflow

**Booking Cancellation Workflow**
- Player can cancel own booking up to N hours before start time (configurable per ground via cancellationPolicy in GroundSetting).
- Early cancellation (>= cancellationPolicy hours before): full refund minus 10% processing fee.
- Late cancellation (< cancellationPolicy hours before): 50% refund.
- No-show (booking not started within 30 minutes of start time): no refund, booking auto-marked as completed with no-show flag.
- Same-day cancellation by ground staff: full refund at staff discretion.
- Refund is processed as a negative BookingPayment record (append-only ledger) with type = "refund".
- RefundPayment record: bookingId, amount, reason, processedById, refundMethod (original payment method), processedAt.

**No-Show Penalty System**
- Player accumulates noShowCount on their profile.
- 3 no-shows within 30 days: player is restricted from booking for 7 days.
- 5 no-shows within 90 days: player is restricted from booking for 30 days.
- 10+ no-shows within 365 days: account flagged for super-admin review, possible permanent ban.
- No-show count is reset annually (Jan 1).
- Ground owner can dispute a no-show flag if player was present but system failed to mark start.
- No-showPenalty table: penaltyId, userId, bookingId, reason (automated), status (pending/waived/confirmed), disputedById (ground owner), resolvedAt, resolvedById.

**Dispute Filing and Moderation**
- Any party can file a dispute: player (booking issue, payment issue), ground staff (no-show, damage), team captain (match score disagreement), ground owner (payment dispute).
- Dispute form captures: disputeType (booking/payment/match/damage/other), referenceId (bookingId/paymentId/matchId), description (max 2000 chars), supportingImageUrls (JSON array of S3 URLs).
- Dispute statuses: submitted, under_review, resolved, rejected, escalated.
- Initial assignment: auto-assigned to ground staff/manager for ground-level disputes.
- Escalation: if not resolved in 48 hours, auto-escalated to super-admin.
- Super-admin can resolve, reject, or request more information.
- Resolution includes: resolutionNotes, action (full_refund/partial_refund/no_refund/penalty_waived/other), resolvedAt, resolvedById.
- Resolution with refund action auto-creates a refund payment record.
- Both parties receive notification on dispute status change.
- Dispute table: disputeId, disputeType, referenceType, referenceId, filedById, description, supportingImageUrls (JSON), status, assignedToId, escalationLevel (int), escalatedAt, resolvedById, resolutionNotes, resolutionAction, resolvedAt, createdAt.

**Match Score Disputes**
- If dual-confirmation scores don't match after 48 hours, match is flagged for moderation.
- Either captain can file a match score dispute via dispute system.
- Super-admin reviews submitted scores from both teams and supporting evidence (screenshots).
- Super-admin can: accept scores from Team A, accept scores from Team B, declare a draw, or void the match (no rating change).
- Voided matches are excluded from ELO calculations.
- Match dispute resolution overrides previous score entries.

**Damage and Security Deposit Handling**
- Grounds with requireDeposit = true collect a depositAmount at booking time.
- If no damage reported within 2 hours after booking end, deposit is auto-released.
- Staff can file a damage claim within 2 hours of booking end.
- Damage claim includes: description, photo evidence (uploaded via booking-proof upload), estimated repair cost.
- Deposit can be partially or fully withheld based on damage assessment.
- DamageClaim table: claimId, bookingId, groundId, filedById, description, imageUrls (JSON), estimatedCost (Decimal 12,2), withheldAmount (Decimal 12,2), status (pending/approved/rejected), resolvedById, resolvedAt.
- Withheld deposit is recorded as negative payment in BookingPayment.

**New/Extended Database Models for Disputes**
- Dispute: disputeId (uuid), disputeType (enum: booking/payment/match/damage/no_show/other), referenceType (string — booking/payment/match), referenceId (uuid), filedById (uuid), description (string), supportingImageUrls (JSON), status (enum: submitted/under_review/resolved/rejected/escalated), assignedToId (uuid), escalationLevel (int, default 0), escalatedAt (timestamp?), resolvedById (uuid?), resolutionNotes (string?), resolutionAction (enum: full_refund/partial_refund/no_refund/penalty_waived/other), resolvedAt (timestamp?), createdAt.
- DamageClaim: claimId (uuid), bookingId (uuid), groundId (uuid), filedById (uuid), description (string), imageUrls (JSON), estimatedCost (Decimal 12,2), withheldAmount (Decimal 12,2), status (enum: pending/approved/rejected), resolvedById (uuid?), resolvedAt (timestamp?), createdAt.
- NoShowPenalty: penaltyId (uuid), userId (uuid), bookingId (uuid), reason (string), status (enum: pending/waived/confirmed), disputedById (uuid?), resolvedAt (timestamp?), createdAt. Indexed on (userId, status) and (userId, createdAt).

### 8.7 Geolocation & Radius Search

**Map-Integrated Radius Search**
- Users can search for grounds within a configurable radius of a center point.
- Search accepts: latitude, longitude, radius (in km, default 10, max 50), optional sport/city filters.
- Radius search uses the Haversine formula (already implemented in GeoUtil) to calculate distance.
- Results are sorted by distance (nearest first).
- Each result includes: distance from search point (formatted as "1.2 km away"), estimated travel time (based on average city speed 30km/h).
- Results also include: ground name, primary image, rating (if available), base price range, isVerified badge.
- Search is available on the homepage hero/search bar with a "Near Me" button that requests browser geolocation.

**Map Visualization**
- Ground locations are rendered as interactive map markers using Leaflet (open-source map library).
- Marker popups show: ground name, image thumbnail, distance, price range, quick "View Details" link.
- Cluster markers for dense areas (standard Leaflet.markercluster).
- Current user location is shown as a distinct blue dot marker.
- Map supports: zoom in/out, drag pan, satellite view toggle, fullscreen mode.
- Search results list syncs with map — clicking a list item highlights that marker.
- Map viewport change triggers new search (recalculates center + radius).

**Turn-by-Turn Directions Integration**
- "Get Directions" button on ground detail page opens Google Maps/Apple Maps/Waze with pre-populated destination.
- On mobile web: deep links to installed navigation apps.
- On desktop: opens Google Maps in new tab with directions from user's selected start point.
- Start point defaults to user's browser geolocation, or user can enter a custom start address.
- Directions link format (Google Maps): https://www.google.com/maps/dir/{startLat},{startLng}/{groundLat},{groundLng}.
- Directions link format (Waze): https://waze.com/ul?ll={groundLat},{groundLng}&navigate=yes.

**Geolocation Database Enhancements**
- Ground stores latitude and longitude as Decimal(10, 7) — already in schema.
- Add a GIST index on coordinates for efficient radius queries (PostGIS extension).
- If PostGIS is not available, the Haversine formula is applied in application layer with bounding box pre-filter for performance.
- Bounding box pre-filter: calculate min/max lat/lng for the search radius, then filter in SQL with simple comparison before Haversine calculation.

**Geo-Utility Enhancements to GeoUtil**
- Existing GeoUtil (Haversine) is extended with:
  - getBoundingBox(lat, lng, radiusKm) → { minLat, maxLat, minLng, maxLng }.
  - getEstimatedTravelTime(distanceKm, averageSpeedKmph = 30) → minutes.
  - isWithinRadius(centerLat, centerLng, targetLat, targetLng, radiusKm) → boolean.
  - sortByDistance(grounds[], userLat, userLng) → sortedGrounds[] with distance field.
- All GeoUtil methods remain pure functions (no side effects, no dependencies).

**New/Modified Endpoints for Geo Search**
- POST /grounds/nearby: body { lat, lng, radiusKm, sport?, city?, page?, limit? }. Returns paginated results with distance and estimatedTravelTime.
- Optionally extend GET /grounds to accept lat, lng, radiusKm query parameters.
- Frontend API client groundsApi updated with nearby() method.
- Frontend geoNearby page or geo-enabled home page component.

**New Database Indexes for Geo Search**
- CREATE INDEX IF NOT EXISTS grounds_coordinates_idx ON grounds (latitude, longitude) WHERE deletedAt IS NULL AND isVerified = true AND isActive = true.
- If PostGIS: CREATE INDEX grounds_geog_idx ON grounds USING GIST (geography(Point(latitude, longitude))).

---

## 9. Updated Executive Summary with SaaS Model

### 9.1 Revised Primary Purpose and Scope (SaaS Edition)
- PlayArena is a SaaS sports community platform targeting the Pakistan market with tiered subscription monetization.
- Ground owners pay recurring subscription fees (monthly/yearly) to list venues, access analytics, CRM tools, and dynamic pricing.
- The platform earns revenue through subscription fees AND per-booking commission (percentage varies by tier).
- Free tier exists for trial/entry-level ground owners with limited features and higher commission.
- All platform payments (subscriptions, commissions) are processed through third-party gateways — the platform records ledger entries.
- The platform provides geolocation-based ground discovery with map visualization and directions.
- Ground owners receive automated CRM tools for player re-engagement and promotional broadcasts.

### 9.2 Revised Target User Personas (SaaS Edition)
- **Ground Owner (Paying Subscriber)**: Subscribes to a paid plan, manages multiple venues, accesses analytics, uses CRM tools, creates dynamic pricing rules and coupons.
- **Ground Manager**: Venue-specific operator with standalone dashboard, analytics view, staff management.
- **Ground Staff**: Front-desk operator handling bookings, cash sessions, walk-ins, payment recording.
- **Player**: End-user who discovers grounds via geolocation search, books courts, joins teams, participates in matches.
- **Super Admin**: Platform operator managing subscriptions, disputes, platform-wide analytics, commission earnings, user moderation.

### 9.3 Revised Core Business Goals (SaaS Edition)
- Generate recurring revenue through tiered ground owner subscriptions with commission on bookings.
- Provide ground owners with business intelligence (utilization heatmaps, revenue forecasting, retention metrics).
- Enable dynamic pricing (peak/off-peak, weekend surge, coupons) to maximize ground owner revenue.
- Automate customer communications (booking reminders, match confirmations, re-engagement campaigns).
- Provide fair dispute resolution workflow for booking cancellations, refunds, no-show penalties, and match score disputes.
- Enable geolocation-based ground discovery with map integration and directions.
- Maintain append-only audit trail for all financial, subscription, and dispute transactions.

### 9.4 Additional New Enums (SaaS Edition)
- SubscriptionStatus: active, past_due, suspended, cancelled, expired.
- InvoiceStatus: pending, paid, overdue, cancelled, refunded.
- DisputeStatus: submitted, under_review, resolved, rejected, escalated.
- DisputeType: booking, payment, match, damage, no_show, other.
- ResolutionAction: full_refund, partial_refund, no_refund, penalty_waived, other.
- CouponType: percentage, fixed_amount.
- CommunicationChannel: email, sms, whatsapp, push, in-app.
- CommunicationStatus: queued, sent, delivered, failed, read.
- BroadcastFrequencyLimit: max 2 per month per ground.
- NoShowPenaltyThresholds: 3 in 30 days → 7-day restriction, 5 in 90 days → 30-day restriction, 10 in 365 days → permanent ban review.
- TransferStatus: pending, approved, rejected, expired.

### 9.5 Updated Known Gaps Section
- All 8 subsections of Section 8 represent the complete list of missing SaaS features.
- These supersede and expand upon the gaps listed in Section 5.
- Implementation priority: Subscription & Billing (8.1) is highest priority — required for monetization.
- Geolocation (8.7) and Dynamic Pricing (8.5) are medium priority — differentiate the product.
- CRM (8.4), Analytics (8.3), and Disputes (8.6) are standard SaaS features for competitive parity.
- Multi-Tenancy (8.2) enhancements build on existing GroundAccess infrastructure.