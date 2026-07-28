# PlayArena Backend — Testing Strategy

> Document test cases, test results, and testing approach.

---

## Testing Approach

| Type | Tool | Scope |
|------|------|-------|
| Unit Tests | Jest | Utility functions, validation schemas, services |
| Integration Tests | Jest + Supertest | API endpoints, state machines, auth flows |
| E2E Tests | Jest + Supertest | Full user journeys |

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
- [ ] Create booking with valid slot
- [ ] Double-booking prevention (concurrent)
- [ ] Booking state machine transitions (6 states)
- [ ] Walk-in booking flow
- [ ] Booking expiry auto-transition

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

---

## Coverage Goals

- Unit test coverage: > 80%
- Integration test coverage: > 70%
- Critical paths: 100% (auth, booking, payment, ELO)