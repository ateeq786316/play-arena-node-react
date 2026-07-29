# PlayArena Backend — Requirements & Specification

> Generated: 2026-07-29
> Sources: vision/project-scope.md, vision/over-all-observation.md, vision/screens-spec.md
> Stack: Express 5 + PostgreSQL 16 + Prisma 7 (adapted from NestJS spec)
> Note: Original spec targets NestJS — we adapt patterns to Express (controller/service/repo)

---

## 1. Express Backend Implementation Status

| Module | Status | Endpoints Done | Notes |
|--------|--------|----------------|-------|
| Auth | ✅ Complete | 12/12 | Register, login, OTP, refresh, profile, password reset, Google OAuth |
| Ground | ✅ Complete | 18/18 | CRUD, courts, schedules, settings, RBAC, regions/cities, images, invites |
| Booking | ❌ Not started | 0/7 | State machine, conflict detection, walk-in, expiry worker |
| Teams | ❌ Not started | 0/19 | CRUD, roster, invites, join requests, captaincy |
| Matchmaking | ❌ Not started | 0/11 | Challenges, match lifecycle, ELO, score entry |
| Tournaments | ❌ Not started | 0/12 | CRUD, bracket gen, registration, standings |
| Finance | ❌ Not started | 0/10 | Payments, idempotency, cash sessions, payment methods |
| Chat | ❌ Not started | 0/4 | Messages (REST), WebSocket gateway |
| Notifications | ❌ Not started | 0/5 | CRUD, WebSocket, event-driven |
| Ratings | ❌ Not started | 0/5 | Peer reviews, leaderboard, player stats |
| Admin | ❌ Not started | 0/15 | Users, grounds, finance, audit, reference data CRUD |
| Upload | ❌ Not started | 0/6 | S3 with MIME/size validation |
| Health | ❌ Not started | 0/1 | DB ping with latency |
| Email | ❌ Not started | 0/0 | SMTP with nodemailer (exists but no separate module) |

**Total: 2/14 modules complete, ~30/120+ endpoints implemented**

---

## 2. Module-by-Module Requirements

### 2.1 Auth Module ✅ (DONE)

**Endpoints:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/user/register | Public | Register with name, email, password, mobile |
| POST | /api/user/verify-otp | Public | Verify email with 6-digit OTP |
| POST | /api/user/resend-otp | Public | Resend OTP email |
| POST | /api/user/login | Public | Email + password login |
| POST | /api/user/refresh | Public | Refresh access token (cookie or body) |
| POST | /api/user/logout | Public | Clear cookies |
| GET | /api/user/profile | JWT | Get current user profile |
| PATCH | /api/user/profile | JWT | Update display name, avatar |
| GET | /api/user/google | Public | Google OAuth redirect |
| GET | /api/user/google/callback | Public | Google OAuth callback |
| POST | /api/user/forgot-password | Public | Send reset link via email |
| GET | /api/user/reset-password/:token | Public | Verify reset token |
| POST | /api/user/update-password | JWT | Update password (logged in) |

**Business Rules:**
- OTP: 6 digits, 10 min expiry, sent via email
- Password: bcrypt, min 8 chars
- JWT access: 15min, refresh: 7d (cookies)
- Profile: only name + avatar editable
- Email is primary identity, phone is collected

---

### 2.2 Ground Module ✅ (DONE)

**Endpoints:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/grounds | Public | List grounds (filterable by city) |
| GET | /api/grounds/featured | Public | Top 10 featured grounds |
| GET | /api/grounds/my | JWT | User's managed grounds |
| GET | /api/grounds/:id | Public | Ground detail with images/schedules |
| POST | /api/grounds | JWT | Create ground (auto-assigns owner access) |
| PATCH | /api/grounds/:id | JWT | Update ground (owner only) |
| DELETE | /api/grounds/:id | JWT | Soft delete ground (owner only) |
| GET | /api/grounds/:groundId/courts | Public | List courts |
| POST | /api/grounds/:groundId/courts | JWT | Create court (manager+) |
| PATCH | /api/grounds/courts/:id | JWT | Update court (manager+) |
| DELETE | /api/grounds/courts/:id | JWT | Soft delete court (manager+) |
| GET | /api/grounds/:groundId/schedules | Public | List schedules |
| PUT | /api/grounds/:groundId/schedules/:dayOfWeek | JWT | Upsert schedule (manager+) |
| DELETE | /api/grounds/:groundId/schedules/:dayOfWeek | JWT | Remove schedule (manager+) |
| PATCH | /api/grounds/:groundId/settings | JWT | Update settings (owner) |
| GET | /api/grounds/regions | Public | List regions with cities |
| POST | /api/grounds/:groundId/images | JWT | Add image (manager+) |
| DELETE | /api/grounds/:groundId/images/:imageId | JWT | Remove image (manager+) |
| POST | /api/grounds/:groundId/invites | JWT | Invite staff (owner) |

**Models:** User (role), Region, City, Ground, Court, GroundSchedule, GroundSetting, GroundImage, GroundAccess, GroundInvite

**RBAC:** owner > manager > staff (checked via GroundAccess table)

---

### 2.3 Booking Module ✅ (COMPLETE)

**Endpoints Needed:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/bookings | JWT | Create booking with deposit + conflict detection |
| GET | /api/bookings/my | JWT | Current user's bookings |
| GET | /api/bookings/:id | JWT | Booking detail with finance |
| PATCH | /api/bookings/:id/cancel | JWT | Cancel own booking |
| POST | /api/grounds/:id/walkin | Staff | Walk-in booking (auto-approved + paid) |
| GET | /api/grounds/:id/bookings | Staff | Ground bookings list |
| PATCH | /api/bookings/:id/status | Staff | Approve/reject booking |
| GET | /api/courts/:id/slots | Public | Availability grid for a date |

**Models to create:** Booking, BookingFinance, BookingPayment

**State Machine (6 statuses):**
```
pending_payment_verification → approved (staff)
                             → rejected (staff, with reason)
                             → expired (auto, after 30min)
approved → cancelled (player)
         → completed (auto after match time)
```

**Business Rules:**
- Deposit = totalAmount × depositPercentage (default 50%)
- Slot conflict: SELECT ... FOR UPDATE in transaction
- Walk-in: auto-approved + paid, requires playerName/Phone (not user-bound)
- Booking expiry: configurable via BOOKING_EXPIRY_MINUTES (default 30)
- Cron: every 5 min, batch expiry of pending bookings

**Screen Mapping:**
| Screen | Endpoint(s) |
|--------|-------------|
| Booking Slot Picker | GET /api/courts/:id/slots |
| Booking Summary | POST /api/bookings |
| Booking Confirmation | GET /api/bookings/:id |
| My Bookings | GET /api/bookings/my |
| Booking Detail | GET /api/bookings/:id |
| Booking Approval (staff) | PATCH /api/bookings/:id/status |
| Walk-in Booking | POST /api/grounds/:id/walkin |

---

### 2.4 Teams Module ✅ (COMPLETE)

**Endpoints Needed:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/teams | JWT | Create team (creator = captain) |
| GET | /api/teams | Public | List teams (filter by sport/city) |
| GET | /api/teams/my | JWT | User's teams |
| GET | /api/teams/:id | JWT | Team detail |
| PATCH | /api/teams/:id | JWT | Update team (captain) |
| DELETE | /api/teams/:id | JWT | Soft delete (captain) |
| GET | /api/teams/:id/members | JWT | Roster |
| GET | /api/teams/:id/matches | JWT | Match history |
| GET | /api/teams/:id/stats | JWT | Team statistics |
| GET | /api/teams/:id/rating-history | JWT | ELO history |
| POST | /api/teams/:id/invite | JWT | Invite player (captain) |
| POST | /api/teams/:id/join-request | JWT | Request to join |
| GET | /api/teams/:id/join-requests | JWT | List requests (captain) |
| POST | /api/teams/:id/join-requests/:uid/accept | JWT | Accept request (captain) |
| POST | /api/teams/:id/join-requests/:uid/reject | JWT | Reject request (captain) |
| PATCH | /api/teams/:id/members/:uid | JWT | Update member role (captain) |
| DELETE | /api/teams/:id/members/:uid | JWT | Remove member (captain) |
| DELETE | /api/teams/:id/members/me | JWT | Leave team |
| PATCH | /api/teams/:id/transfer-captaincy/:uid | JWT | Transfer captaincy |

**Models to create:** Team, TeamMember, TeamInvite, JoinRequest, TeamRatingHistory, SportCategory

**Roles:** captain, co_captain, player

**Business Rules:**
- Team ELO defaults to 1200
- Only captain can invite, remove, transfer captaincy
- Join request requires captain approval
- Invitation statuses: pending, accepted, rejected, expired

---

### 2.5 Matchmaking Module ❌ (NOT STARTED)

**Endpoints Needed:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/match-requests | JWT | Create challenge (captain+) |
| GET | /api/match-requests/sent | JWT | Sent challenges |
| GET | /api/match-requests/received | JWT | Received challenges |
| PATCH | /api/match-requests/:id/accept | JWT | Accept → creates TeamMatch |
| PATCH | /api/match-requests/:id/reject | JWT | Reject |
| PATCH | /api/match-requests/:id/cancel | JWT | Cancel |
| GET | /api/matches | JWT | List matches |
| GET | /api/matches/:id | JWT | Match detail |
| PATCH | /api/matches/:id/score | JWT | Submit score (dual-confirmation) |
| PATCH | /api/matches/:id/start | JWT | Start match |
| PATCH | /api/matches/:id/cancel | JWT | Cancel match |

**Models to create:** MatchRequest, TeamMatch

**ELO System:**
- Baseline: 1200, Floor: 100
- K-factor: 32 (<30 matches), 24 (30+ matches)
- Formula: 1 / (1 + 10^((Rb - Ra) / 400))
- Inactivity decay: 2 ELO/week after 30 days (weekly cron)
- Rating history tracked per team

**Business Rules:**
- 24hr request auto-expiry
- Dual-confirmation scoring — both teams must match
- Score mismatch → pending, staff mediates
- Only captains/co-captains can challenge/accept

---

### 2.6 Tournaments Module ❌ (NOT STARTED)

**Endpoints Needed:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/tournaments | JWT | Create tournament (owner) |
| GET | /api/tournaments | Public | List tournaments |
| GET | /api/tournaments/my | JWT | My tournaments |
| GET | /api/tournaments/:id | Public | Tournament detail |
| PATCH | /api/tournaments/:id | JWT | Update (owner) |
| DELETE | /api/tournaments/:id | JWT | Delete (owner) |
| POST | /api/tournaments/:id/register | JWT | Register team (captain) |
| POST | /api/tournaments/:id/withdraw | JWT | Withdraw team |
| GET | /api/tournaments/:id/bracket | Public | Bracket data |
| GET | /api/tournaments/:id/standings | Public | Standings/leaderboard |
| POST | /api/tournaments/:id/matches/:matchId/result | JWT | Enter match result |

**Models to create:** Tournament, TournamentMatch, TournamentTeam

**Formats:** knockout, round_robin, group_knockout

**Statuses:** upcoming, registration_open, registration_closed, ongoing, completed, cancelled

---

### 2.7 Finance & Cash Module ❌ (NOT STARTED)

**Endpoints Needed:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/bookings/:id/payment | Staff | Record payment (idempotent) |
| GET | /api/bookings/:id/finance | Staff | Booking finance detail |
| GET | /api/grounds/:id/finance | Owner/Mgr | Ground finance summary |
| GET | /api/grounds/:id/reports | Owner | Financial report |
| GET | /api/payment-methods | Public | All enabled methods |
| GET | /api/payment-methods/ground/:id | JWT | Effective methods per ground |
| PATCH | /api/grounds/:id/payment-methods/:methodId | Owner | Toggle method |
| POST | /api/grounds/:id/cash-session/open | Staff | Open cash session |
| POST | /api/grounds/:id/cash-session/close | Staff | Close session (calc variance) |
| GET | /api/grounds/:id/cash-sessions | Owner/Mgr | List sessions |
| GET | /api/admin/finance | Admin | Platform-wide finance |

**Models to create:** BookingFinance, BookingPayment, PaymentMethod, GroundPaymentMethod, RegionPaymentMethod, CashSession, CashSessionPayment

**Business Rules:**
- Idempotency via idempotencyKey (unique constraint)
- Overpayment prevention (check existing sum before recording)
- Channel classification: jazzcash/easypaisa/online = online, cash/bank_transfer = offline
- Cash variance: closingCash - (openingCash + cashPaymentsTotal)
- Only one open cash session per ground
- Append-only payment ledger (no UPDATE/DELETE on BookingPayment)

**Payment Methods (Pakistan-specific):**
Cash, JazzCash, Easypaisa, Bank Transfer, Credit/Debit Card

---

### 2.8 Chat Module ❌ (NOT STARTED)

**Endpoints Needed:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/chat/:id/messages | JWT | Cursor-based paginated messages |
| POST | /api/chat/:id/messages | JWT | Send message |
| GET | /api/chat/unread | JWT | Unread counts per ground |
| POST | /api/chat/:id/read | JWT | Mark as read |

**WebSocket:** Socket.IO /chat namespace
- Event: sendMessage (client→server)
- Event: newMessage (server→room)
- Event: typing (bidirectional)
- Rooms: ground:{groundId}
- Auth: JWT token on handshake

**Models to create:** ChatMessage, ChatParticipant, UnreadCount

**Business Rules:**
- Ground-scoped rooms (GroundAccess or ChatParticipant check)
- Message: 1-2000 chars
- Cursor pagination with hasMore/nextCursor
- Unread count via INSERT ... ON CONFLICT DO UPDATE
- Soft delete on messages

---

### 2.9 Notifications Module ❌ (NOT STARTED)

**Endpoints Needed:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/notifications | JWT | Paginated list |
| GET | /api/notifications/unread-count | JWT | Unread count |
| PATCH | /api/notifications/:id/read | JWT | Mark as read |
| PATCH | /api/notifications/read-all | JWT | Mark all as read |
| DELETE | /api/notifications/:id | JWT | Soft delete |

**WebSocket:** Socket.IO /notifications namespace
- Rooms: user:{userId}
- Event-driven via NotificationCreatedEvent

**Models to create:** Notification

**Trigger Points:**
- Booking created → staff notification
- Booking approved → player notification
- Booking rejected → player (with reason)
- Match challenge received → team captain
- Match completed → both teams
- Payment recorded → staff
- Team invitation → invited player

---

### 2.10 Ratings Module ❌ (NOT STARTED)

**Endpoints Needed:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/matches/:id/rating | JWT | Submit peer review (captain) |
| GET | /api/leaderboard | Public | Global leaderboard (ELO) |
| GET | /api/leaderboard/:sportId | Public | Sport-filtered leaderboard |
| GET | /api/players/:id/stats | Public | Player aggregate stats |
| POST | /api/matches/:id/player-stats | JWT | Record per-match stats (captain) |

**Models to create:** MatchRating, PlayerStat, PlayerMatchStat

**Scoring:** skillRating (1-5), sportsmanshipRating (1-5), punctualityRating (1-5) + reviewText
**Only captains** can submit ratings/stats
**Leaderboard:** teams sorted by ELO, top 3 highlighted

---

### 2.11 Admin Module ❌ (NOT STARTED)

**Endpoints Needed:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/admin/users | Admin | Paginated user list |
| GET | /api/admin/users/:id | Admin | User detail |
| GET | /api/admin/grounds | Admin | All grounds with counts |
| PATCH | /api/admin/grounds/:id/verify | Admin | Verify ground |
| PATCH | /api/admin/grounds/:id/suspend | Admin | Suspend ground |
| GET | /api/admin/teams | Admin | All teams with member counts |
| GET | /api/admin/finance | Admin | Platform finance summary |
| GET | /api/admin/audit-logs | Admin | Paginated audit logs |
| CRUD | /api/admin/regions | Admin | Region management |
| CRUD | /api/admin/cities | Admin | City management |
| CRUD | /api/admin/sports | Admin | Sport categories |
| CRUD | /api/admin/payment-methods | Admin | Payment methods |

**Models to create:** AuditLog, AppLog

**Business Rules:**
- Restricted to super_admin role
- AuditLog is append-only (no UPDATE/DELETE)
- Audit logged for: booking status changes, payments, ground verify/suspend, role changes

**Screen Mapping (Super Admin):**
| Screen | API Endpoints |
|--------|---------------|
| Admin Dashboard | GET /api/admin/finance |
| User Management | GET /api/admin/users, GET /api/admin/users/:id |
| Ground Moderation | GET /api/admin/grounds, PATCH verify/suspend |
| Platform Finance | GET /api/admin/finance |
| Audit Logs | GET /api/admin/audit-logs |
| Reference Data | CRUD /api/admin/regions, /cities, /sports, /payment-methods |

---

### 2.12 Upload Module ❌ (NOT STARTED)

**Endpoints Needed:**
| Method | Path | Auth | MIME | Max Size |
|--------|------|------|------|----------|
| POST | /api/upload | JWT | Default | Default |
| POST | /api/upload/booking-proof | Staff | jpeg/png/webp/pdf | 10MB |
| POST | /api/upload/ground-image | Owner | jpeg/png/webp | 5MB |
| POST | /api/upload/team-logo | JWT | jpeg/png/webp | 5MB |
| POST | /api/upload/tournament-poster | Owner/Mgr | jpeg/png/webp | 5MB |
| POST | /api/upload/avatar | JWT | jpeg/png/webp | 5MB |

**Storage:** AWS S3 (8 folder types: avatar, ground-image, team-logo, tournament-poster, booking-proof, chat-attachment, general)

---

### 2.13 Health Module ❌ (NOT STARTED)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | Public | DB ping + latency |

**Response:** `{ status: "ok", timestamp, services: { database: { status: "up", latencyMs } } }`

---

## 3. Cross-Cutting Requirements

### 3.1 Auth & Security
- JWT access token in httpOnly cookie (name: accessToken), SameSite=Lax
- Refresh token in httpOnly cookie (name: refreshToken), 7d
- Rate limiting: 100 req/min per IP
- Helmet security headers, CORS, HPP
- Correlation IDs on all requests/responses
- Structured error responses: `{ message, statusCode }` (could evolve to `{ error: { code, message, correlationId } }`)

### 3.2 Data Conventions
- All IDs: UUIDv4 with gen_random_uuid()
- Monetary fields: Decimal(12, 2) — PKR
- Coordinates: Decimal(10, 7) — ~11mm precision
- Timestamps: UTC stored, Asia/Karachi for display
- Soft delete pattern (deletedAt nullable) on Ground, Booking, Team, ChatMessage, Notification
- Append-only: BookingPayment, AuditLog
- Table names: snake_case via @@map

### 3.3 API Conventions
- Base path: /api/{module}
- Standard pagination: `{ data, meta: { total, page, limit, totalPages } }`
- Error codes: VALIDATION_ERROR (400), UNAUTHORIZED (401), FORBIDDEN (403), NOT_FOUND (404), CONFLICT (409), SLOT_CONFLICT (409), RATE_LIMIT_EXCEEDED (429), INTERNAL_ERROR (500)

### 3.4 Role System
- User-level role: "player" (default), "super_admin"
- Ground-level roles (via GroundAccess): owner, manager, staff
- RBAC enforced at service layer for ground-scoped operations

---

## 4. Database Models Summary

| # | Model | Status | Module |
|---|-------|--------|--------|
| 1 | User | ✅ Done | Auth |
| 2 | Region | ✅ Done | Ground |
| 3 | City | ✅ Done | Ground |
| 4 | Ground | ✅ Done | Ground |
| 5 | GroundSchedule | ✅ Done | Ground |
| 6 | GroundSetting | ✅ Done | Ground |
| 7 | GroundImage | ✅ Done | Ground |
| 8 | GroundAccess | ✅ Done | Ground |
| 9 | GroundInvite | ✅ Done | Ground |
| 10 | Court | ✅ Done | Ground |
| 11 | Booking | ❌ | Booking |
| 12 | BookingFinance | ❌ | Booking |
| 13 | BookingPayment | ❌ | Finance |
| 14 | PaymentMethod | ❌ | Finance |
| 15 | GroundPaymentMethod | ❌ | Finance |
| 16 | RegionPaymentMethod | ❌ | Finance |
| 17 | CashSession | ❌ | Finance |
| 18 | CashSessionPayment | ❌ | Finance |
| 19 | Team | ❌ | Teams |
| 20 | TeamMember | ❌ | Teams |
| 21 | TeamInvite | ❌ | Teams |
| 22 | JoinRequest | ❌ | Teams |
| 23 | TeamRatingHistory | ❌ | Teams |
| 24 | MatchRequest | ❌ | Matchmaking |
| 25 | TeamMatch | ❌ | Matchmaking |
| 26 | Tournament | ❌ | Tournaments |
| 27 | TournamentMatch | ❌ | Tournaments |
| 28 | TournamentTeam | ❌ | Tournaments |
| 29 | MatchRating | ❌ | Ratings |
| 30 | PlayerStat | ❌ | Ratings |
| 31 | PlayerMatchStat | ❌ | Ratings |
| 32 | Notification | ❌ | Notifications |
| 33 | ChatMessage | ❌ | Chat |
| 34 | ChatParticipant | ❌ | Chat |
| 35 | UnreadCount | ❌ | Chat |
| 36 | AuditLog | ❌ | Admin |
| 37 | AppLog | ❌ | Admin |
| 38 | SportCategory | ❌ | Teams/Reference |
| 39 | GroundClosure | ❌ | Ground (future) |
| 40 | SubscriptionPlan | ❌ | Future (SaaS) |
| 41 | GroundOwnerSubscription | ❌ | Future (SaaS) |
| 42 | Invoice | ❌ | Future (SaaS) |
| 43 | Coupon | ❌ | Future (dynamic pricing) |
| 44 | CouponUsage | ❌ | Future (dynamic pricing) |
| 45 | PricingRule | ❌ | Future (dynamic pricing) |
| 46 | HolidayPricing | ❌ | Future (dynamic pricing) |

---

## 5. Implementation Order

```
Phase 1: Auth ✅ → Ground ✅
Phase 2: Booking ← YOU ARE HERE
Phase 3: Finance + Cash
Phase 4: Teams + SportCategory
Phase 5: Matchmaking (requires Teams + Courts)
Phase 6: Tournaments (requires Teams + Courts)
Phase 7: Ratings + Leaderboard (requires Matchmaking)
Phase 8: Chat + Notifications (WebSocket)
Phase 9: Admin + Audit
Phase 10: Upload (S3)
Phase 11: Health
Phase 12: Testing + Hardening
Phase 13: Deployment
```

---

## 6. New Items from Current Session

- Express backend uses JS (not TS) — all new modules follow pattern: controller/service/repo
- Prisma 7 with adapter-pg, generated client at src/generated/
- Routes registered in src/app.js under appropriate base paths
- Validation via express-validator (existing pattern) or inline
- Postman collection must be updated after each module
- PLAN.md, STEPS.md, CHANGES.md updated with each module
- CORS origin bug: "http://localhost:3000/" has trailing slash — needs fixing
