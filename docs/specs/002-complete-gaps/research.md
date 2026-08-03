# Phase 0 Research: Backend API Contracts & Architecture

**Branch**: `002-complete-gaps` | **Date**: 2026-07-30 | **Plan**: [plan.md](./plan.md)

## Auth Architecture

**Mechanism**: JWT stored in httpOnly cookies (`accessToken` = 15min, `refreshToken` = 7d)  
**Validation**: `auth.middleware.js` reads `req.cookies.accessToken`, verifies with `jwt.verify(token, env.ACCESSTOKEN)`, sets `req.userId`  
**Cookie config**: both httpOnly=true, sameSite=lax, secure=false (dev)  
**Error on missing/invalid**: 401 "Access token required" / "Invalid or expired token"

### Auth Routes (`/api/user`)

| Method | Path | Auth | Body/Params | Response |
|--------|------|------|-------------|----------|
| POST | `/api/user/register` | Public | name, email, password, mobile | 201: `{ message, user }` + sets cookies |
| POST | `/api/user/verify-otp` | Public | email, otp (6-digit) | 200: `{ message }` |
| POST | `/api/user/resend-otp` | Public | email | 200: `{ message }` |
| POST | `/api/user/login` | Public | email, password | 200: `{ message, user }` + sets cookies |
| POST | `/api/user/refresh` | Public | refreshToken (cookie or body) | 200: `{ message }` + new cookies |
| POST | `/api/user/logout` | Public | — | 200: `{ message }` + clears cookies |
| GET | `/api/user/profile` | JWT | — | 200: `{ user }` |
| PATCH | `/api/user/profile` | JWT | name, avatar (URL) | 200: `{ message, user }` |
| GET | `/api/user/google` | Public | — | Redirects to Google OAuth |
| GET | `/api/user/google/callback` | Public | — | 201: `{ message, user }` + cookies |
| POST | `/api/user/forgot-password` | Public | email | 200: `{ message }` |
| GET | `/api/user/reset-password/:token` | Public | token param | 200: `{ userId, message }` |
| POST | `/api/user/update-password` | JWT | password | 200: `{ message, userId }` |

### Validation Rules (Auth)
- `name`: 2-50 chars, cannot be "admin"/"root"/"superuser"
- `email`: valid email, no "+" character
- `password`: 6-10 chars, min 1 digit, min 1 special character (!@#$%)
- `otp`: exactly 6 digits
- `mobile`: required string

## Ground Module (`/api/grounds`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/grounds` | Public | Query: city, isVerified |
| GET | `/api/grounds/featured` | Public | — |
| GET | `/api/grounds/regions` | Public | Returns all regions |
| GET | `/api/grounds/my` | JWT | User's managed grounds |
| GET | `/api/grounds/:id` | Public | Full detail |
| POST | `/api/grounds` | JWT | Create (auto-assigns owner) |
| PATCH | `/api/grounds/:id` | JWT | Owner only |
| DELETE | `/api/grounds/:id` | JWT | Owner only |
| GET | `/:groundId/courts` | Public | Court list |
| POST | `/:groundId/courts` | JWT | Owner/manager |
| PATCH | `/grounds/courts/:id` | JWT | Owner/manager |
| DELETE | `/grounds/courts/:id` | JWT | Owner/manager |
| GET | `/:groundId/schedules` | Public | Weekly schedule |
| PUT | `/:groundId/schedules/:day` | JWT | Owner/manager; day=0-6 |
| DELETE | `/:groundId/schedules/:day` | JWT | Owner/manager |
| PATCH | `/:groundId/settings` | JWT | Owner only |
| POST | `/:groundId/images` | JWT | Owner/manager |
| DELETE | `/:groundId/images/:imageId` | JWT | Owner/manager |
| POST | `/:groundId/invites` | JWT | Owner only |

**Full route paths**: All ground sub-routes are relative to `/api/grounds` (e.g., `/api/grounds/:id/courts`).

## Booking Module (`/api/bookings`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/bookings/courts/:courtId/slots` | Public | Query: date (YYYY-MM-DD) |
| POST | `/bookings` | JWT | Create with conflict detection |
| GET | `/bookings/my` | JWT | User's bookings |
| GET | `/bookings/:id` | JWT | Owner or ground staff |
| PATCH | `/bookings/:id/cancel` | JWT | Booking owner only |
| POST | `/bookings/:id/payment` | JWT | Ground staff; body: amount, channel, paymentMethod, idempotencyKey |
| GET | `/bookings/:id/finance` | JWT | Ground staff |
| PATCH | `/bookings/:id/status` | JWT | Ground staff; body: status, reason |
| POST | `/api/grounds/:groundId/walkin` | JWT | Ground staff (mounted in app.js) |
| GET | `/api/grounds/:groundId/bookings` | JWT | Ground staff (mounted in app.js) |

**Booking status machine**: `pending_payment_verification` → `approved`/`rejected`/`expired`/`cancelled` → `completed`

## Team Module (`/api/teams`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/teams/sports` | Public | Sport categories |
| GET | `/teams` | Public | Query: sport, cityId |
| GET | `/teams/my` | JWT | User's teams |
| GET | `/teams/:id` | JWT | Team member |
| POST | `/teams` | JWT | Create (auto-captain) |
| PATCH | `/teams/:id` | JWT | Captain/co-captain |
| DELETE | `/teams/:id` | JWT | Captain only |
| GET | `/:id/members` | JWT | Team member |
| PATCH | `/:id/members/:uid` | JWT | Captain/co-captain |
| DELETE | `/:id/members/:uid` | JWT | Captain/co-captain |
| DELETE | `/:id/members/me` | JWT | Member (not captain) |
| PATCH | `/:id/transfer-captaincy/:uid` | JWT | Captain only |
| POST | `/:id/invite` | JWT | Captain/co-captain |
| POST | `/:id/join-request` | JWT | Any user |
| GET | `/:id/join-requests` | JWT | Captain/co-captain |
| POST | `/:id/join-requests/:uid/accept` | JWT | Captain/co-captain |
| POST | `/:id/join-requests/:uid/reject` | JWT | Captain/co-captain |
| GET | `/:id/stats` | JWT | Team member |
| GET | `/:id/rating-history` | JWT | Team member |
| POST | `/join/:id` | JWT | Accept invite |
| DELETE | `/join/:id` | JWT | Reject invite |

## Matchmaking Module (`/api/matches`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/matches/requests/sent/:teamId` | JWT | Sent challenges |
| GET | `/matches/requests/received/:teamId` | JWT | Received challenges |
| POST | `/matches/requests/:teamId` | JWT | Captain/co-captain; body: opponentTeamId, groundId, proposedDate, message |
| PATCH | `/matches/requests/:id/accept` | JWT | Opponent captain |
| PATCH | `/matches/requests/:id/reject` | JWT | Opponent captain |
| PATCH | `/matches/requests/:id/cancel` | JWT | Challenger captain |
| GET | `/matches/:teamId` | JWT | Team member |
| GET | `/matches/detail/:id` | JWT | Match participant |
| PATCH | `/matches/:id/score` | JWT | Body: scoreChallenger, scoreOpponent |
| PATCH | `/matches/:id/start` | JWT | Match participant |
| PATCH | `/matches/:id/cancel` | JWT | Match participant |

## Tournament Module (`/api/tournaments`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/tournaments` | Public | Query: sport, status, format |
| GET | `/tournaments/my` | JWT | User's tournaments |
| GET | `/tournaments/:id` | Public | Detail |
| POST | `/tournaments` | JWT | Create; body: name, sport, format, maxTeams, etc. |
| PATCH | `/tournaments/:id` | JWT | Owner |
| DELETE | `/tournaments/:id` | JWT | Owner |
| POST | `/:id/register` | JWT | Body: teamId |
| POST | `/:id/withdraw` | JWT | Body: teamId |
| GET | `/:id/bracket` | Public | Bracket visualization |
| GET | `/:id/standings` | Public | Standings |
| POST | `/:id/matches/:matchId/result` | JWT | Owner; body: score1, score2 |
| POST | `/:id/generate-bracket` | JWT | Owner |

**Tournament formats**: `knockout`, `round_robin`, `group_knockout`
**Status machine**: `upcoming` → `registration_open` → `registration_closed` → `ongoing` → `completed`/`cancelled`

## Finance Module (`/api/finance`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/finance/payment-methods` | Public | All enabled methods |
| GET | `/finance/payment-methods/ground/:id` | JWT | Effective per ground |
| PATCH | `/finance/grounds/:id/payment-methods/:methodId` | JWT | Owner |
| GET | `/finance/grounds/:id/finance` | JWT | Owner/manager |
| GET | `/finance/grounds/:id/reports` | JWT | Owner/manager; query: startDate, endDate |
| POST | `/finance/grounds/:id/cash-session/open` | JWT | Staff; body: openingCash |
| POST | `/finance/grounds/:id/cash-session/:sessionId/close` | JWT | Staff; body: closingCash |
| GET | `/finance/grounds/:id/cash-sessions` | JWT | Owner/manager |
| GET | `/finance/admin/finance` | JWT | Super admin |

## Chat Module (`/api/chat`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/chat/unread` | JWT | Unread counts per ground |
| GET | `/chat/:id/messages` | JWT | Ground access; query: cursor (ISO datetime); max 51 per page |
| POST | `/chat/:id/messages` | JWT | Ground access; body: content (1-2000 chars) |
| POST | `/chat/:id/read` | JWT | Ground access |

## Notification Module (`/api/notifications`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/notifications` | JWT | Query: page, limit (max 50) |
| GET | `/notifications/unread-count` | JWT | — |
| PATCH | `/notifications/read-all` | JWT | — |
| PATCH | `/notifications/:id/read` | JWT | — |
| DELETE | `/notifications/:id` | JWT | Soft delete |

## Rating Module (`/api`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/leaderboard` | Public | Teams sorted by ELO desc |
| GET | `/api/leaderboard/:sportId` | Public | Filtered by sport |
| GET | `/api/players/:id/stats` | Public | Player aggregate stats |
| POST | `/api/matches/:id/rating` | JWT | Captain; body: skillRating, sportsmanshipRating, punctualityRating (all 1-5), reviewText |
| POST | `/api/matches/:id/player-stats` | JWT | Captain; body: playerId, goals, assists, yellowCards, redCards, motm |

## Admin Module (`/api/admin`)

All routes require `role === "super_admin"`.

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/admin/users` | Paginated; query: page, limit |
| GET | `/api/admin/users/:id` | User detail |
| GET | `/api/admin/grounds` | Paginated |
| PATCH | `/api/admin/grounds/:id/verify` | Verify ground |
| PATCH | `/api/admin/grounds/:id/suspend` | Suspend ground |
| GET | `/api/admin/teams` | Paginated |
| GET | `/api/admin/finance` | Platform finance |
| GET | `/api/admin/audit-logs` | Paginated |
| GET/POST | `/api/admin/regions[/:action/:id]` | CRUD (action=list/create/update/delete) |
| GET/POST | `/api/admin/cities[/:action/:id]` | CRUD |
| GET/POST | `/api/admin/sports[/:action/:id]` | CRUD |
| GET/POST | `/api/admin/payment-methods[/:action/:id]` | CRUD |

## Upload Module (`/api/upload`)

All use `multer` memory storage, field name `"file"`, max 10MB.

| Method | Path | Auth | File Rules |
|--------|------|------|-----------|
| POST | `/api/upload/:type` | JWT | Type-based MIME + size validation |
| POST | `/api/upload/ground-image/:groundId` | JWT | Owner/manager; JPEG/PNG/WebP ≤5MB |
| POST | `/api/upload/booking-proof/:groundId` | JWT | Staff; JPEG/PNG/WebP/PDF ≤10MB |
| POST | `/api/upload/tournament-poster` | JWT | Owner/manager via groundId |
| POST | `/api/upload/avatar` | JWT | JPEG/PNG/WebP ≤5MB; auto-updates user.avatar |

**Upload type validation**:
- `avatar`: JPEG/PNG/WebP, max 5MB
- `booking-proof`: JPEG/PNG/WebP/PDF, max 10MB
- `ground-image`: JPEG/PNG/WebP, max 5MB
- `team-logo`: JPEG/PNG/WebP, max 5MB
- `tournament-poster`: JPEG/PNG/WebP, max 5MB
- default: JPEG/PNG/WebP/PDF, max 10MB

## Health Module (`/api/health`)

| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/api/health` | Public | `{ status: "ok"/"degraded", timestamp, services: { database: { status, latencyMs } } }` |

## Socket.IO Events

### `/chat` namespace
- **Auth**: JWT via `handshake.auth.token` or `handshake.query.token`
- **Events**: `joinGround(groundId)`, `leaveGround(groundId)`, `sendMessage({ groundId, content })`, `typing({ groundId, isTyping })`
- **Server emits**: `newMessage`, `typing` (to others), `error`

### `/notifications` namespace
- **Auth**: JWT via `handshake.auth.token` or `handshake.query.token`
- **Auto-joins**: `user:{userId}` room on connection
- **Server emits**: `newNotification` (to specific user room)

## Environment Variables

| Variable | Default | Required |
|----------|---------|----------|
| DATABASE_URL | — | ✅ Yes |
| ACCESSTOKEN | — | ✅ Yes |
| REFRESHTOKEN | — | ✅ Yes |
| JWT_SECRET | min 32 chars | ✅ Yes |
| NODE_ENV | `development` | No |
| PORT | `3000` | No |
| AWS_REGION | `eu-north-1` | No |
| S3_BUCKET | `playarena-uploads-dev` | No |
| SMTP_HOST | `smtp.gmail.com` | No |
| SMTP_PORT | `587` | No |
| CORS_ORIGIN | `*` | No |
| BOOKING_EXPIRY_MINUTES | `30` | No |
| PAGINATION_DEFAULT_SIZE | `20` | No |

## Key Architectural Patterns

1. **3-layer**: Route → Controller/Service (combined in some modules) → Repository → Prisma
2. **Auth**: Cookie-based JWT with separate `ACCESSTOKEN`/`REFRESHTOKEN` secrets
3. **Pagination**: Page-based (page + limit) with total count; chat uses cursor-based
4. **Soft delete**: `deletedAt` nullable timestamp on Ground, Booking, Team, ChatMessage, Notification
5. **Append-only**: `BookingPayment`, `AuditLog` — never updated or deleted
6. **Idempotency**: `idempotencyKey` unique constraint on BookingPayment
7. **Validation**: Express-validator on select routes; body validation in service layer
8. **Error handling**: Custom `ApiError` class + global `errorHandler` middleware → `{ message }` JSON
9. **File upload**: Multer memory → S3 via `@aws-sdk/client-s3` and `@aws-sdk/lib-storage`
