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
- [ ] User registration with valid data
- [ ] User registration with duplicate email
- [ ] OTP verification with valid OTP
- [ ] OTP verification with expired OTP
- [ ] Login with valid credentials
- [ ] Login with invalid password
- [ ] Token refresh
- [ ] Logout

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

### ELO Rating
- [ ] Expected score calculation
- [ ] Rating update after match
- [ ] Rating floor (min 100)
- [ ] Inactivity decay

---

## Test Results

| Date | Module | Tests Run | Passed | Failed | Notes |
|------|--------|-----------|--------|--------|-------|
| 2026-07-28 | Auth — Register | 3 | 2 | 0 | New user created, duplicate blocked with 409 |
| 2026-07-28 | Auth — Login | 2 | 2 | 0 | Valid credentials return tokens, invalid returns 401 |
| 2026-07-28 | Auth — Password Reset | 2 | 2 | 0 | Reset link generated, password updated successfully |
| 2026-07-28 | Auth — Refresh Token | 1 | 0 | 1 | Fixed: now reads from cookie as fallback |
| 2026-07-28 | Auth — Update Password | 1 | 1 | 0 | JWT auth enforced, no userId param needed |
| 2026-07-29 | Booking — Service Unit Tests | 16 | 16 | 0 | Create, conflict, state machine, walk-in, cancel, payment idempotency, slots |

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
| `tests/booking.test.js` | Unit (mocked DB) | Create, conflict, state machine, walk-in, cancel, payments, slots |

---

## Coverage Goals

- Unit test coverage: > 80%
- Integration test coverage: > 70%
- Critical paths: 100% (auth, booking, payment, ELO)