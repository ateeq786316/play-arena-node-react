# PlayArena Backend — Step-by-Step Progress

> Track granular steps. Mark `[x]` when complete.

---

## Step 1 — Switch DB: MongoDB → PostgreSQL (Prisma) ✅

- [x] Review all source files in `playarena-backend/src/`
- [x] Remove Mongoose, install Prisma + pg
- [x] Create Prisma schema with User model
- [x] Update db.js → Prisma client singleton
- [x] Refactor auth.repo.js → Prisma queries
- [x] Refactor auth.service.js → Prisma-compatible
- [x] Update env.js (MONGO_URL → DATABASE_URL)
- [x] Remove auth.model.js (handled by Prisma schema)

## Step 2 — Core Module Implementation

### Auth Module ✅
- [x] OTP verification (send + verify for signup)
- [x] JWT refresh endpoint (/auth/refresh)
- [x] Forgot/reset password (nodemailer setup + working flow)
- [x] User profile (GET /me, PATCH /profile)
- [x] Logout endpoint (cookie clear)
- [x] nodemailer SMTP email sending

### Other Modules
- [ ] User module (profile, search)
- [ ] Ground module (CRUD, courts, schedules)
- [ ] Booking module (create, state machine, conflict detection)
- [ ] Finance module (payments, cash sessions)
- [ ] Teams module (CRUD, roster, invites)
- [ ] Matchmaking module (challenges, ELO, scoring)
- [ ] Tournaments module (bracket generation, registration)
- [ ] Ratings module (peer reviews, leaderboards)
- [ ] Chat module (REST + WebSocket)
- [ ] Notifications module (CRUD + WebSocket)
- [ ] Admin module (users, grounds, finance, audit)
- [ ] Upload module (S3, MIME validation)
- [ ] Health module (DB ping)

## Step 3 — Testing

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

## Step 4 — Deployment

- [ ] Docker configuration
- [ ] Production environment setup
- [ ] CI/CD pipeline