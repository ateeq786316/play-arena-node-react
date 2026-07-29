# PlayArena Backend — Testing Strategy

> Document test cases, test results, and testing approach.

---

## Testing Approach

| Type | Tool | Scope |
|------|------|-------|
| Unit Tests | Vitest | Utility functions, validation schemas, services |
| Integration Tests | Vitest + Supertest | API endpoints, state machines, auth flows |
| E2E Tests | Vitest + Supertest | Full user journeys |

---

## Test Cases

### Auth Module
- [x] User registration with valid data — Returns tokens + creates user
- [x] User registration with duplicate email — Throws 409
- [x] OTP verification with valid OTP — Verifies user
- [x] OTP verification with expired OTP — Throws 401
- [x] OTP verification with invalid OTP — Throws 401
- [x] Login with valid credentials — Returns tokens
- [x] Login with invalid password — Throws 401
- [x] Token refresh — Valid refresh returns new tokens, invalid/mismatched rejects
- [x] Profile (get + update) — Allowed fields only (name, avatar)
- [x] Password reset — Forgot sends email, reset verifies JWT
- [x] Update password — JWT auth enforced

### Ground Module
- [x] Create ground — Name required, creates with owner access + default settings
- [x] Get/find grounds — Returns single, list, featured (verified), managed by user
- [x] Update ground — Owner-only RBAC enforced
- [x] Delete ground — Owner-only soft delete
- [x] Court CRUD — Manager-level access, not-found handling
- [x] Schedule upsert/delete — Manager-level access
- [x] Settings update — Owner-only
- [x] Image add/remove — Manager-level access
- [x] Staff invite — Owner-only
- [x] Regions/cities — List active only

### Booking Module
- [x] Create booking with valid slot — Tested
- [x] Double-booking prevention — Conflict detection throws "already booked"
- [x] Booking state machine (pending→approved, pending→rejected requires reason, invalid transition blocked)
- [x] Walk-in booking flow — Auto-approved, staff access required
- [x] Payment recording with idempotency — Duplicate key returns existing
- [x] Cancel booking — Owner-only, valid status check
- [x] Slot availability generation — Booked slots marked unavailable
- [ ] Booking expiry auto-transition (needs cron job test)

### Finance Module
- [x] List payment methods — Active only, ordered by display
- [x] Ground payment methods — Merged with global enabled/disabled status
- [x] Toggle payment method — Owner-only, toggles isActive
- [x] Ground finance summary — Booking + payment aggregates
- [x] Ground finance report — Filterable by date range
- [x] Open cash session — Staff+, one open session per ground enforced
- [x] Close cash session — Variance = closingCash - expectedCash
- [x] List cash sessions — Owner/manager only
- [x] Payment recording with idempotency (in booking module)
- [x] Overpayment protection (in booking module)

### Teams Module
- [x] Create team — Name+sport required, creator becomes captain
- [x] Get/list teams — Public list, member-only detail, my-teams filter
- [x] Update/delete team — Captain/co-captain only
- [x] Members CRUD — Get roster, update role, remove member, leave team
- [x] Transfer captaincy — Old captain→co_captain, target→captain
- [x] Invite player — Captain/co-captain, duplicate member check
- [x] Join request — Create, list, accept/reject (captain only)
- [x] Team stats — Members count, ELO
- [x] Sport categories — List active

### Matchmaking Module
- [x] Create challenge — Captain/co-captain only, own-team check, duplicate block
- [x] Sent/received challenges — Filtered by team
- [x] Accept challenge → creates TeamMatch (scheduled)
- [x] Reject/cancel challenge — Status update
- [x] Submit score — First submission stores, matching scores completes, mismatch → score_pending
- [x] Start/cancel match — Status transition validation
- [x] ELO calculation — Expected score (0.5 for equal, >0.9 for large gap)

### ELO Rating (System-level)
- [x] Expected score formula — 1 / (1 + 10^((Rb - Ra) / 400))
- [x] K-factor — 32 (<30 matches), 24 (30+ matches)
- [x] Rating floor — min 100
- [ ] Inactivity decay — 2 ELO/week after 30 days (needs cron job)

### Notifications Module
- [x] Get notifications — Paginated list with total/page/limit/totalPages
- [x] Get notifications with bad params — Clamp page to min 1, limit to max 50
- [x] Get unread count — Returns count of unread (readAt=null, deletedAt=null)
- [x] Mark as read — Sets readAt when found
- [x] Mark as read not found — Throws 404
- [x] Mark all as read — Updates all unread for user
- [x] Delete notification — Soft delete (sets deletedAt)
- [x] Delete not found — Throws 404
- [x] Create notification — Creates record + emits via socket

### Chat Module
- [x] Get messages — Returns paginated messages with cursor
- [x] Get messages without access — Throws unauthorized
- [x] Get messages via ground access — Allows staff via GroundAccess
- [x] Send message — Valid content creates message
- [x] Send empty message — Throws validation error
- [x] Send message over 2000 chars — Throws validation error
- [x] Mark as read — Resets unread count
- [x] Get unread counts — Returns per-ground counts

### Tournaments Module
- [x] Create tournament — name, sport, format required, invalid format rejected
- [x] List tournaments — Public, with sport/status/format filters
- [x] My tournaments — Owner filter
- [x] Tournament detail — Returns teams + counts
- [x] Update/delete — Owner-only, non-owner rejected
- [x] Register team — Checks registration_open status, capacity, duplicates, owner exemption
- [x] Withdraw team — Blocked on completed/cancelled tournaments
- [x] Generate knockout bracket — Seeded single elimination with byes
- [x] Generate round robin — Every team plays every other
- [x] Generate group+knockout — Round robin per group
- [x] Enter match result — Owner-only, scores required, auto-advance knockout winners
- [x] Standings — Points (W=3, D=1, L=0) sorted by points
- [x] Bracket view — Returns format, teams, and matches

---

## Test Results

| Date | Module | Tests Run | Passed | Failed | Notes |
|------|--------|-----------|--------|--------|-------|
| 2026-07-28 | Auth — Register | 3 | 2 | 0 | New user created, duplicate blocked with 409 |
| 2026-07-28 | Auth — Login | 2 | 2 | 0 | Valid credentials return tokens, invalid returns 401 |
| 2026-07-28 | Auth — Password Reset | 2 | 2 | 0 | Reset link generated, password updated successfully |
| 2026-07-28 | Auth — Refresh Token | 1 | 0 | 1 | Fixed: now reads from cookie as fallback |
| 2026-07-28 | Auth — Update Password | 1 | 1 | 0 | JWT auth enforced, no userId param needed |
| 2026-07-29 | Auth — All endpoints | 25 | 25 | 0 | Register, login, OTP, refresh, profile, password reset, Google |
| 2026-07-29 | Ground — All endpoints | 24 | 24 | 0 | CRUD, courts, schedules, settings, RBAC, invites, regions |
| 2026-07-29 | Booking — All endpoints | 16 | 16 | 0 | Create, conflict, state machine, walk-in, cancel, payment, slots |
| 2026-07-29 | Teams — All endpoints | 27 | 27 | 0 | CRUD, invites, join requests, captaincy, members, stats |
| 2026-07-29 | Matchmaking — All endpoints | 15 | 15 | 0 | Challenges, accept/reject, dual-confirmation scoring, ELO calc, match lifecycle |
| 2026-07-29 | Tournaments — All endpoints | 29 | 29 | 0 | CRUD, bracket gen (3 formats), registration, standings, match results |
| 2026-07-29 | Finance — All endpoints | 14 | 14 | 0 | Payment methods, cash sessions (open/close/variance), ground finance, reports |
| 2026-07-29 | Chat — All endpoints | 9 | 9 | 0 | Messages (cursor pagination, access control), send message (validation), mark as read, unread counts |
| 2026-07-29 | Notifications — All endpoints | 9 | 9 | 0 | Paginated list, unread count, markAsRead, markAllAsRead, soft delete, create |

---

## Run Tests

```bash
cd playarena-backend
npm test        # Run all tests
npm run test:watch  # Watch mode
```

## Test Files

| File | Type | Coverage |
|------|------|----------|
| `tests/auth.test.js` | Unit (mocked DB) | Register, login, OTP, refresh, profile, password reset |
| `tests/ground.test.js` | Unit (mocked DB) | CRUD, courts, schedules, settings, RBAC, regions |
| `tests/booking.test.js` | Unit (mocked DB) | Create, conflict, state machine, walk-in, cancel, payments, slots |
| `tests/team.test.js` | Unit (mocked DB) | CRUD, invites, join requests, captaincy, members, stats |
| `tests/match.test.js` | Unit (mocked DB) | Challenges, dual-confirmation scoring, ELO, match lifecycle |
| `tests/tournament.test.js` | Unit (mocked DB) | CRUD, bracket gen (knockout/round_robin/group_knockout), registration, standings, match results |
| `tests/finance.test.js` | Unit (mocked DB) | Payment methods, ground finance, cash sessions (open/close/variance), reports |
| `tests/chat.test.js` | Unit (mocked DB) | Messages, cursor pagination, send message, mark as read, unread counts |
| `tests/notification.test.js` | Unit (mocked DB) | Paginated list, unread count, markAsRead, markAllAsRead, soft delete, create |

---

## Coverage Goals

- Unit test coverage (current): Auth 100%, Ground 100%, Booking 100%, Team 100%, Matchmaking 100%, Tournaments 100%
- Integration test coverage: Pending (needs test DB setup)
- Critical paths: Auth 100%, Ground 100%, Booking 100%