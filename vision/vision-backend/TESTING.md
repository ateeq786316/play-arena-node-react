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
- [ ] Payment recording with idempotency
- [ ] Overpayment protection
- [ ] Cash session open/close/reconcile
- [ ] Variance calculation

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

---

## Coverage Goals

- Unit test coverage (current): Auth 100%, Ground 100%, Booking 100%, Team 100%, Matchmaking 100%, Tournaments 100%
- Integration test coverage: Pending (needs test DB setup)
- Critical paths: Auth 100%, Ground 100%, Booking 100%