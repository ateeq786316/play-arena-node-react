# ⚽ PlayArena — Sports Community Platform

> **Pakistan's go-to platform for ground booking, team management, matchmaking, tournaments, and player ratings.**

![Express](https://img.shields.io/badge/Express-5.2-000?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![JWT](https://img.shields.io/badge/Auth-JWT_%2B_OTP_%2B_Google-000?logo=jsonwebtokens)

---

## 🏗️ Architecture

```
play-arena-node-react/
├── playarena-backend/     # Express API server
│   ├── prisma/            # Schema + migrations
│   └── src/
│       ├── config/        # Env, logger, nodemailer
│       ├── constant/      # App constants
│       ├── database/      # Prisma client
│       ├── middlewares/    # Auth, security, error handler
│       ├── modules/       # Feature modules (auth, ground, booking...)
│       ├── repository/    # Data access layer
│       ├── shared/        # Errors, utilities
│       ├── utils/         # Helpers (tokens, templates)
│       └── validation/    # Request validation rules
├── vision/                # Project docs & specs
└── frontend/              # (coming soon)
```

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 22 |
| **Framework** | Express 5 |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma 7 |
| **Auth** | JWT + OTP (email) + Google OAuth |
| **Email** | Nodemailer (SMTP) |
| **Validation** | Zod + express-validator |
| **Security** | Helmet, HPP, CORS, Rate Limiting |
| **Logging** | Pino |
| **Cache / Queue** | Redis + Bull (planned) |
| **Storage** | AWS S3 (planned) |

---

## ✨ Features

### ✅ Done (7/14 Modules — 91+ Endpoints)
- **Auth** — Register, Login, Google OAuth, OTP verification, JWT refresh, forgot/reset password, profile
- **Grounds** — CRUD, courts, schedules, settings, RBAC (owner/manager/staff), regions/cities, invites
- **Bookings** — 6-state machine, slot conflict detection, deposit system, walk-in, payment idempotency
- **Teams** — CRUD, roster, invites, join requests, captaincy transfer, ELO ratings, rating history
- **Matchmaking** — Challenges, dual-confirmation scoring, ELO (K-factor, floor 100), match lifecycle
- **Tournaments** — Knockout (seeded with byes), round-robin, group+knockout, bracket gen, standings
- **Finance** — Payment methods, cash sessions (open/close/variance), ground finance summaries, reports
- **Chat** — REST + WebSocket (Socket.IO)
- **Notifications** — In-app + email + WebSocket
- **Ratings** — Peer reviews, leaderboards
- **Admin Panel** — Users, grounds, finance, audit logs
- **Upload** — S3 with MIME/size validation
- **Health** — DB ping with latency
- **Email** — Dedicated module

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 22+
- PostgreSQL 16
- Redis (for queues, planned)

### Setup

```bash
# 1. Clone
git clone https://github.com/ateeq786316/play-arena-node-react.git
cd play-arena-node-react/playarena-backend

# 2. Install
npm install

# 3. Environment
cp .env.example .env
# Edit .env with your DATABASE_URL and credentials

# 4. Database
npx prisma migrate dev

# 5. Start
npm run dev
```

### API Base URL
```
http://localhost:3000/api/user
```

---

## 📋 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
> Full endpoint reference in `docs/vision/vision-backend/requirement.md` and `docs/vision/postman-collection.json`.

**Modules registered at:** `/api/user`, `/api/grounds`, `/api/bookings`, `/api/teams`, `/api/matches`, `/api/tournaments`, `/api/finance`

---

## 🧪 Tests

```bash
cd playarena-backend
npm test        # 150 tests across 7 files
npm run test:watch
```

## 📁 Project Docs

| File | Purpose |
|------|---------|
| `docs/vision/project-scope.md` | Full platform specification |
| `docs/vision/PROJECT_STATUS.md` | Current audit & progress |
| `docs/vision/postman-collection.json` | Postman API tests |
| `docs/vision/vision-backend/PLAN.md` | Backend dev plan |
| `docs/vision/vision-backend/CHANGES.md` | Change log |
| `docs/vision/vision-backend/STEPS.md` | Step tracker |
| `docs/vision/vision-backend/TESTING.md` | Test strategy & history |
| `docs/vision/vision-backend/RULES.md` | Coding rules |

---

## 👤 Author

**Ateeq** — [@ateeq786316](https://github.com/ateeq786316)

---

> Built for the Pakistani sports community. 🏏⚽🏀🏸
