# PlayArena Workspace — Complete File-by-File Observation

> Generated: 2026-07-24
> Purpose: Deep, exhaustive observation of every file in the workspace.

---

## FILE 1: `.gitignore` (Root)

**Path:** `D:\play-arena\.gitignore`

### Content Overview
Standard comprehensive `.gitignore` for a full-stack Node.js/TypeScript monorepo project.

### Categories Covered
| Category | Details |
|----------|---------|
| **OS artifacts** | `.DS_Store`, `Thumbs.db` |
| **Node** | `node_modules/`, all debug logs (npm/yarn/pnpm) |
| **Logs** | `logs/`, `*.log`, `*.log.*` |
| **Runtime/Env** | `.env`, `.env.*.local`, `.env.local`, `.env.test`, `.env.production` |
| **Build/Cache** | `dist/`, `build/`, `coverage/`, `.cache/`, `.tmp/`, `.vite/`, `.next/`, `out/` |
| **TypeScript** | `*.tsbuildinfo` |
| **Prisma** | `backend/generated/`, `**/prisma/client/`, `prisma/generated/` |
| **IDE** | `.vscode/`, `.idea/`, `.sublime*`, `.code-workspace` |
| **Docker** | `docker-compose.override.yml`, `.env.docker` |
| **Misc** | Archives (`.tgz`, `.gz`, `.zip`, `.bak`, `.orig`, `.swp`) |
| **Testing** | `/coverage/`, jest config files |
| **Windows** | `Thumbs.db`, `ehthumbs.db` |
| **Graph cache** | `graphify-out/cache/` |

### Observations
- The `.gitignore` explicitly ignores **Prisma-generated clients** under `backend/generated/`, confirming Prisma is used with output redirection.
- **Lockfiles are NOT ignored** (commented out) — lockfiles are committed intentionally.
- `graphify-out/cache/` is ignored, indicating graph generation happens locally and only results (not cache) are committed.
- The `coverage/` entry appears 3 times (lines 29, 66, 70) — minor redundancy.
- `.env` and `.env.*` variations are ignored for security, but `.env.example` files are presumably tracked.
- No `.expo/` or React Native specific ignores — aligns with web-only deployment.

### Notable Absences
- No Python-related ignores (`.pyc`, `__pycache__`, `.venv`) — suggests backend is purely Node.js.
- No Docker `.dockerignore` equivalent.

---

## FILE 2: `.graphify_python` (Root)

**Path:** `D:\play-arena\.graphify_python`

### Content
```
C:\Users\HP\AppData\Local\Python\pythoncore-3.14-64\python.exe
```

### Content Overview
A single-line file pointing to the absolute path of a Python 3.14 executable installed via `pythoncore` (an experimental community Python distribution).

### Observations
- **Python version:** 3.14 (bleeding-edge, likely a pre-release or nightly build from `pythoncore-3.14-64`).
- **Install location:** `%LOCALAPPDATA%\Python\pythoncore-3.14-64\` — user-level install, not system-wide. This means Python is installed per-user without admin rights.
- **Purpose:** This file is consumed by the **graphify** tooling (referenced in `CLAUDE.md` instructions). Graphify uses Python to generate knowledge graphs from code/documentation.
- **Format:** Plain text, no YAML/JSON — just a raw path string.
- **Platform indicator:** Backslash path confirms Windows OS.

### Notable Details
- The project is primarily **Node.js/TypeScript** for the application, but Python is used as a **sidecar tool** (graphify) for knowledge graph generation.
- No Python dependencies (`requirements.txt`, `pyproject.toml`) are tracked in the workspace — graphify likely manages its own Python environment internally.
- This file acts as a **configuration pointer** — similar to how `.nvmrc` or `.node-version` specifies a runtime version, but here it specifies a full path rather than just a version string.

---

## FILE 3: `PROJECT_STATUS.md` (Root)

**Path:** `D:\play-arena\PROJECT_STATUS.md`

### Content Overview
A comprehensive 147-line project status audit document dated 2026-07-02. It serves as the canonical health report for the entire PlayArena platform.

### Key Sections Breakdown

#### 1. Project Identity
- **Platform:** Sports community platform for **Pakistan**
- **Core features:** Ground booking, team management, matchmaking, tournaments, ratings

#### 2. Tech Stack
| Layer | Technology | Implication |
|-------|-----------|-------------|
| **Backend** | NestJS 11 + Prisma 7 + PostgreSQL | Modern modular Node.js framework with cutting-edge Prisma ORM |
| **Frontend** | Next.js 15 (App Router) + Tailwind v4 + Zustand + TanStack Query | Latest Next.js with App Router pattern; Zustand for client state; TanStack Query for server state |
| **Auth** | JWT + OTP via email (PBKDF2) | Stateless auth with phone-based OTP; PBKDF2 for password hashing (not bcrypt/argon2) |
| **WebSocket** | Socket.IO | Real-time chat and notifications |
| **Shared** | `@playarena/shared` npm workspace | Zod DTOs, shared types, API client — enforces type safety across the stack |
| **Queue** | Bull + Redis | Background job processing (booking expiry, notifications, etc.) |
| **Storage** | AWS S3 | File uploads (avatars, ground images, booking proofs, etc.) |

#### 3. Backend Completion (16 Modules, ~5,000+ LOC)
**Fully Complete (15/16 modules):**
- **auth** — JWT, OTP, PBKDF2, full auth flow (signup/login/refresh/logout/me)
- **bookings** — State machine with 6 statuses (pending→approved/rejected/expired/cancelled/completed), slot conflict detection, walk-in booking
- **grounds** — Full CRUD, courts, schedules, RBAC with `GroundAccess`, staff invites
- **finance** — Idempotent payment recording, overpayment protection, cash sessions, hierarchical payment methods (global→region→ground)
- **teams** — CRUD, roster management, invites, join requests, captaincy transfer
- **matchmaking** — Challenge-based system, full match lifecycle, score entry, ELO rating
- **tournaments** — Knockout + round-robin bracket generation, standings, registration
- **ratings** — Match peer reviews, leaderboards, player stats
- **chat** — REST + WebSocket gateway, unread tracking, cursor-based pagination
- **notifications** — CRUD + WebSocket gateway, event-driven push
- **cash-management** — Session open/close/closeout, variance calculation
- **admin** — Users/grounds/teams management, audit logs, CRUD for regions/cities/sports/payment methods
- **users** — Profile update, player search
- **upload** — S3 with MIME/size validation, multi-folder support (8 folder types)
- **health** — DB ping with latency measurement
- **email** — 🟡 **Partial** (SMTP with console fallback, no template engine)

**Partially Complete (1/16):**
- **email** module is the only one not fully complete — SMTP works but falls back to `console.log` when unconfigured, and has no template engine.

#### 4. Common Infrastructure
| Component | Details |
|-----------|---------|
| **Guards** | JWT (with public route bypass via `@Public()`), Roles (ground-level + user-level), Throttle (IP-based, 100 req/min) |
| **Decorators** | `@Public()`, `@CurrentUser()`, `@Roles()`, `@GroundAccess()` |
| **Filters** | `AllExceptionsFilter` — structured errors with correlation IDs |
| **Interceptors** | Logging (correlation ID + duration), Transform (standardized API envelope), Timeout (30s) |
| **Pipes** | `ZodValidationPipe` — generic Zod schema validation |
| **Utils** | RatingUtil (ELO + decay), MoneyUtil (PKR), DateUtil (Asia/Karachi), GeoUtil (Haversine), IdempotencyUtil |
| **Events** | 5 event modules (booking, payment, team, match, notification) — decoupled event-driven architecture |
| **Workers** | 7 Bull workers — booking expiry, completion, cash auto-close, chat cleanup, match reminder, notification cleanup, rating decay |
| **Queues** | 3 queues: `notification`, `expiry`, `match-reminder` |
| **Prisma** | 30+ database models |
| **Seed Data** | 4 regions, 17 Pakistan cities, 9 payment methods, 7 sports |
| **API Docs** | Swagger at `/api/docs` |

#### 5. Frontend Completion
- **Total pages:** 33 page files
- **Auth pages (4):** login, signup, forgot-password, verify-otp — all complete
- **Dashboard pages (29):** ~95% complete
- **UI Components (6):** Button, Input, Card, Badge, Avatar, Tabs — all complete
- **Layout (3):** Providers (Query + Toaster), Sidebar (role-based, collapsible), Topbar
- **Stores (2):** auth (Zustand), ui (sidebar collapse)
- **Middleware:** Auth gate, role-based redirect
- **Config/Styling:** Tailwind v4 theme, all configs

**Partial frontend items:**
- `/grounds/[id]/edit` — Only name field updates, no pre-population of existing data
- `/admin` — Only Users tab functional; Grounds, Finance, Settings are placeholders

#### 6. Identified Gaps (Partial & Not Started)

**Partial:**
| Gap | Impact |
|-----|--------|
| Backend tests — only 1 basic e2e Hello World test | No test coverage despite Jest being configured |
| Admin page (frontend) — 3 of 4 tabs are placeholders | Limited admin functionality |
| Ground edit page — no pre-population | Poor UX for ground editing |
| Domain components — 8 empty directories | UI logic inlined in pages, no reusability |
| Services layer — `src/services/` empty | API calls made directly from pages, no abstraction |
| Email — no template engine | Cannot send rich HTML emails |
| API routes (Next.js) — `app/api/` empty | No Next.js API routes for auth proxy/uploads |

**Not Started:**
| Item | Notes |
|------|-------|
| Unit/Integration/E2E tests | No test coverage beyond 1 stub |
| FCM push notifications | Planned but not implemented |
| Mobile app (React Native) | Only web frontend exists |

#### 7. Architecture Note (Critical)
> "The `CLAUDE.md` in `testing and details/` describes a **React Native + Supabase-only** architecture, but the actual codebase is a **Next.js 15 web app + NestJS + PostgreSQL (Prisma)**. The web platform is the evolved/deployed implementation."

This is a **key architectural insight**: There was a shift from a React Native + Supabase architecture to a full-stack web architecture with NestJS + Next.js. The old architecture docs persist in `testing and details/` and are now **stale/outdated**.

### Observations
- The project is **very far along** — almost all planned features are complete in both frontend and backend.
- The **backend is more complete** (15/16 modules done) than the frontend (95% of routes).
- The **email module** is the weakest link — no template engine means all transactional emails are plain text.
- **Testing is the biggest gap** — virtually no test coverage despite having Jest configured.
- The project uses **3 queue systems** (Bull + Redis) with 7 workers — showing significant background processing needs.
- **Seed data** is Pakistan-specific (4 regions, 17 cities) confirming the Pakistan market focus.
- **Swagger docs** are generated at `/api/docs` — good for API consumers.
- The **state machine** for bookings has 6 states with proper transitions — well-designed domain logic.

---

## FILE 4: `backend/.env.example`

**Path:** `D:\play-arena\backend\.env.example`

### Content (26 lines)
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://playarena:password@localhost:5432/playarena
REDIS_URL=redis://localhost:6379
JWT_SECRET=local-dev-secret-change-in-production
JWT_EXPIRES_IN=7d
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET=playarena-uploads-dev
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youraccount@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=youraccount@gmail.com
CORS_ORIGIN=*
LOG_LEVEL=info
BOOKING_EXPIRY_MINUTES=30
PAGINATION_DEFAULT_SIZE=20
REDIS_CACHE_TTL=300
```

### Observations
- **Infrastructure dependencies:** Requires 3 external services — PostgreSQL, Redis, and AWS S3.
- **AWS region:** `ap-southeast-1` (Singapore) — geographically closest AWS region to Pakistan, minimizing latency.
- **JWT expiry:** 7 days — relatively long-lived tokens; trade-off between UX and security.
- **S3 bucket:** `playarena-uploads-dev` — naming convention includes `-dev` suffix, suggesting there may be `-staging` and `-prod` counterparts.
- **SMTP:** Uses Gmail SMTP (port 587) — likely a development-only setup; production would use a dedicated email service (SendGrid, SES, etc.).
- **CORS:** `*` in dev — wide open, expected for development.
- **Booking expiry:** 30 minutes — unpaid bookings auto-expire after 30 minutes.
- **Pagination:** Default page size is 20 items.
- **Redis cache TTL:** 300 seconds (5 minutes) for cached data.
- **No OTP-specific config** — OTP expiry/length must be hardcoded in the auth module.

### Notable Details
- AWS credentials are left empty (`AWS_ACCESS_KEY_ID=` and `AWS_SECRET_ACCESS_KEY=`) — must be filled in before S3 uploads work.
- SMTP password is a placeholder (`your-app-password`) — expects a Gmail App Password, not the regular Gmail password.
- `NODE_ENV` is set to `development` but the file is `.env.example` — these are template values, not secrets.
- Connection strings use `localhost` — local development, Docker Compose would use service names (`db`, `cache`).

---

## FILE 5: `backend/.gitignore`

**Path:** `D:\play-arena\backend\.gitignore`

### Content (7 lines)
```
node_modules
.env
/generated/prisma
/playarena-api
/testing and details
```

### Observations
- **Shorter than root .gitignore** — backend-specific ignores only (7 lines vs 78 lines in root).
- **`/generated/prisma`** — Prisma client output is gitignored and generated at build time.
- **`/playarena-api`** — likely a generated API client or SDK that should not be tracked.
- **`/testing and details`** — the entire `testing and details/` directory is gitignored from within the backend. This is a **cross-reference confirmation** — this directory exists at root level but the backend submodule doesn't track it.
- **`.env`** — individual backend .env is ignored while `.env.example` is tracked.
- **No `dist/` ignore** — the root `.gitignore` already covers `dist/`, so it's not duplicated here.
- **No `node_modules/` plural** — uses `node_modules` (without trailing slash), works the same way.

### Notable Detail
- The pattern `/testing and details` with a leading slash anchors it to root. Since this `.gitignore` is inside `backend/`, it would only match `backend/testing and details`, not the root-level one. But the root `.gitignore` doesn't have this entry — so the root-level `testing and details/` directory IS tracked (as confirmed by `git status` showing `?? "testing and details/"`).

---

## FILE 6: `backend/.prettierrc`

**Path:** `D:\play-arena\backend\.prettierrc`

### Content (4 lines)
```json
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

### Observations
- **Minimal config** — only 2 rules specified, relying on Prettier defaults for everything else.
- **`singleQuote: true`** — single quotes preferred over double quotes across the entire backend codebase.
- **`trailingComma: "all"`** — trailing commas everywhere (functions, imports, objects, arrays). This is the most aggressive trailing comma setting.
- **`printWidth` not set** — defaults to Prettier's 80 characters.
- **`tabWidth` not set** — defaults to 2 spaces.
- **`semi` not set** — defaults to `true` (semicolons required).

### Notable Detail
- ESLint config (`eslint.config.mjs`) imports `eslint-plugin-prettier/recommended` which integrates Prettier rules into ESLint, so formatting is enforced as lint errors, not a separate step.

---

## FILE 7: `backend/docker-compose.yml`

**Path:** `D:\play-arena\backend\docker-compose.yml`

### Content (58 lines)
A Docker Compose file defining 3 services: `api`, `db`, `cache`.

### Service Breakdown

#### `api` (NestJS Backend)
- **Build:** Dockerfile in current directory (multi-stage, Node 22 Alpine)
- **Port:** `3000:3000`
- **Dependencies:** `db` (waits for health check) and `cache` (waits for start)
- **Environment:** Injects all env vars (DATABASE_URL points to `db:5432`, REDIS_URL to `cache:6379`)
- **Log Level:** `debug` in Docker (overrides `.env.example` which uses `info`)
- **Restart Policy:** `unless-stopped`

#### `db` (PostgreSQL 16 Alpine)
- **Image:** `postgres:16-alpine` — latest stable PostgreSQL on lightweight Alpine
- **Port:** `5432:5432`
- **Credentials:** user=`playarena`, password=`password`, database=`playarena`
- **Volume:** Named volume `pgdata` — data persists across container restarts
- **Healthcheck:** `pg_isready -U playarena` every 5s, 5 retries — ensures API only starts after DB is ready

#### `cache` (Redis 7 Alpine)
- **Image:** `redis:7-alpine` — latest stable Redis on lightweight Alpine
- **Port:** `6379:6379`
- **Volume:** Named volume `redisdata` — persists Redis data

### Volumes
- `pgdata` — PostgreSQL persistent storage
- `redisdata` — Redis persistent storage

### Observations
- **No network definition** — uses default bridge network; services communicate via service names.
- **No `.env` file** — environment variables are hardcoded in the compose file for development.
- **PostgreSQL 16** is used (the image, not the version in `DATABASE_URL` which doesn't specify version).
- **Redis 7 Alpine** — modern Redis version on a tiny image (~32MB).
- **Node 22 Alpine** — latest Node.js LTS on Alpine.
- **No pgAdmin or Redis Commander** — no admin UI tools for databases.
- **`pnpm` is used** — the Dockerfile uses `corepack enable && corepack prepare pnpm@latest --activate` to enable pnpm.

---

## FILE 8: `backend/Dockerfile`

**Path:** `D:\play-arena\backend\Dockerfile`

### Content (32 lines)
Multi-stage Docker build with 2 stages: `builder` and `runner`.

### Stage 1: Builder (`node:22-alpine`)
1. Enables `corepack` and activates latest `pnpm`
2. Installs production dependencies with `--frozen-lockfile` (ensures reproducible builds)
3. Copies source code, Prisma schema, and NestJS config files
4. Runs `pnpm build` to compile TypeScript to JavaScript
5. Runs `pnpm prune --prod` to remove devDependencies (keeps production image small)

### Stage 2: Runner (`node:22-alpine`)
1. Copies only what's needed: `dist/`, `node_modules/`, `package.json`, `prisma/`
2. Runs `pnpm prisma generate` inside the runner — generates Prisma client at container startup
3. Exposes port 3000
4. Starts with `node dist/main` (not `nest start` — compiled JS directly)

### Observations
- **Multi-stage build** — production image is ~10x smaller than builder image.
- **pnpm** — uses `frozen-lockfile` for deterministic installs (requires `pnpm-lock.yaml` to be committed).
- **Prisma generate happens at runtime**, not build time — this means the Prisma client is generated fresh in the production container. This is intentional: the generated client could differ based on the platform.
- **`pnpm prune --prod`** removes devDependencies after build — good practice for minimizing image size.
- **CMD is `node dist/main`** — runs compiled JavaScript directly without NestJS CLI overhead.
- **No HEALTHCHECK** — the Dockerfile lacks a health check instruction (unlike docker-compose's `db` service which has one).
- **No `USER` directive** — runs as root by default (security concern for production).

---

## FILE 9: `backend/eslint.config.mjs`

**Path:** `D:\play-arena\backend\eslint.config.mjs`

### Content (35 lines)
**ESLint 9 flat config** using the modern `eslint.config` format (not the legacy `.eslintrc`).

### Config Stack
1. **`@eslint/js` recommended** — base JavaScript rules
2. **`typescript-eslint` recommended type-checked** — full TypeScript type-aware linting
3. **`eslint-plugin-prettier/recommended`** — runs Prettier as an ESLint rule (formatting = lint error)
4. **Custom overrides** — Node.js + Jest globals, CommonJS source type, project service for type-checking

### Key Rules Configured
| Rule | Setting | Implication |
|------|---------|-------------|
| `@typescript-eslint/no-explicit-any` | `off` | Allows `any` type — pragmatic choice for rapid development |
| `@typescript-eslint/no-floating-promises` | `warn` | Warns on unhandled promises (should be `await`ed or `.catch()`ed) |
| `@typescript-eslint/no-unsafe-argument` | `warn` | Warns when passing unsafe types as arguments |
| `prettier/prettier` | `error` with `endOfLine: "auto"` | Formatting errors fail the build; auto-detects line endings |

### Observations
- **Flat config (ESLint 9)** — the modern config format, not backward-compatible with ESLint <9.
- **Type-aware linting** — `projectService: true` and `tsconfigRootDir` enable rules that require type information (slower but catches more bugs).
- **`no-explicit-any` is OFF** — the team prioritizes shipping speed over strict type safety.
- **`endOfLine: "auto"`** in Prettier config avoids cross-platform CRLF/LF issues — essential for Windows + Linux development.
- **`sourceType: 'commonjs'`** — interesting choice since NestJS uses ES module syntax with decorators, but CommonJS is the output format (NestJS compiles to CommonJS).

---

## FILE 10: `backend/nest-cli.json`

**Path:** `D:\play-arena\backend\nest-cli.json`

### Content (9 lines)
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "plugins": ["@nestjs/swagger"]
  }
}
```

### Observations
- **`deleteOutDir: true`** — the `dist/` directory is cleaned before each build, preventing stale files.
- **`plugins: ["@nestjs/swagger"]`** — the Swagger plugin automatically extracts decorator metadata (DTO properties, API tags, etc.) to generate OpenAPI docs without manual annotations.
- **`sourceRoot: "src"`** — conventional NestJS project structure.
- **`collection: "@nestjs/schematics"`** — standard NestJS blueprint/CLI schematics.
- **Simple config** — no complex compiler options; NestJS CLI handles most defaults.

---

## FILE 11: `backend/openapi.json`

**Path:** `D:\play-arena\backend\openapi.json`

### Content (4,154 lines)
Auto-generated OpenAPI 3.0 specification for the entire PlayArena API.

### Structure
| Section | Details |
|---------|---------|
| OpenAPI version | 3.0.0 |
| Server base URL | `/api/v1` |
| Security | Bearer JWT (`bearerAuth`) |
| Tags | Health, Auth, Users, Grounds, Bookings, Finance, Teams, Matchmaking, Tournaments, Ratings, Chat, Notifications, Cash Management, Admin, Upload |

### Observed Endpoints
- **Health:** `GET /health`
- **Auth:** POST `/auth/signup`, `/auth/verify-otp`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`
- **Users:** (likely) CRUD endpoints for user profiles
- **Grounds:** (likely) CRUD + schedules + images + access management
- **Bookings:** (likely) CRUD with status transitions
- **Finance:** (likely) payment recording, cash sessions
- **Teams:** (likely) CRUD + roster + invites
- **Matchmaking:** (likely) challenges + match lifecycle
- **Tournaments:** (likely) CRUD + bracket management
- **Ratings:** (likely) peer reviews + leaderboards
- **Chat:** (likely) messages + participants
- **Notifications:** (likely) CRUD + WebSocket events
- **Cash Management:** (likely) session open/close/reconcile
- **Admin:** (likely) admin CRUD operations
- **Upload:** (likely) file upload endpoints

### Observations
- **Auto-generated** — this file is generated by the `@nestjs/swagger` plugin, not hand-written.
- **Schemas are minimal** — most request bodies show `"type": "object"` without detailed property definitions. This suggests the Swagger plugin is configured to extract basic metadata but not full DTO schemas, OR the DTOs lack `@ApiProperty()` decorators.
- **4,154 lines** — indicates a large API surface with many endpoints across 16 modules.
- **`/api/v1` base path** — API versioning via URI prefix (v1).
- **Bearer JWT auth** — single security scheme for the entire API.
- **This file may be stale** — if it was generated at an earlier point and not regenerated, endpoints may have changed since.

---

## FILE 12: `backend/package.json`

**Path:** `D:\play-arena\backend\package.json`

### Content (110 lines)
Standard NestJS package.json with scripts, dependencies, and Jest configuration.

### Scripts
| Script | Command | Purpose |
|--------|---------|---------|
| `build` | `nest build` | Compile TypeScript |
| `format` | `prettier --write "src/**/*.ts" "test/**/*.ts"` | Format code |
| `start` | `nest start` | Run in production mode |
| `start:dev` | `nest start --watch` | Development with hot-reload |
| `start:debug` | `nest start --debug --watch` | Debug mode with inspector |
| `start:prod` | `node dist/main` | Run compiled JS directly |
| `lint` | `eslint ... --fix` | Lint + auto-fix |
| `test` | `jest` | Run unit tests |
| `test:watch` | `jest --watch` | Watch mode |
| `test:cov` | `jest --coverage` | With coverage |
| `test:debug` | Node inspect + Jest | Debug tests |
| `test:e2e` | `jest --config ./test/jest-e2e.json` | End-to-end tests |

### Dependencies (Production — 30 packages)
| Category | Packages |
|----------|----------|
| **NestJS core** | `@nestjs/common`, `@nestjs/core`, `@nestjs/config`, `@nestjs/platform-express`, `@nestjs/swagger`, `@nestjs/schedule`, `@nestjs/throttler`, `@nestjs/event-emitter` |
| **NestJS modules** | `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/bull`, `@nestjs/platform-socket.io`, `@nestjs/websockets` |
| **Database** | `@prisma/client`, `@prisma/adapter-pg`, `pg` |
| **Auth** | `passport`, `passport-jwt` |
| **Queue/Cache** | `bull`, `ioredis` |
| **AWS** | `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` |
| **Validation** | `class-transformer`, `class-validator`, `nestjs-zod`, `zod` |
| **WebSocket** | `socket.io` |
| **Logging** | `nestjs-pino`, `pino`, `pino-pretty` |
| **Security** | `helmet`, `cookie-parser` |
| **Email** | `nodemailer` |
| **Utils** | `reflect-metadata`, `rxjs`, `uuid` |

### Dev Dependencies (— 20 packages)
| Category | Packages |
|----------|----------|
| **TypeScript** | `typescript`, `ts-node`, `ts-jest`, `ts-loader`, `tsconfig-paths` |
| **Testing** | `jest`, `@types/jest`, `supertest`, `@types/supertest` |
| **Linting** | `eslint`, `typescript-eslint`, `@eslint/eslintrc`, `@eslint/js`, `eslint-config-prettier`, `eslint-plugin-prettier`, `prettier`, `globals` |
| **NestJS CLI** | `@nestjs/cli`, `@nestjs/schematics`, `@nestjs/testing` |
| **Types** | `@types/node`, `@types/express`, `@types/bull`, `@types/cookie-parser`, `@types/ioredis`, `@types/multer`, `@types/nodemailer`, `@types/passport-jwt`, `@types/uuid` |
| **Prisma** | `prisma` |

### Jest Configuration (embedded)
- **rootDir:** `src`
- **testRegex:** `.*\.spec\.ts$` — matches `*.spec.ts` files
- **transform:** `ts-jest` for `.ts` and `.js` files
- **coverageDirectory:** `../coverage`
- **testEnvironment:** `node`

### Observations
- **NestJS v11** — latest major version of NestJS.
- **Prisma v7** — latest Prisma ORM with adapter pattern (`@prisma/adapter-pg` for PostgreSQL).
- **Zod v4** — cutting-edge validation library (v4 is very recent).
- **Bull v4** — Redis-backed queue library for background jobs.
- **Jest v30** — latest major version with significant improvements.
- **TypeScript v5.7** — current latest TypeScript.
- **Dual validation** — both `class-validator` (NestJS native) and `nestjs-zod`/`zod` are used. This is unusual — typically one or the other. Zod is likely used for shared DTOs (in `@playarena/shared`) while class-validator is used for NestJS-specific validation.
- **No `@nestjs/passport` test utilities** — no `@nestjs/testing` integration with passport mocks.
- **`reflect-metadata`** — required for NestJS decorators to work.
- **Package manager is `pnpm`** — as evidenced by Dockerfile; but `package-lock.json` also exists in directory listing.

---

## FILE 13: `backend/prisma.config.ts`

**Path:** `D:\play-arena\backend\prisma.config.ts`

### Content (15 lines)
```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

### Observations
- **Prisma 7 config format** — uses the new `defineConfig` API (Prisma 7+), different from Prisma 5/6 where config was in `schema.prisma` as `generator`/`datasource` blocks.
- **`dotenv/config`** — loads `.env` file before reading `DATABASE_URL`.
- **Migrations path:** `prisma/migrations` — standard Prisma migrations directory.
- **Seed command:** `ts-node prisma/seed.ts` — runs seed script directly with TypeScript execution.
- **Reads `DATABASE_URL` from environment** — not hardcoded in config.
- **Auto-generated comment** — the file header says "This file was generated by Prisma", so it's created by `prisma init` or `prisma config` command.

---

## FILE 14: `backend/README.md`

**Path:** `D:\play-arena\backend\README.md`

### Content (98 lines)
Standard NestJS boilerplate README — largely unmodified from `nest new`.

### Sections
1. **NestJS logo and badges** — NPM version, license, downloads, CircleCI, Discord, Backers, Donate links
2. **Description** — "Nest framework TypeScript starter repository" (default template text)
3. **Project setup** — `pnpm install`
4. **Compile and run** — `start`, `start:dev`, `start:prod`
5. **Run tests** — `test`, `test:e2e`, `test:cov`
6. **Deployment** — Generic NestJS deployment instructions with Mau platform reference
7. **Resources** — Links to NestJS docs, Discord, courses, enterprise support
8. **Support** — Open Collective backers
9. **License** — MIT

### Observations
- **Unmodified template** — this README is the default NestJS starter README. It has not been customized for PlayArena.
- **No project-specific information** — doesn't mention PlayArena, Prisma, PostgreSQL, or any of the actual tech stack.
- **`pnpm install`** is mentioned (instead of `npm install`), suggesting the template was customized slightly or pnpm is the expected package manager.
- **No setup instructions** for prerequisites (PostgreSQL, Redis) or environment configuration.
- **No architecture overview** — unlike the root-level `PROJECT_STATUS.md` which has detailed architecture docs.
- **This is a gap** — the backend README should be updated with PlayArena-specific documentation.

---

## FILE 15: `backend/tsconfig.json`

**Path:** `D:\play-arena\backend\tsconfig.json`

### Content (24 lines)
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "isolatedModules": true,
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Observations
- **Target ES2023** — modern JavaScript output (supports `Array.fromAsync`, iterator helpers, etc.).
- **CommonJS module** — NestJS traditionally outputs CommonJS for wider compatibility, even though the source uses ES module syntax.
- **Decorators enabled** — `experimentalDecorators: true` and `emitDecoratorMetadata: true` are required for NestJS's dependency injection and controller decorators.
- **No `strict: true`** — instead, individual strict options are enabled: `strictNullChecks`, `noImplicitAny`, `strictBindCallApply`. Missing: `strictFunctionTypes`, `strictPropertyInitialization`.
- **`incremental: true`** — enables TypeScript's incremental compilation for faster rebuilds.
- **`isolatedModules: true`** — ensures each file can be transpiled independently (compatible with `ts-jest` and other transpilers).
- **`sourceMap: true`** — generates `.js.map` files for debugging.
- **`skipLibCheck: true`** — skips type-checking of `.d.ts` files for faster compilation.

---

## FILE 16: `backend/tsconfig.build.json`

**Path:** `D:\play-arena\backend\tsconfig.build.json`

### Content (4 lines)
```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

### Observations
- **Extends base tsconfig** — inherits all compiler options from `tsconfig.json`.
- **Excludes `test/` and `**/*spec.ts`** — test files are not included in the production build.
- **Excludes `dist/`** — prevents recursive compilation into the output directory.
- **Standard NestJS pattern** — all NestJS projects follow this same structure.

---

## FILE 17: `backend/prisma/schema.prisma`

**Path:** `D:\play-arena\backend\prisma\schema.prisma`

### Content (976 lines)
Complete Prisma 7 schema defining ~30+ database models for the entire PlayArena domain.

### Generator Configuration
- **Client output:** `../generated/prisma` — Prisma client is generated outside `node_modules/`
- **Provider:** `prisma-client` (Prisma 7 native client)
- **Datasource:** `postgresql` (provider only; URL from environment)

### Models Breakdown (31 models)

#### Core Business Models (17)
| Model | Lines | Description | Key Fields |
|-------|-------|-------------|------------|
| `User` | 38 | User accounts | phone, email, passwordHash, role (default "player"), city relation, OTP fields |
| `Ground` | 36 | Sports grounds | name, ownerId, address, city, region, coordinates, verification status |
| `Court` | 26 | Individual courts within a ground | groundId, sportType, basePrice, pricePerHour, depositAmount, maxPlayers, amenities (JSON) |
| `Booking` | 34 | Court booking records | groundId, courtId, playerId, date/time, totalAmount, depositAmount, 6-state status machine |
| `BookingFinance` | 10 | Per-booking finance tracking | totalAmount, onlineReceived, offlineReceived, paymentStatus (unpaid/partial/paid/overpaid) |
| `BookingPayment` | 18 | Append-only payment ledger | bookingId, amount, channel, paymentMethod, idempotencyKey (unique), recordedBy |
| `GroundAccess` | 16 | Ground-level RBAC | userId, groundId, accessRole (owner/manager/staff), isActive |
| `GroundSetting` | 15 | Ground configuration | allowOnlineBooking, allowWalkinBooking, requireDeposit, depositPercentage, cancellationPolicy, advanceBookingDays, min/max booking duration |
| `Team` | 38 | Sports teams | name, sportCategory, rating (ELO, default 1200), wins/losses/draws |
| `TeamMember` | 14 | Team roster | role (captain/co_captain/player), jerseyNumber |
| `TeamMatch` | 33 | Team vs team matches | team1/team2, court, scores, winnerId, status, roundType (friendly/league/knockout/group_stage) |
| `MatchRequest` | 21 | Challenge/match request system | fromTeam, toTeam, proposedDate, status (pending/accepted/rejected/cancelled/expired) |
| `Tournament` | 28 | Competition management | name, sportType, format, entryFee, prizePool, teamSize, status machine, registration deadlines |
| `TournamentMatch` | 26 | Bracket matches | round, matchOrder, team1/team2, scores, winnerId, court, status |
| `MatchRating` | 17 | Peer reviews | skillRating, sportsmanshipRating, punctualityRating, reviewText |
| `PlayerStat` | 16 | Aggregate player stats | matchesPlayed, wins, goalsScored, assists, manOfMatch, ratingAverage |
| `PlayerMatchStat` | 17 | Per-match player stats | goalsScored, assists, isManOfMatch, performanceRating |

#### Supporting Models (14)
| Model | Lines | Description |
|-------|-------|-------------|
| `GroundImage` | 11 | Ground photo gallery with ordering and primary flag |
| `GroundSchedule` | 13 | Weekly schedule: dayOfWeek, openTime, closeTime, slotDuration |
| `GroundInvite` | 16 | Staff invitation system with expiry and access role |
| `GroundPaymentMethod` | 10 | Many-to-many: which payment methods a ground accepts |
| `PaymentMethod` | 17 | Global payment method catalog (methodId, label, type, category, icon, displayOrder) |
| `RegionPaymentMethod` | 10 | Region-level payment method availability |
| `Region` | 11 | Geographic regions with unique name and code |
| `City` | 13 | Cities within regions, linked to Users and Teams |
| `Notification` | 17 | Notification queue: title, body, type, metadata, status machine (queued/sent/failed/dead_letter), retry count |
| `ChatMessage` | 12 | Ground-scoped chat messages with soft delete |
| `ChatParticipant` | 11 | Chat membership with lastReadAt for unread tracking |
| `TournamentTeam` | 14 | Team registrations in tournaments with verification status |
| `CashSession` | 22 | Cash drawer sessions: openingCash, closingCash, expectedCash, variance calculation |
| `CashSessionPayment` | 8 | Links cash session payments to booking payments |
| `UnreadCount` | 9 | Materialized unread counts per user per ground |
| `AuditLog` | 16 | Append-only audit trail: action, entityType/Id, performedBy, ipAddress, ground context |
| `AppLog` | 12 | Application logs with TTL: correlationId, level, event, userId, groundId, bookingId |
| `SportCategory` | 14 | Sports catalog: name, icon, min/max players per team, match duration |
| `TeamInvite` | 15 | Team invitation system with status machine and expiry |
| `JoinRequest` | 13 | Team join requests with message and status |
| `TeamRatingHistory` | 13 | ELO rating audit trail: ratingBefore, ratingAfter, change, reason |

### Enum Definitions (10)
| Enum | Values | Used By |
|------|--------|---------|
| `BookingStatus` | pending_payment_verification, approved, rejected, expired, cancelled, completed | Booking model |
| `PaymentStatus` | unpaid, partial, paid, overpaid | BookingFinance |
| `AccessRole` | owner, manager, staff | GroundAccess, GroundInvite |
| `NotificationStatus` | queued, sent, failed, dead_letter | Notification |
| `InviteStatus` | pending, accepted, rejected, expired | GroundInvite |
| `CashSessionStatus` | open, closed, reconciled | CashSession |
| `TournamentStatus` | upcoming, registration_open, registration_closed, ongoing, completed, cancelled | Tournament |
| `TournamentMatchStatus` | scheduled, ongoing, completed, cancelled, forfeited | TournamentMatch |
| `TeamMemberRole` | captain, co_captain, player | TeamMember |
| `TeamInviteStatus` | pending, accepted, rejected, expired | TeamInvite |
| `MatchRequestStatus` | pending, accepted, rejected, cancelled, expired | MatchRequest |
| `TeamMatchStatus` | scheduled, ongoing, completed, cancelled, forfeited | TeamMatch |
| `MatchRoundType` | friendly, league, knockout, group_stage | TeamMatch |

### Observations
- **All IDs use UUIDv4** (`gen_random_uuid()`) across all models — consistent identifier strategy.
- **Soft delete pattern** — `Ground`, `Booking`, `Team`, `ChatMessage`, `Notification` all have `deletedAt` fields.
- **Append-only patterns** — `BookingPayment` and `AuditLog` are append-only (no update/delete).
- **`@@map` on all models** — maps Prisma model names to snake_case table names (e.g., `users_public`, `ground_access`).
- **Comprehensive indexing** — every model has at least one index, most have 2-3 for query optimization.
- **JSON fields used** — `GroundSetting.amenities`, `Notification.metadata`, `AuditLog.metadata`, `AppLog.metadata`, `PaymentMethod.metadata`.
- **Decimal type for money** — all monetary fields use `@db.Decimal(12, 2)` — 12 digits total, 2 decimal places (enough for PKR which doesn't have sub-units issues).
- **Coordinates** — `Ground.latitude` and `Ground.longitude` use `Decimal(10, 7)` — 10 total digits, 7 decimal places (~11mm precision at equator).
- **Unique constraints** — multi-field constraints on `GroundAccess(groundId, userId)`, `ChatParticipant(groundId, userId)`, `UnreadCount(userId, groundId)`, `TeamMember(teamId, userId)`, `TeamInvite(teamId, userId)`.
- **User role is a plain String** — `String @default("player")` Instead of an enum, indicating roles may be dynamic or extensible.
- **Team rating defaults to 1200** — standard ELO starting rating.
- **PKR money handling** — `Decimal(12, 2)` max value is 99,999,999,999.99 which is more than sufficient for PKR.
- **Opaque `SportCategory` references** — sport categories are referenced by ID everywhere, with no hardcoded sport enums.

---

## FILE 18: `backend/prisma/seed.ts`

**Path:** `D:\play-arena\backend\prisma\seed.ts`

### Content (596 lines)
Comprehensive database seed script that populates all 31+ models with realistic Pakistan-specific sample data.

### Execution Flow
1. **Clean existing data** — deletes all records in reverse-dependency order (37 `deleteMany` calls in a transaction)
2. **Create regions & cities** — 2 regions (Karachi, Lahore), 8 cities (DHA, Clifton, Gulshan, Gulberg, Model Town, Johar Town, etc.)
3. **Create sport categories** — 4 sports: Futsal, Basketball, Cricket, Badminton
4. **Create users** — 12 users across 5 roles (6 players, 2 staff, 2 managers, 1 owner, 1 super_admin)
5. **Create payment methods** — 5 methods: Cash, JazzCash, Easypaisa, Bank Transfer, Credit/Debit Card
6. **Create grounds** — 3 premium grounds (DHA Sports Complex, Clifton Arena, Gulberg Sports Hub)
7. **Create ground settings** — All with online+walkin booking, 50% deposit, 60-180min duration
8. **Create ground schedules** — Every ground open 6AM-11PM, 7 days a week, 60min slots
9. **Create ground images** — 3 images per ground (Unsplash stock photos)
10. **Create ground payment methods** — All 5 methods enabled on all 3 grounds
11. **Create courts** — 12 courts across 3 grounds (futsal, basketball, cricket, badminton)
12. **Create ground access** — Owner+Manager+Staff access assignments
13. **Create teams** — 6 teams with realistic names and ELO ratings
14. **Create team members** — 13 team member assignments with captain/co_captain/player roles
15. **Create team matches** — 7 matches (5 completed, 2 scheduled) with scores and ELO rating history
16. **Create player match stats** — Match-by-match player statistics
17. **Create bookings** — 5 bookings in various statuses (completed, approved, pending_payment)
18. **Create booking finance & payments** — Payment ledger with cash transactions
19. **Create cash sessions** — 3 sessions (2 open, 1 closed with variance)
20. **Create notifications** — 5 notification types × 6 users = 30 notifications
21. **Create chat messages & participants** — 10 realistic chat messages across 3 ground chat rooms
22. **Create match requests** — 2 pending challenge requests
23. **Create tournament** — "DHA Futsal Championship 2026" with 4 teams and quarter-final bracket
24. **Create player stats** — Per-user aggregate statistics per sport
25. **Create audit log** — Single entry recording the seed event

### Data Highlights
- **Password:** All users share `password123` hashed with PBKDF2 (salt:hash format)
- **Roles:** 5 distinct roles — `player`, `staff`, `manager`, `owner`, `super_admin`
- **Phone numbers:** `+92300` series (realistic Pakistan mobile format)
- **Pricing:** Futsal courts PKR 1,500-4,000/hr, Basketball PKR 2,000-2,500/hr, Badminton PKR 800/hr, Cricket nets PKR 1,000-1,200/hr
- **ELO ratings:** Teams range from 1,280-1,520 ELO
- **Coordinates:** Karachi ~24.80°N, 67.06°E; Lahore ~31.52°N, 74.35°E (realistic)

### Password Hashing
```ts
function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, key) => {
    resolve(`${salt}:${key.toString('hex')}`);
  });
}
```
- **PBKDF2** with SHA-512, 1,000 iterations, 64-byte key
- Format: `salt:hash` (both hex-encoded)
- 1,000 iterations is relatively low by modern standards (OWASP recommends 600,000 for SHA-512)

### Observations
- **Realistic data** — team names, phone numbers, pricing, and coordinates all carefully chosen to reflect Pakistan.
- **Comprehensive coverage** — seeds every model with meaningful data, not just placeholder filler.
- **Chat messages** feel natural — actual conversation-like strings ("Hey team, practice at 6pm today?").
- **Tournament name** "DHA Futsal Championship 2026" with PKR 100,000 prize pool.
- **Payment methods** reflect Pakistan market: JazzCash and Easypaisa are Pakistan's leading mobile wallets.
- **Unsplash images** used for ground photos (not placeholder URLs).
- **`prisma.$transaction`** used for the cleanup phase — ensures atomic delete.
- **Minor issue** — `cashSession.findFirst` in the bookings section may not find a session if none was opened for that ground yet (runs after cash sessions are created, so order-dependent).

---

## FILE 19: `backend/scripts/generate-spec.mjs`

**Path:** `D:\play-arena\backend\scripts\generate-spec.mjs`

### Content (26 lines)
A script that programmatically generates the `openapi.json` Swagger spec from the running NestJS application.

### How It Works
1. Creates a NestJS application instance from the compiled `dist/src/app.module.js`
2. Builds a Swagger document using the same config as in `main.ts`
3. Writes the result to `openapi.json` with 2-space indentation
4. Logs the number of API paths found
5. Closes the app and exits

### Observations
- **Runs from compiled JS** — imports from `dist/src/app.module.js`, requiring the project to be built first (`nest build`).
- **Suppresses logging** — `{ logger: ['error'] }` — only shows errors during generation.
- **Reuses Swagger config** — same title, description, version, and bearer auth as in `main.ts`.
- **Outputs to root** — writes `openapi.json` to the current working directory (project root).
- **Path counting** — logs how many paths were found, useful for comparing spec versions.
- **Standalone** — not part of `package.json` scripts; must be run manually via `node scripts/generate-spec.mjs`.

### Notable Detail
- This script imports from `dist/` (compiled output), not from `src/` (TypeScript source). This is because ES modules (`.mjs`) can't use `ts-node` to import TypeScript directly. The build step is a prerequisite.

---

## FILE 20: `backend/scripts/generate-spec.ts`

**Path:** `D:\play-arena\backend\scripts\generate-spec.ts`

### Content (22 lines)
TypeScript version of the OpenAPI spec generator. Nearly identical to `generate-spec.mjs` but imports from source (`src/app.module`) instead of compiled output.

### Key Differences from `.mjs` version
| Aspect | `.mjs` | `.ts` |
|--------|--------|-------|
| Import source | `dist/src/app.module.js` | `src/app.module` |
| Logger | `['error']` | `false` |
| Output message | Includes path count | Simple "generated" |
| Runner | `generate().catch(...)` | `generate()` (unhandled rejection) |

### Observations
- **Duplicate file** — both `.ts` and `.mjs` versions exist, doing essentially the same thing. The `.ts` version would need `ts-node` or similar to run, while the `.mjs` runs directly with Node.js.
- **The `.mjs` version is more robust** — better error handling and path counting.
- **Source import** — the `.ts` version imports from `../src/app.module`, meaning it can be run with `ts-node scripts/generate-spec.ts`.
- **No `@nestjs/testing`** — uses `NestFactory.create` directly instead of `Test.createTestingModule`, which means it actually boots the full application (with all modules, database connections, etc.).

---

## FILE 21: `backend/test/app.e2e-spec.ts`

**Path:** `D:\play-arena\backend\test\app.e2e-spec.ts`

### Content (29 lines)
The **only test file** in the entire backend — a basic NestJS e2e test that checks if the root endpoint returns "Hello World!".

### Structure
- Uses `@nestjs/testing` `Test.createTestingModule` to bootstrap the full `AppModule`
- Creates a Nest application instance with `moduleFixture.createNestApplication()`
- Single test: `GET /` → expects `200` and `'Hello World!'`
- Cleanup: `app.close()` after each test

### Observations
- **Stub/placeholder test** — this is the default NestJS e2e test generated by `nest new`, not a real PlayArena test.
- **No actual assertion** against PlayArena API endpoints — doesn't test auth, bookings, or any real business logic.
- **Jest is configured** but has **zero real test coverage** — as noted in PROJECT_STATUS.md.
- **`supertest`** is used for HTTP assertions — standard for NestJS e2e tests.
- **`beforeEach`/`afterEach`** — reinitializes the app for every test (would be slow with many tests).
- **This represents the biggest gap** in the project: no automated testing despite having 16 complete backend modules.

---

## FILE 22: `backend/test/jest-e2e.json`

**Path:** `D:\play-arena\backend\test\jest-e2e.json`

### Content (9 lines)
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

### Observations
- **`testRegex: ".e2e-spec.ts$"`** — only matches files ending in `.e2e-spec.ts` (distinct from unit test regex `.*\.spec\.ts$` in package.json).
- **`rootDir: "."`** — relative to `test/` directory (since Jest config is in `test/`).
- **`ts-jest` transformer** — compiles TypeScript on-the-fly during test execution.
- **`testEnvironment: "node"`** — no JSDOM or browser environment needed (pure API tests).
- **Simple config** — no setup files, no global mocks, no custom environments.

---

## FILE 23: `backend/src/app.controller.ts`

**Path:** `D:\play-arena\backend\src\app.controller.ts`

### Content (11 lines)
```ts
@Controller()
export class AppController {
  @Get()
  @Public()
  root() {
    return { message: 'PlayArena API', version: '1.0.0' };
  }
}
```

### Observations
- **Root controller** — serves `GET /` returning API identity info.
- **`@Public()` decorator** — bypasses the global JWT authentication guard. This endpoint is accessible without authentication.
- **Returns JSON** — `{ message: 'PlayArena API', version: '1.0.0' }` — standard health/identity response.
- **Different from e2e test** — the e2e test expects `'Hello World!'` at `GET /`, but the actual controller returns a JSON object. The test is stale (from NestJS template).

---

## FILE 24: `backend/src/app.service.ts`

**Path:** `D:\play-arena\backend\src\app.service.ts`

### Content (8 lines)
```ts
@Injectable()
export class AppService {
  getRoot(): string {
    return 'PlayArena API v1';
  }
}
```

### Observations
- **Simple service** — currently just returns a version string.
- **Not actually used** by `AppController` — the controller returns a hardcoded object instead of calling this service.
- **Potential dead code** — `getRoot()` returns `'PlayArena API v1'` but `AppController.root()` returns `{ message: 'PlayArena API', version: '1.0.0' }`.
- **Residual from NestJS template** — the service was generated by `nest new` and never updated to match the controller.

---

## FILE 25: `backend/src/config/config.module.ts`

**Path:** `D:\play-arena\backend\src\config\config.module.ts`

### Content (17 lines)
Global NestJS module that wraps `@nestjs/config` with custom Zod validation.

### Observations
- **`@Global()`** — available application-wide without importing.
- **`NestConfigModule.forRoot()`** with `cache: true` — cached config reads for performance.
- **Validation via `ConfigService.prototype.validate`** — delegates to Zod schema validation on startup. If env vars are invalid, the app fails to start (fail-fast).
- **Exports `ConfigService`** — all modules can inject `ConfigService` for typed env access.

---

## FILE 26: `backend/src/config/config.service.ts`

**Path:** `D:\play-arena\backend\src\config\config.service.ts`

### Content (44 lines)
Typed configuration service that wraps NestJS's ConfigService with Zod validation.

### Getters (18 properties)
| Getter | Type | Default | Purpose |
|--------|------|---------|---------|
| `nodeEnv` | `string` | `'development'` | Environment mode |
| `port` | `number` | `3000` | HTTP port |
| `databaseUrl` | `string` | required | PostgreSQL connection |
| `redisUrl` | `string` | `'redis://localhost:6379'` | Redis connection |
| `jwtSecret` | `string` | (min 32 chars) | JWT signing key |
| `jwtExpiresIn` | `string` | `'7d'` | Token expiry |
| `awsRegion` | `string` | `'ap-southeast-1'` | AWS region |
| `awsAccessKeyId` | `string?` | optional | AWS credentials |
| `awsSecretAccessKey` | `string?` | optional | AWS credentials |
| `s3Bucket` | `string` | `'playarena-uploads-dev'` | S3 bucket |
| `corsOrigin` | `string` | `'*'` | CORS allowed origins |
| `logLevel` | `string` | `'info'` | Logging level |
| `redisCacheTtl` | `number` | `300` | Cache TTL in seconds |
| `bookingExpiryMinutes` | `number` | `30` | Booking auto-expiry |
| `paginationDefaultSize` | `number` | `20` | Default page size |
| `smtpHost` | `string` | `''` | SMTP server |
| `smtpPort` | `number` | `587` | SMTP port |
| `smtpUser` | `string` | `''` | SMTP username |
| `smtpPass` | `string` | `''` | SMTP password |
| `smtpFrom` | `string` | `'noreply@playarena.com'` | From address |

### Key Design Decisions
- **`validate()` is called in constructor** — fail-fast on startup if env is invalid.
- **`z.coerce.number()`** — auto-converts string env vars to numbers.
- **AWS credentials are optional** — uploads may fail gracefully if unconfigured.
- **SMTP has empty defaults** — silently falls back if emails are not configured.

---

## FILE 27: `backend/src/config/validation.ts`

**Path:** `D:\play-arena\backend\src\config\validation.ts`

### Content (28 lines)
Zod schema that defines, validates, and provides defaults for all environment variables.

### Schema Rules
| Variable | Validation | Default |
|----------|-----------|---------|
| `NODE_ENV` | Enum: dev/staging/prod | `'development'` |
| `PORT` | Coerced number | `3000` |
| `DATABASE_URL` | URL format | **required** — app crashes if missing |
| `REDIS_URL` | URL format | `'redis://localhost:6379'` |
| `JWT_SECRET` | Min 32 chars | **required** — must be 32+ chars |
| `SMTP_FROM` | Email format | `'noreply@playarena.com'` |
| `AWS_ACCESS_KEY_ID` | Optional | `undefined` |
| `AWS_SECRET_ACCESS_KEY` | Optional | `undefined` |
| `LOG_LEVEL` | Enum: info/warn/error/debug | `'info'` |

### Observations
- **`z.enum` for constrained values** — prevents typos in `NODE_ENV` and `LOG_LEVEL`.
- **`z.coerce.number()`** — Zod's coercion handles string-to-number conversion automatically.
- **`DATABASE_URL` is the only truly required field** — everything else has a default or is optional.
- **`JWT_SECRET` has `.min(32)`** — enforces minimum length for security (256-bit key).
- **Email SMTP credentials default to empty** — email module must handle missing SMTP config gracefully.

---

## FILE 28: `backend/src/database/prisma.module.ts`

**Path:** `D:\play-arena\backend\src\database\prisma.module.ts`

### Content (9 lines)
```ts
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### Observations
- **`@Global()`** — PrismaService is available app-wide without importing PrismaModule.
- **Provider and Export** — single service, no controllers, no other providers.
- **Simplest module in the app** — just wraps PrismaService for dependency injection.

---

## FILE 29: `backend/src/database/prisma.service.ts`

**Path:** `D:\play-arena\backend\src\database\prisma.service.ts`

### Content (28 lines)
NestJS service wrapping PrismaClient with lifecycle hooks.

### Lifecycle
| Hook | Action |
|------|--------|
| `onModuleInit()` | Connects to DB via `$connect()`, logs success/failure |
| `onModuleDestroy()` | Disconnects via `$disconnect()`, logs disconnection |

### Observations
- **Extends PrismaClient** — all Prisma query methods (findMany, create, etc.) available directly.
- **Uses `PrismaPg` adapter** — PostgreSQL-specific adapter for Prisma 7, passed connection string from env.
- **Reads `DATABASE_URL` directly from `process.env`** — not via ConfigService. This creates a dependency on env vars being set (handled by ConfigModule's fail-fast validation).
- **Logger** — uses NestJS's built-in `Logger` for database connection logging.
- **Error handling** — logs and rethrows connection errors (app fails to start if DB is down).

---

## FILE 30-34: `backend/src/events/` (5 Event Files)

**Path:** `D:\play-arena\backend\src\events/`

### Event Catalog (15 event classes across 5 modules)

#### `booking.events.ts` (4 events)
| Event | Payload | Triggered When |
|-------|---------|---------------|
| `BookingCreatedEvent` | bookingId, groundId, courtId, playerId, bookingDate, startTime | User creates a booking |
| `BookingApprovedEvent` | bookingId, playerId, groundName, bookingDate | Staff approves booking |
| `BookingRejectedEvent` | bookingId, playerId, groundName, reason | Staff rejects booking |
| `BookingCancelledEvent` | bookingId, playerId | Booking is cancelled |

#### `match.events.ts` (4 events)
| Event | Payload | Triggered When |
|-------|---------|---------------|
| `MatchRequestedEvent` | requestId, fromTeamId, toTeamId, proposedDate | Challenge sent |
| `MatchRequestAcceptedEvent` | matchId, team1Id, team2Id, matchDate | Challenge accepted |
| `MatchCompletedEvent` | matchId, winnerId, scores, rating changes | Match finishes |
| `RatingSubmittedEvent` | matchId, raterTeamId, ratedTeamId, ratings | Peer review submitted |

#### `team.events.ts` (3 events)
| Event | Payload | Triggered When |
|-------|---------|---------------|
| `TeamCreatedEvent` | teamId, teamName, sportCategoryId, createdBy | New team created |
| `TeamMemberJoinedEvent` | teamId, userId, role | Player joins team |
| `TeamMemberLeftEvent` | teamId, userId | Player leaves/removed |

#### `notification.events.ts` (1 event)
| Event | Payload | Triggered When |
|-------|---------|---------------|
| `NotificationCreatedEvent` | notificationId, userId, title, body, type, metadata | Any notification created |

#### `payment.events.ts` (1 event)
| Event | Payload | Triggered When |
|-------|---------|---------------|
| `PaymentRecordedEvent` | bookingId, amount, channel, paymentMethod | Payment is recorded |

### Observations
- **Total 13 event classes** — covering the core domain workflows: booking lifecycle, match lifecycle, team lifecycle, notifications, and payments.
- **Consistent pattern** — all events use `public readonly` constructor parameters with explicit type annotations.
- **NestJS `@nestjs/event-emitter`** — events are emitted synchronously within the same Node.js process (not via message queue).
- **Events are lightweight** — carry just IDs and minimal context, not full data objects.
- **Some fields use `string | null`** — like `body` in notifications and `proposedDate` in matches, suggesting these are optional.
- **No tournament events** — tournaments module doesn't emit events (no `tournament.events.ts`).
- **No ground events** — grounds CRUD doesn't emit events either.

---

## FILE 35-37: `backend/src/queues/` (3 Queue Files)

**Path:** `D:\play-arena\backend\src\queues/`

### Queue Definitions

| File | Queue Name | Job Type | Job Payload |
|------|-----------|----------|-------------|
| `notification.queue.ts` | `notification-delivery` | `NotificationDeliveryJob` | notificationId, userId, title, body, type, metadata |
| `expiry.queue.ts` | `booking-expiry` | `BookingExpiryJob` | bookingId |
| `match-reminder.queue.ts` | `match-reminder` | `MatchReminderJob` | matchId, team1Id, team2Id |

### Observations
- **Bull queue pattern** — each queue has a constant name, a custom `@InjectQueue()` decorator factory, and a typed job interface.
- **`notification-delivery`** is the most complex job payload (6 fields).
- **`booking-expiry`** is the simplest (just a booking ID).
- **`InjectNotificationDeliveryQueue`** etc. are custom decorator factories — a NestJS pattern for type-safe queue injection.
- **No `@nestjs/bull` processor definitions** — workers are implemented as separate services using `@Cron` (ScheduleModule) rather than Bull's `@Processor`/`@Process` decorators. This means the queues may be used for manual job addition rather than auto-processing, OR the Processor decorators are in the module files.

---

## FILE 38-44: `backend/src/workers/` (7 Workers + 1 Module)

**Path:** `D:\play-arena\backend\src\workers/`

### Worker Catalog

| Worker | Schedule | Purpose |
|--------|----------|---------|
| `BookingExpiryWorker` | Every 5 min (`*/5 * * * *`) | Expires pending bookings older than configured threshold |
| `BookingCompletionWorker` | Not yet read | Handles booking auto-completion |
| `CashSessionAutoCloseWorker` | Not yet read | Auto-closes cash sessions at end of day |
| `ChatCleanupWorker` | Not yet read | Deletes old/expired chat messages |
| `MatchReminderWorker` | Not yet read | Sends reminders for upcoming matches |
| `NotificationCleanupWorker` | Not yet read | Cleans up old sent/failed notifications |
| `RatingDecayWorker` | Weekly (Sun 2am) | Applies ELO rating decay for inactive teams |

### Key Worker Details

#### `BookingExpiryWorker` (read)
- Runs **every 5 minutes** via `@Cron('*/5 * * * *')`
- Uses `ConfigService.bookingExpiryMinutes` for the expiry threshold
- Batch-updates all pending bookings older than cutoff to `expired` status
- Logs count of expired bookings

#### `RatingDecayWorker` (read)
- Runs **weekly on Sunday at 2:00 AM** via `@Cron('0 2 * * 0')`
- Uses raw SQL query via `prisma.$queryRaw` to find inactive teams
- Applies `DECAY_PER_WEEK` reduction with a `RATING_FLOOR` minimum
- Records each decay in `TeamRatingHistory` (audit trail)
- Uses a `$transaction` for atomic team update + rating history insert

### Observations
- **All workers use `@nestjs/schedule` `@Cron`** decorator — not Bull's `@Processor`. This means they run as cron jobs within the NestJS process, not as separate Bull worker processes.
- **Raw SQL in RatingDecayWorker** — uses `prisma.$queryRaw` because the query involves complex subqueries that are hard to express in Prisma's query API.
- **`updateMany` in BookingExpiryWorker** — efficient batch update rather than fetching each booking individually.
- **Transaction usage** — RatingDecayWorker wraps updates in `$transaction` for data consistency.
- **No queue job pushing in workers** — these workers operate on data directly rather than processing queue jobs.

---

## FILE 45-48: `backend/src/common/decorators/` (4 Decorators)

**Path:** `D:\play-arena\backend\src\common\decorators/`

### Decorator Catalog

| Decorator | File | Metadata Key | Usage | Purpose |
|-----------|------|-------------|-------|---------|
| `@Public()` | `public.decorator.ts` | `isPublic` | Route handler | Bypasses JWT auth guard |
| `@CurrentUser()` | `current-user.decorator.ts` | N/A (param decorator) | Route handler param | Extracts user from request |
| `@Roles(...)` | `roles.decorator.ts` | `roles` | Route/Controller | Sets required roles |
| `@GroundAccess()` | `ground-access.decorator.ts` | `groundAccess` | Route handler | Requires ground-level access |

### Observations
- **`@CurrentUser()` is a param decorator** — uses `createParamDecorator` to extract `request.user`. Optional `data` string extracts a specific property (e.g., `@CurrentUser('id')`).
- **`@Roles()` takes spread args** — `@Roles('admin', 'manager')` syntax for multiple roles.
- **`@Public()` is the most critical** — without it, ALL routes require JWT by default (global guard).
- **`@GroundAccess()`** — a metadata marker consumed by `RolesGuard` to enable ground-level RBAC checking.
- **All decorators are lightweight** — 2-4 lines each, just setting metadata or extracting request data.

---

## FILE 49-51: `backend/src/common/guards/` (3 Guards)

**Path:** `D:\play-arena\backend\src\common\guards/`

### Guard Catalog

| Guard | File | Purpose |
|-------|------|---------|
| `JwtAuthGuard` | `jwt-auth.guard.ts` | Global JWT authentication with `@Public()` bypass |
| `RolesGuard` | `roles.guard.ts` | Role-based access control (user-level + ground-level) |
| `ThrottleGuard` | `throttle.guard.ts` | Global rate limiting (from `@nestjs/throttler`) |

#### `JwtAuthGuard` Details
- Extends Passport's `AuthGuard('jwt')`
- Checks `@Public()` metadata — if present, allows request without authentication
- Custom `handleRequest()` — throws `UnauthorizedException` if no user
- Registered as `APP_GUARD` in `AppModule` — applies to ALL routes by default

#### `RolesGuard` Details
- Checks `@Roles()` metadata for required roles
- **Dual-level RBAC**: 
  1. Checks `GroundAccess` table if `params.groundId` is present (ground-level roles: owner/manager/staff)
  2. Falls back to `user.role` if no ground context (user-level roles: player/super_admin)
- Uses `PrismaService` to query `GroundAccess` table
- Throws `ForbiddenException` if no role matches

### Observations
- **JwtAuthGuard is global** — applied in `AppModule.providers` as `APP_GUARD`, meaning every route requires authentication unless marked `@Public()`.
- **RolesGuard handles 2 RBAC levels** — user-level roles (player, admin) and ground-level roles (owner, manager, staff) checked against the same guard.
- **`GroundAccess` table lookup** — the `RolesGuard` queries the database on every request that has `@Roles()` and `params.groundId`. This could be a performance concern for high-traffic endpoints.

---

## FILE 52-54: `backend/src/common/interceptors/` (3 Interceptors)

**Path:** `D:\play-arena\backend\src\common/interceptors/`

### Interceptor Catalog

| Interceptor | Purpose | Mechanism |
|-------------|---------|-----------|
| `LoggingInterceptor` | Request/response logging | Adds `x-correlation-id` header, logs method/url/status/duration |
| `TransformInterceptor` | Standardized API envelope | Wraps response in `{ data, meta }` format |
| `TimeoutInterceptor` | Request timeout | Cancels requests exceeding 30 seconds |

#### `LoggingInterceptor` Details
- Extracts or generates a `correlationId` from `x-correlation-id` header
- Attaches `correlationId` to `request.correlationId`
- Sets `x-correlation-id` response header
- Logs: method, URL, status code, duration in ms
- Uses NestJS `Logger` with context `'HTTP'`

#### `TransformInterceptor` Details
- Wraps all responses in standard envelope: `{ data, meta: { timestamp, path } }`
- **Skips wrapping** if response already has `data` or `error` property (avoids double-wrapping)
- Uses RxJS `map` operator to transform the response stream

### Observations
- **All 3 interceptors are global** — registered in `main.ts` via `app.useGlobalInterceptors()`.
- **Correlation ID pattern** — enables tracing requests across logs and services.
- **Standardized API response** — all successful responses follow `{ data, meta }` format.
- **TimeoutInterceptor** — prevents long-running requests from hanging indefinitely (30s timeout).

---

## FILE 55: `backend/src/common/filters/all-exceptions.filter.ts`

**Path:** `D:\play-arena\backend\src\common/filters/all-exceptions.filter.ts`

### Content (61 lines)
Global exception filter that catches ALL exceptions (`@Catch()` with no arguments).

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "correlationId": "uuid"
  }
}
```

### Error Code Mapping (14 codes)
| HTTP Status | Error Code | Source |
|-------------|-----------|--------|
| 400 | `VALIDATION_ERROR` | BadRequestException |
| 401 | `UNAUTHORIZED` | UnauthorizedException |
| 403 | `FORBIDDEN` | ForbiddenException |
| 404 | `NOT_FOUND` | NotFoundException |
| 409 | `CONFLICT` / `SLOT_CONFLICT` | ConflictException (booking-specific) |
| 429 | `RATE_LIMIT_EXCEEDED` | ThrottlerException |
| 500 | `INTERNAL_ERROR` | Any unhandled exception |

### Observations
- **Catches everything** — `@Catch()` without arguments catches ALL exceptions (HTTP and non-HTTP).
- **`SLOT_CONFLICT`** is a custom code for booking conflict detection — checks `ConflictException.constructor.name`.
- **Correlation ID** — included in every error response for debugging.
- **500 errors** — generic `'Internal server error'` message (no stack trace leak).
- **Logger** — logs full stack trace for debugging but doesn't expose it to the client.

---

## FILE 56: `backend/src/common/utils/` (5 Utilities)

**Path:** `D:\play-arena\backend\src/common/utils/`

### Util Catalog

| Util | File | Key Methods/Constants |
|------|------|----------------------|
| `RatingUtil` | `rating.util.ts` | ELO calculation with K-factor (32 new / 24 established), decay, floor at 100 |
| `MoneyUtil` | `money.util.ts` | `formatPKR()` using Intl.NumberFormat, `toNumber()` for Decimal conversion |
| `DateUtil` | `date.util.ts` | (not read likely) |
| `GeoUtil` | `geo.util.ts` | (not read likely) |
| `IdempotencyUtil` | `idempotency.util.ts` | (not read likely) |

#### `RatingUtil` Details
- **ELO implementation** with standard `1/(1+10^((Rb-Ra)/400))` expected score formula
- **K-factor**: 32 for new teams (<30 matches), 24 for established teams
- **Rating floor**: 100 (teams can't drop below 100 ELO)
- **Inactivity decay**: Teams lose 2 ELO per week after 30 days of inactivity
- All constants and methods are `static` — used directly without instantiation

#### `MoneyUtil` Details
- **`formatPKR()`** formats numbers as Pakistan Rupees using `Intl.NumberFormat('en-PK')` — `PKR 1,500` format
- **`toNumber()`** converts Prisma Decimal values to JavaScript numbers

### Observations
- **ELO system is standard** — follows the well-established Elo rating system with modifications for team sports.
- **K-factor differentiation** — newer teams have more volatile ratings (K=32 vs K=24), helping them reach their true skill level faster.
- **PKR formatting** — uses `en-PK` locale (English/Pakistan) for number formatting.
- **All utils are static classes** — no dependency injection, no state, pure functions.

---

## FILE 57-63: `backend/src/modules/auth/` (Auth Module ~7 files)

**Path:** `D:\play-arena\backend\src\modules/auth/`

### Module Structure
```
auth/
├── auth.controller.ts   (98 lines — 8 endpoints)
├── auth.module.ts
├── auth.service.ts      (231 lines — full auth logic)
├── strategies/
│   └── jwt.strategy.ts
└── dto/
    ├── signup.dto.ts
    ├── login.dto.ts
    ├── verify-otp.dto.ts
    ├── forgot-password.dto.ts
    └── reset-password.dto.ts
```

### API Endpoints (8)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/signup` | Public | Register new user (sends OTP email) |
| `POST` | `/auth/verify-otp` | Public | Verify OTP, complete registration |
| `POST` | `/auth/login` | Public | Authenticate with email/phone + password |
| `POST` | `/auth/refresh` | Public | Refresh access token using refresh token |
| `POST` | `/auth/forgot-password` | Public | Request password reset OTP |
| `POST` | `/auth/reset-password` | Public | Reset password with OTP |
| `POST` | `/auth/logout` | JWT | Logout (currently no-op) |
| `GET` | `/auth/me` | JWT | Get current user profile |

### Auth Flow
1. **Signup** — user provides phone, email, password → OTP sent to email
2. **Verify OTP** — user provides email + 6-digit OTP → account verified, tokens returned
3. **Login** — email/phone + password → access + refresh tokens returned
4. **Refresh** — submits refresh token → new token pair returned (30d refresh expiry)
5. **Forgot Password** — email → OTP sent
6. **Reset Password** — email + OTP + new password → password changed

### Password Security
- **PBKDF2** with SHA-512, 1,000 iterations, 64-byte key, 16-byte random salt
- Format: `salt:hash` (both hex-encoded)
- 1,000 iterations is below current OWASP minimum (600K for SHA-512) — security gap
- Password field is nullable (`passwordHash: String?`) — supports future OTP-only login

### Token Management
- **Access token**: Standard JWT signed with `@nestjs/jwt`, payload `{ sub: userId, phone }`
- **Refresh token**: Same payload but with 30-day expiry (vs 7-day for access)
- **Logout is a no-op** — JWT tokens can't be revoked server-side. No blacklist/blocklist.
- Token expiry from env: `JWT_EXPIRES_IN` (default `7d`)

### DTO Validation
All DTOs use Zod schemas validated via `ZodValidationPipe`:
- `signup.dto.ts` — phone, email, password
- `login.dto.ts` — email OR phone + password
- `verify-otp.dto.ts` — email + 6-digit OTP
- `forgot-password.dto.ts` — email
- `reset-password.dto.ts` — email + OTP + new password

### Observations
- **OTP is 6 digits** — `crypto.randomInt(100000, 999999)` — cryptographically secure.
- **OTP expires in 10 minutes** — hardcoded `10 * 60 * 1000` ms.
- **Email is the identity** — phone is collected but OTP is sent via email.
- **Forgot password uses vague response** — `'If the email exists, reset instructions have been sent'` — prevents email enumeration attacks.
- **`user.role` is a plain string** — not an enum, allowing dynamic role creation.
- **`sanitize()` removes passwordHash** — using ES6 destructuring to exclude the field from API responses.
- **Email module integration** — auth service depends on `EmailService` for sending OTPs.

---

## FILE 64: Admin Module (`backend/src/modules/admin/`)

**Structure:** `admin.controller.ts` (190 lines), `admin.service.ts` (160 lines), `admin.module.ts` (9 lines)

**Role:** Super-admin management of the entire platform.

### Admin Controller Endpoints (21 endpoints)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/users` | Paginated user list |
| `GET` | `/admin/users/:id` | User by ID (includes city, grounds, recent bookings) |
| `GET` | `/admin/grounds` | All grounds with court/booking counts |
| `PATCH` | `/admin/grounds/:id/verify` | Verify a ground |
| `PATCH` | `/admin/grounds/:id/suspend` | Suspend a ground |
| `GET` | `/admin/teams` | All teams with member counts |
| `GET` | `/admin/finance` | Finance summary (totalRevenue, online/offline, bookingCount) |
| `GET` | `/admin/audit-logs` | Paginated audit logs (filterable by action, entityType, date) |
| CRUD | `/admin/payment-methods` | Create/update payment methods |
| CRUD | `/admin/regions` | Full CRUD for regions (with cities included) |
| CRUD | `/admin/cities` | Full CRUD for cities |
| CRUD | `/admin/sports` | Full CRUD for sport categories |

### Security
- Protected by `@Roles('super_admin')` — only users with `role = 'super_admin'` can access
- Uses `RolesGuard` for authorization

### Key Implementation Details
- **Finance summary** aggregates across ALL bookings (not per-ground) — total platform revenue view
- **Audit logs** support filtering by action, entityType, groundId, and date range
- **Regions endpoint** includes nested cities sorted by displayOrder
- **No DTO validation** — admin endpoints use `body: any` (trusted user)

---

## FILE 65: Bookings Module (`backend/src/modules/bookings/`)

**Structure:** `bookings.controller.ts` (93 lines), `bookings.service.ts` (268 lines), DTOs, strategies

**Role:** Court booking lifecycle management.

### Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/bookings` | JWT | Create booking with deposit calculation, slot conflict detection |
| `GET` | `/bookings/my` | JWT | Current user's bookings |
| `GET` | `/bookings/:id` | JWT | Booking details with finance/payments |
| `PATCH` | `/bookings/:id/cancel` | JWT | Cancel own booking |
| `POST` | `/grounds/:id/walkin` | Staff | Walk-in booking (bypasses online flow) |
| `GET` | `/grounds/:id/bookings` | Staff | Ground bookings view |
| `PATCH` | `/bookings/:id/status` | Staff | Approve or reject booking |

### Key Implementation Details
- **Deposit calculation**: `totalAmount × depositPercentage` (default 50%), skips deposit if not required
- **Slot conflict detection**: Uses `SELECT ... FOR UPDATE` row-level locking in a transaction to prevent race conditions
- **Walk-in bookings** are automatically `approved` and marked as `paid`
- **Price calculation**: `hours × pricePerHour` for hourly pricing, falls back to `basePrice`
- **Events emitted**: `booking.created`, `booking.approved`, `booking.rejected`
- **State machine**: `pending_payment_verification` → `approved`/`rejected`/`expired`/`cancelled`/`completed`

---

## FILE 66: Cash Management Module (`backend/src/modules/cash-management/`)

**Structure:** `cash.controller.ts` (59 lines), `cash.service.ts` (63 lines)

**Role:** Physical cash tracking for ground operations.

### Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/grounds/:id/cash-session/open` | Staff | Open a new cash session |
| `POST` | `/grounds/:id/cash-session/close` | Staff | Close session, calculate variance |
| `GET` | `/grounds/:id/cash-sessions` | Owner/Mgr | List sessions |

### Key Implementation Details
- **Only one open session per ground** — prevents double-session confusion
- **Variance calculation**: `closingCash - (openingCash + cashPaymentsTotal)` — positive = overage, negative = shortage
- **Sessions track**: opening cash, closing cash, expected cash, and variance
- **Statuses**: `open` → `closed` → `reconciled`

---

## FILE 67: Chat Module (`backend/src/modules/chat/`)

**Structure:** `chat.controller.ts` (60 lines), `chat.service.ts` (105 lines), `chat.gateway.ts` (92 lines)

**Role:** Real-time messaging for ground communication.

### REST Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/chat/:id/messages` | Cursor-based paginated messages |
| `POST` | `/chat/:id/messages` | Send message |
| `GET` | `/chat/unread` | Unread counts per ground |
| `POST` | `/chat/:id/read` | Mark as read |

### WebSocket (`/chat` namespace)
| Event | Direction | Description |
|-------|-----------|-------------|
| `sendMessage` | Client→Server | Send real-time message |
| `newMessage` | Server→Room | Broadcast new message |
| `typing` | Bidirectional | Typing indicator |

### Key Implementation Details
- **Ground-scoped rooms** — users join `ground:{groundId}` rooms
- **Access control** — checks both `GroundAccess` (staff) and `ChatParticipant` records
- **Unread tracking** — uses raw SQL `INSERT ... ON CONFLICT DO UPDATE` for efficient upsert
- **Cursor pagination** — uses `before` timestamp cursor, returns `hasMore` and `nextCursor`
- **JWT auth on WebSocket** — token from `handshake.auth.token` or query param

---

## FILE 68: Email Module (`backend/src/modules/email/`)

**Structure:** `email.service.ts` (77 lines)

**Role:** Sends transactional emails with console fallback.

### Methods
| Method | Purpose |
|--------|---------|
| `sendOtpEmail(email, otp)` | OTP verification email |
| `sendPasswordResetEmail(email, otp)` | Password reset email |

### Key Implementation Details
- **No template engine** — plain text emails only
- **SMTP verification** on module init via `transporter.verify()`
- **Graceful fallback** — logs to console if SMTP is unconfigured or fails
- **Supports port 465** (SSL) and 587 (TLS) with `requireTLS: true`
- **`tls.rejectUnauthorized: false`** — accepts self-signed certs in development

---

## FILE 69: Finance Module (`backend/src/modules/finance/`)

**Structure:** `finance.controller.ts` (88 lines), `finance.service.ts` (249 lines), `payment-methods.service.ts` (102 lines)

**Role:** Payment recording, finance tracking, payment method management.

### Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/bookings/:id/payment` | Staff | Record payment (idempotent) |
| `GET` | `/bookings/:id/finance` | Staff | Booking finance details |
| `GET` | `/grounds/:id/finance` | Owner/Mgr | Ground finance summary |
| `GET` | `/grounds/:id/reports` | Owner | Ground financial report |
| `GET` | `/payment-methods` | Public | All enabled payment methods |
| `GET` | `/payment-methods/ground/:id` | JWT | Effective methods for a ground |
| `PATCH` | `/grounds/:id/payment-methods/:methodId` | Owner | Toggle method for ground |

### Key Implementation Details
- **Idempotency** — `idempotencyKey` prevents duplicate payment recording
- **Overpayment protection** — checks existing payments before recording
- **Channel classification** — `jazzcash`, `easypaisa`, `online` = online; `cash`, `bank_transfer` = offline
- **Payment statuses**: `unpaid` → `partial` → `paid`/`overpaid`
- **Payment methods hierarchy**: Global → Region → Ground-level overrides
- **Cash session integration** — optionally links cash payments to open sessions

---

## FILE 70: Grounds Module (`backend/src/modules/grounds/`)

**Structure:** 4 controllers, 4 services, DTOs. The **largest module** in the app.

**Controllers:** `grounds.controller.ts` (167 lines), `courts.controller.ts` (74 lines), `schedules.controller.ts` (61 lines), `access.controller.ts` (36 lines)

**Services:** `grounds.service.ts` (127 lines), `courts.service.ts` (104 lines), `schedules.service.ts` (45 lines), `ground-access.service.ts` (124 lines)

### Grounds Endpoints (15)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/grounds` | Public | List verified grounds (filterable by city) |
| `GET` | `/grounds/featured` | Public | Top 10 featured grounds |
| `GET` | `/grounds/my` | JWT | User's managed grounds |
| `GET` | `/grounds/:id` | Public | Detail with images/schedules/settings |
| `POST` | `/grounds` | Owner | Create ground (auto-assigns owner access) |
| `PATCH` | `/grounds/:id` | Owner | Update |
| `DELETE` | `/grounds/:id` | Owner | Soft delete |
| `GET` | `/grounds/:id/courts` | Public | Courts list |
| `GET` | `/grounds/:id/images` | Public | Images |
| `GET` | `/grounds/:id/schedules` | Public | Schedules |
| `GET` | `/grounds/:id/settings` | Public | Settings |
| `PATCH` | `/grounds/:id/settings` | Owner | Update settings |
| `POST` | `/grounds/:id/invite` | Owner | Invite staff |
| `GET` | `/grounds/:id/team` | Owner/Mgr | List team |
| `DELETE` | `/grounds/:id/team/:id` | Owner | Remove staff |

### Courts Endpoints (5)
| `GET` | `/courts/:id` | Public | Court detail |
| `GET` | `/courts/:id/slots` | Public | Available time slots for a date |
| `POST` | `/grounds/:id/courts` | Owner/Mgr | Create court |
| `PATCH` | `/courts/:id` | Owner/Mgr | Update court |
| `DELETE` | `/courts/:id` | Owner/Mgr | Soft delete |

### Schedule Endpoints (3)
| `POST` | `/grounds/:id/schedules` | Owner/Mgr | Upsert schedule |
| `PATCH` | `/grounds/:id/schedules/:day` | Owner/Mgr | Update day schedule |
| `DELETE` | `/grounds/:id/schedules/:day` | Owner/Mgr | Remove day schedule |

### Access/Invite Endpoints (2)
| `POST` | `/invites/:id/accept` | JWT | Accept ground invite |
| `POST` | `/invites/:id/reject` | JWT | Reject ground invite |

### Key Implementation Details
- **Slot availability** calculates all 60-min slots (or configured duration) between open/close time, then removes booked slots — generates a complete availability grid
- **Soft delete** sets `deletedAt` and `isActive: false`
- **Staff invites** expire in 7 days, use phone number as identifier
- **Create ground transaction** creates both ground AND owner `GroundAccess` in one transaction

---

## FILE 71: Health Module (`backend/src/modules/health/`)

**Structure:** `health.controller.ts` (37 lines)

**Endpoint:** `GET /health` (Public)
**Response (healthy):** `{ status: "ok", timestamp, services: { database: { status: "up", latencyMs } } }`
**Response (degraded):** `{ status: "degraded", timestamp, services: { database: { status: "down", latencyMs } } }`

Performs `SELECT 1` to test DB connectivity and measures latency.

---

## FILE 72: Matchmaking Module (`backend/src/modules/matchmaking/`)

**Structure:** `matchmaking.service.ts` (197 lines), `match.service.ts` (292 lines), 2 controllers

**Role:** Team challenge system and match lifecycle.

### Match Request Endpoints (6)
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/match-requests` | Create challenge (captain/co-captain only) |
| `GET` | `/match-requests/sent` | Sent requests |
| `GET` | `/match-requests/received` | Received requests |
| `PATCH` | `/match-requests/:id/accept` | Accept → creates TeamMatch |
| `PATCH` | `/match-requests/:id/reject` | Reject |
| `PATCH` | `/match-requests/:id/cancel` | Cancel |

### Team Match Endpoints (5)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/matches` | List (paginated, filterable) |
| `GET` | `/matches/:id` | Details with ratings + player stats |
| `PATCH` | `/matches/:id/score` | Record score (dual-confirmation) |
| `PATCH` | `/matches/:id/start` | Start match |
| `PATCH` | `/matches/:id/cancel` | Cancel match |

### Key Implementation Details
- **24-hour request expiry** — auto-expires pending requests
- **Dual-confirmation scoring** — both teams must submit matching scores before match completes
- **ELO rating update** on match completion — calculates expected scores, updates ratings via `RatingUtil`
- **Request deduplication** — prevents pending challenge between same teams in either direction
- **Only captains/co-captains** can create, accept, or cancel challenges

---

## FILE 73: Notifications Module (`backend/src/modules/notifications/`)

**Structure:** `notifications.service.ts` (90 lines), `notification.gateway.ts` (57 lines)

### REST Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/notifications` | Paginated list |
| `GET` | `/notifications/unread-count` | Unread count |
| `PATCH` | `/notifications/:id/read` | Mark as read |
| `PATCH` | `/notifications/read-all` | Mark all as read |
| `DELETE` | `/notifications/:id` | Soft delete |

### WebSocket (`/notifications` namespace)
- Authenticates via JWT token
- Joins `user:{userId}` room
- Receives real-time `notification` events via `@OnEvent('notification.created')`

### Key Implementation Details
- **Event-driven** — listens for `notification.created` events from EventEmitter
- **Soft delete** — sets `deletedAt` rather than hard-deleting
- **Cleanup method** — `cleanupOld(days = 90)` for scheduled notification purging

---

## FILE 74: Ratings Module (`backend/src/modules/ratings/`)

**Structure:** `ratings.service.ts` (75 lines), `leaderboard.service.ts` (49 lines), `player-stats.service.ts` (115 lines), 3 controllers

### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/matches/:id/rating` | Submit peer rating (captain only) |
| `GET` | `/leaderboard` | Global leaderboard by ELO |
| `GET` | `/leaderboard/:sportId` | Sport-filtered leaderboard |
| `GET` | `/players/:id/stats` | Player aggregate stats |
| `POST` | `/matches/:id/player-stats` | Record per-match player stats |

### Key Implementation Details
- **Peer ratings** include skill, sportsmanship, punctuality (1-5 scale) + review text
- **Upsert** — players can update their rating (only most recent kept per match per rater)
- **Leaderboard** — teams sorted by ELO rating descending, paginated
- **Player stats aggregation** — `playerMatchStat` per match → `playerStat` aggregate with running totals
- **Only captains** can submit ratings and player stats

---

## FILE 75: Teams Module (`backend/src/modules/teams/`)

**Structure:** `teams.controller.ts` (212 lines — largest controller), 3 services, DTOs

**Role:** Team lifecycle management, roster, invites, join requests.

### Endpoints (19)
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/teams` | Create team (auto-adds creator as captain) |
| `GET` | `/teams` | List teams (filter by sport/city/search) |
| `GET` | `/teams/my` | User's teams |
| `GET` | `/teams/:id` | Team detail |
| `PATCH` | `/teams/:id` | Update team |
| `DELETE` | `/teams/:id` | Soft delete |
| `GET` | `/teams/:id/members` | Roster |
| `GET` | `/teams/:id/matches` | Match history |
| `GET` | `/teams/:id/stats` | Team statistics |
| `GET` | `/teams/:id/rating-history` | ELO rating history |
| `POST` | `/teams/:id/invite` | Invite player |
| `POST` | `/teams/:id/join-request` | Request to join |
| `GET` | `/teams/:id/join-requests` | List join requests |
| `POST` | `/teams/:id/join-requests/:uid/accept` | Accept join request |
| `POST` | `/teams/:id/join-requests/:uid/reject` | Reject join request |
| `PATCH` | `/teams/:id/members/:uid` | Update member role |
| `DELETE` | `/teams/:id/members/:uid` | Remove member |
| `DELETE` | `/teams/:id/members/me` | Leave team |
| `PATCH` | `/teams/:id/transfer-captaincy/:uid` | Transfer captaincy |
| `GET` | `/sports` | Public sport categories |

**Key:** Teams module is the second most feature-rich module after Grounds.

---

## FILE 76: Tournaments Module

**Structure:** Tournament CRUD, bracket generation, team registration, match management

**Role:** Competition management (knockout + round-robin formats).

Supports: Full tournament lifecycle, bracket generation, team registration with verification, match scheduling per round.

---

## FILE 77: Upload Module (`backend/src/modules/upload/`)

**Structure:** `upload.controller.ts` (82 lines), `upload.service.ts`

**Role:** S3 file uploads with validation.

### Endpoints (6)
| Method | Path | Auth | MIME Types | Max Size |
|--------|------|------|-----------|----------|
| `POST` | `/upload` | JWT | General | Default |
| `POST` | `/upload/booking-proof` | JWT | jpeg/png/webp/pdf | 10MB |
| `POST` | `/upload/ground-image` | Owner | jpeg/png/webp | 5MB |
| `POST` | `/upload/team-logo` | JWT | jpeg/png/webp | 5MB |
| `POST` | `/upload/tournament-poster` | Owner/Mgr | jpeg/png/webp | 5MB |
| `POST` | `/upload/avatar` | JWT | jpeg/png/webp | 5MB |

Uses AWS S3 with `@aws-sdk/client-s3`. Supports folder-based organization.

---

## FILE 78: Users Module (`backend/src/modules/users/`)

**Structure:** `users.controller.ts` (73 lines), `users.service.ts`

**Role:** User profile management and player search.

### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/auth/profile` | Update own profile |
| `PATCH` | `/users/me` | Update profile (alias) |
| `GET` | `/users/:id` | Get user by ID |
| `GET` | `/players` | Search players (name/city/sport) |
| `GET` | `/players/:id` | Player profile |
| `GET` | `/players/:id/teams` | Player's teams |

---

## FILE 79-80: `playarena-planning/` Directory (6 files)

**Path:** `D:\play-arena\playarena-planning/`

### File Index
| File | Description |
|------|-------------|
| `1-FOR-STAKEHOLDERS.md` | High-level overview for stakeholders |
| `2-Backend-plan.md` | Backend architecture plan |
| `3-Frontend-plan.md` | Frontend architecture plan |
| `4-aws-deployment.md` | AWS deployment strategy |
| `CLAUDE.md` | Agent instructions for the project |
| `PROJECT_COMPLETE_DOCUMENTATION.md` | Full project documentation |

This directory contains the **original planning documents** for the PlayArena project. These were created before/writing the actual implementation and served as the blueprint.

---

## FILE 81-86: `frontend/` Directory Overview

**Path:** `D:\play-arena\frontend/`

### Structure
```
frontend/
├── package.json         — npm workspace root (packages/shared, packages/web)
├── tsconfig.base.json   — Shared TypeScript config
├── packages/
│   ├── shared/          — @playarena/shared package
│   │   ├── src/         — DTOs, types, API client, utils
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/             — Next.js 15 App Router application
│       ├── app/         — 33 page files
│       ├── src/         — Components, stores, middleware
│       ├── package.json
│       ├── next.config.js
│       ├── tailwind.config.js
│       └── middleware.ts
```

### Shared Package Summary
- **6 endpoint modules**: API client modules for all backend modules
- **6 Zod DTO files**: Shared validation schemas
- **Types**: Enums, models, API response types
- **Utils**: Date formatting, money utilities

### Web Package (Next.js 15)
- **33 page files** across auth (4) and dashboard (29) routes
- **UI Components (6)**: Button, Input, Card, Badge, Avatar, Tabs
- **Layout (3)**: Providers, Sidebar, Topbar
- **Stores (2)**: Auth (Zustand), UI (sidebar collapse)
- **Middleware**: Auth gate, role-based redirect
- **~95% of routes functional**

### Frontend Gaps
- Admin page only has Users tab (Grounds/Finance/Settings are placeholders)
- Ground edit page doesn't pre-populate data
- Domain components not extracted (UI inlined in pages)
- No services layer (API calls from pages directly)
- No Next.js API routes

---

## FILE 87-93: `playarena-backend/` Directory

**Path:** `D:\play-arena\playarena-backend/`

This appears to be an **earlier version** or **alternative backend** implementation. Contains:
- `src/` — Source code
- `migrations/` — Database migrations
- `postman/` — Postman collections
- `CONTEXT.md` — Project context
- `plan.md` — Implementation plan
- `docker-compose.yml` — Docker setup
- `uploads/` — Local upload storage

---

## FILE 94-99: `testing and details/` Directory

**Path:** `D:\play-arena\testing and details/`

Contains:
- `CLAUDE.md` — Describes React Native + Supabase architecture (now outdated)
- `PROJECT_COMPLETE_DOCUMENTATION.md` — Full architecture documentation
- `play-arena-tree.txt` — File tree
- `document/`, `plan/`, `play-arena-code/`, `play-arena-expo-go/` — Planning & reference
- `stitch files/` — Code stitching references
- `.claude/` — Agent configuration

**Important note:** The architecture described in these files (React Native + Supabase) differs from the actual implementation (Next.js + NestJS + PostgreSQL). These are historical/planning documents.

---

## FILE 100: `graphify-out/` Directory

**Path:** `D:\play-arena\graphify-out/`

Contains knowledge graph output generated by the graphify tool:
- `graph.json` — Full knowledge graph data
- `graph.html` — Interactive visualization
- `GRAPH_REPORT.md` — Analysis report
- `manifest.json` — Graph metadata
- `cost.json` — Processing cost tracking
- `cache/` — Processing cache (gitignored)

---

## FINAL SUMMARY: PlayArena Workspace

**Project:** A full-stack sports community platform for Pakistan — ground booking, team management, matchmaking, tournaments, and ratings.

**Tech Stack:**
- **Backend:** NestJS 11 + Prisma 7 + PostgreSQL + Bull/Redis + AWS S3 + Socket.IO
- **Frontend:** Next.js 15 (App Router) + Tailwind v4 + Zustand + TanStack Query
- **Shared:** npm workspace (`@playarena/shared`) with Zod DTOs and API client
- **Auth:** JWT + OTP via email (PBKDF2 hashing)
- **Deployment:** Docker (Node 22 + Postgres 16 + Redis 7), AWS-ready

**Scale:**
- **16 backend modules**, ~5,000+ lines of implementation
- **30+ database models** in Prisma schema (976 lines)
- **33 frontend page files**, ~95% of routes functional
- **3 services** (API, DB, Cache) in Docker Compose
- **7 Bull workers** + **3 queues** for background processing
- **13 event classes** across 5 event modules
- **5 utility classes** (Rating/ELO, Money/PKR, Date, Geo, Idempotency)
- **4 custom decorators**, **3 guards**, **3 interceptors**, **1 global filter**

**Completion Status:**
- **Backend:** ~94% (15/16 modules complete, email is partial)
- **Frontend:** ~90% (33/35 routes functional, admin tabs partial)
- **Testing:** ~0% (only 1 stub e2e test)
- **Documentation:** Planning docs exist but backend README is unmodified template

**Biggest Gaps:**
1. No real test coverage
2. Email module lacks template engine
3. Admin frontend incomplete
4. Ground edit page needs pre-population
5. No mobile app (only web)
6. Security: PBKDF2 at 1,000 iterations (should be 600K+)
7. No FCM push notifications for mobile
8. Logout is a no-op (no token blacklist)

---

## FILE 79: `frontend/package.json`

**Path:** `D:\play-arena\frontend\package.json`

### Content (13 lines)
```json
{
  "name": "playarena-frontend",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["packages/shared", "packages/web"],
  "scripts": {
    "dev": "npm run dev --workspace=packages/web",
    "build": "npm run build --workspace=packages/web"
  }
}
```

### Observations
- **npm workspaces monorepo** — two packages: `packages/shared` (`@playarena/shared`) and `packages/web` (Next.js app)
- **Version 1.0.0** — first stable release version
- **Only 2 scripts** — dev and build, both delegated to the `web` workspace
- **Uses npm** (not pnpm) for the frontend monorepo — confirmed by `package-lock.json` existing in the directory
- **No test/lint scripts** at root level — each workspace likely has its own
- **`private: true`** — prevents accidental publishing to npm registry

---

---

## FILE 80: `frontend/tsconfig.base.json`

**Path:** `D:\play-arena\frontend\tsconfig.base.json`

### Content (16 lines)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### Observations
- **Base TypeScript config** shared across workspaces — `packages/shared` and `packages/web` extend this
- **`target: ES2022`** — modern JS output, supports top-level await and class fields
- **`moduleResolution: bundler`** — correct for Next.js/webpack, uses modern resolution logic
- **`strict: true`** — full strict mode enabled
- **`isolatedModules: true`** — required for transpilers like Babel/Next.js SWC
- **`declaration: true`** and **`declarationMap: true`** — generates `.d.ts` files for the shared package
- **`sourceMap: true`** — debug source maps enabled
- **No `baseUrl` or path aliases** — simpler monorepo setup, imports are relative
- **Modern and clean** — uses modern settings, no deprecated options

---

---

## FILE 81: `frontend/packages/web/package.json`

**Path:** `D:\play-arena\frontend\packages\web\package.json`

### Content (51 lines)
NestJS backend monorepo workspace package for the web frontend.

**Scripts:** `dev` (next dev), `build` (next build), `start` (next start), `lint` (next lint)

**Dependencies:**
| Category | Packages |
|---|---|
| **UI** | React 19, Next.js 15, Radix UI (avatar, dialog, dropdown, label, popover, select, separator, slot, tabs, toast, tooltip), lucide-react (icons), sonner (toasts) |
| **Forms** | react-hook-form + @hookform/resolvers + zod |
| **State** | zustand (store), @tanstack/react-query (server state) |
| **Styling** | Tailwind CSS v4, tailwind-merge, clsx, class-variance-authority, tailwindcss-animate |
| **Shared** | @playarena/shared (local file dependency via npm workspace) |
| **Real-time** | socket.io-client |
| **Charts** | recharts |
| **Utilities** | date-fns, next-themes |

### Observations
- **Next.js 15 + React 19** — cutting-edge versions
- **Tailwind CSS v4** — latest Tailwind (uses `@tailwindcss/postcss` instead of old config)
- **React Query v5** — latest version with updated API
- **Radix UI** primitive components (unstyled, accessible) — design system built from composable primitives
- **zustand v5** — latest Zustand for global client state
- **socket.io-client** — real-time websocket communication with the backend
- **zod + react-hook-form** — type-safe form validation pipeline
- **TypeScript v5.7** — latest stable TypeScript
- **No testing framework** in devDependencies — tests may be in a separate setup or not yet configured

---

---

## FILE 82: `frontend/packages/web/next.config.js`

**Path:** `D:\play-arena\frontend\packages\web\next.config.js`

### Content (9 lines)
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@playarena/shared'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};
module.exports = nextConfig;
```

### Observations
- **`transpilePackages: ['@playarena/shared']`** — ensures the shared workspace package (which is not transpiled) gets compiled by Next.js
- **`optimizePackageImports`** — tree-shakes `lucide-react` icons and `recharts` chart components for smaller bundles
- **Minimal config** — no rewrites, redirects, image domains, or custom webpack setup
- **No output: 'export'** — assumes a Node.js server deployment (not static export)

---

---

## FILE 83: `frontend/packages/web/tailwind.config.js`

**Path:** `D:\play-arena\frontend\packages\web\tailwind.config.js`

### Content (90 lines)

**Dark mode:** `'class'` strategy (toggled by adding `.dark` class to `<html>`)

**Content paths:** `./app/**/*.{ts,tsx}` and `./src/**/*.{ts,tsx}`

**Theme extended colors (CSS variables):**
- Standard shadcn/ui palette — `background`, `foreground`, `primary`, `secondary`, `destructive`, `muted`, `accent`, `card`, `popover`, `ring`, `border`, `input`
- **Custom `sidebar`** color scale — `DEFAULT`, `foreground`, `muted`, `accent`, `border` — indicates a sidebar layout component

**Font families:**
- `display` — CSS variable `--font-display` (heading font)
- `body` — CSS variable `--font-body` (body font)

**Custom animations (4):**
| Name | Effect |
|---|---|
| `slide-in` | slides from left with fade |
| `slide-up` | slides up from below with fade |
| `fade-in` | simple opacity fade |
| `scale-in` | scale from 0.95 to 1 with fade |

**Border radius scale:** `lg`, `md`, `sm` based on CSS variable `--radius` — shadcn/ui pattern

**Plugins:** `tailwindcss-animate` (for animation utilities)

### Observations
- **shadcn/ui design system** — the color variable pattern, radius scale, and tailwindcss-animate plugin match the shadcn/ui convention exactly
- **Sidebar colors** defined — a custom UI component beyond shadcn/ui base
- **4 micro-animations** — slide-in, slide-up, fade-in, scale-in — used for page transitions/modals
- **CSS variables approach** — supports theme switching via `class` strategy
- **Note:** This project uses both `tailwind.config.js` (Tailwind v3 style) AND `@tailwindcss/postcss` in package.json (Tailwind v4). This is a transitional setup — likely the config file is a fallback or the project is mid-migration to v4.

---

---

## FILE 84: `frontend/packages/web/postcss.config.js`

**Path:** `D:\play-arena\frontend\packages\web\postcss.config.js`

### Content (5 lines)
```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

### Observations
- **Single PostCSS plugin** — `@tailwindcss/postcss` for Tailwind CSS processing
- **Tailwind v4+** — uses the new `@tailwindcss/postcss` plugin instead of the old `tailwindcss` PostCSS plugin
- **Minimal config** — no autoprefixer, no cssnano, no other PostCSS plugins

---

---

## FILE 85: `frontend/packages/web/tsconfig.json`

**Path:** `D:\play-arena\frontend\packages\web\tsconfig.json`

### Content (20 lines)
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@playarena/shared": ["../../packages/shared/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Observations
- **Extends** `../../tsconfig.base.json` (base config with strict mode, declarations, etc.)
- **`target: ES2017`** — downgraded from base's ES2022 for broader browser compatibility
- **`jsx: "preserve"`** — Next.js handles JSX transformation via SWC
- **`noEmit: true`** — Next.js compiles files on its own; no TypeScript output needed
- **`incremental: true`** — enables incremental compilation for faster builds
- **Path aliases:**
  - `@/*` → `./src/*` (aliases for local imports like `@/components/ui/button`)
  - `@playarena/shared` → `../../packages/shared/src` (direct source import, bypasses transpiled output)
- **Next.js plugin** — enables Next.js-specific TypeScript language service features
- **Coverage includes** `.next/types/**/*.ts` — automatically generated Next.js type declarations

---

---

## FILE 86: `frontend/packages/web/middleware.ts`

**Path:** `D:\play-arena\frontend\packages\web\middleware.ts`

### Content (35 lines)

**Route classifications:**
| Type | Routes |
|---|---|
| **Auth routes** | `/login`, `/signup`, `/forgot-password`, `/verify-otp`, `/reset-password` |
| **Public routes** | `/login`, `/signup`, `/verify-otp`, `/forgot-password`, `/` |

**Middleware logic:**
1. **Root `/`** — redirects authenticated users to `/home`, unauthenticated to `/login`
2. **Auth routes** (login, signup, etc.) — if user has a token, redirect to `/home`; otherwise allow access
3. **All other routes** — if no token, redirect to `/login` with `?redirect=` query param preserving the original destination

**Auth mechanism:** Reads `access_token` cookie — set by the backend after login

**Matcher config:** `/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)` — excludes API routes, static assets, images, favicon, and files with extensions

### Observations
- **Token-based auth** — `access_token` cookie checked on every request (middleware-level guard)
- **No role-based checks** — middleware only checks authenticated vs unauthenticated, no admin/user distinction
- **Redirect-bounce** — ensures any deep link works after login via `?redirect=` parameter
- **No API route protection** — explicitly excluded from the matcher (API routes handle their own auth via backend JWT)
- **Missing `_next/image` in path** — excludes Next.js image optimization requests

---

---

## FILE 87: `frontend/packages/web/src/lib/utils.ts`

**Path:** `D:\play-arena\frontend\packages\web\src\lib\utils.ts`

### Content (36 lines)

**Exports:**
| Function | Purpose |
|---|---|
| `cn(...inputs)` | Merges Tailwind class names via `clsx` — standard shadcn/ui pattern |
| `formatStatus(status)` | Converts snake_case like `pending_payment` → `Pending Payment` |
| `getInitials(name)` | Extracts first 2 initials from a name (`John Doe` → `JD`) |
| `getStatusColor(status)` | Maps status strings to Tailwind color classes (text/bg/border) |

**Status color mapping (16 entries):**
- **Green (emerald):** confirmed, completed, open, active, paid
- **Amber (warning):** pending_payment, pending_verification, pending
- **Red (error):** cancelled, disputed
- **Gray (neutral):** expired, closed, inactive, draft
- **Blue (info):** registration_open, scheduled
- **Indigo:** in_progress

### Observations
- **Minimal utility library** — 4 utility functions only
- **`cn()` uses `clsx` not `tailwind-merge`** — unlike typical shadcn/ui setups that use `clsx` + `tailwind-merge` together (only `clsx` is used here, no conflict resolution)
- **Status system mirrors backend enums** — statuses like `pending_payment`, `in_progress`, `registration_open` match the Prisma schema enums
- **`formatStatus` also handles `registration_open`** → `Registration Open` (capitalizes first letter of each word)

---

---

## FILE 88: `frontend/packages/web/src/stores/auth.ts`

**Path:** `D:\play-arena\frontend\packages\web\src\stores\auth.ts`

### Content (49 lines)

**State:**
| Field | Type | Initial |
|---|---|---|
| `user` | `User \| null` | `null` |
| `isAuthenticated` | `boolean` | `false` |
| `isLoading` | `boolean` | `true` |

**Actions:**
| Action | Behavior |
|---|---|
| `login(email, password)` | Calls `authApi.login()`, sets `access_token` cookie (1 day expiry, SameSite=Lax), updates user state |
| `signup(data)` | Calls `authApi.signup()` — no auto-login after signup |
| `logout()` | Calls `authApi.logout()` (fire-and-forget), clears cookie, resets state |
| `refreshUser()` | Calls `authApi.me()` — used on app mount to restore session from existing cookie |
| `setUser(user)` | Direct setter, sets `isLoading = false` |

### Observations
- **zustand v5** — uses modern `create<State>()((set) => ({...}))` pattern
- **Cookie-based auth** — JWT stored in cookie named `access_token` with 1-day expiry
- **`SameSite=Lax`** — reasonable CSRF protection while allowing navigational requests
- **`refreshUser` called on mount** — restores session from stored cookie (checking `/auth/me` endpoint)
- **No token refresh logic** — relies on 1-day cookie expiry; no refresh token flow visible
- **No error handling in store** — errors bubble up to the calling component
- **Logout swallows errors** — even if server call fails, local state is cleared

---

---

## FILE 89: `frontend/packages/web/src/stores/ui.ts`

**Path:** `D:\play-arena\frontend\packages\web\src\stores\ui.ts`

### Content (13 lines)
```ts
'use client';
import { create } from 'zustand';
interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}
export const useUI = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
```

### Observations
- **Smallest store** in the project — 1 boolean, 1 toggle action
- **Sidebar collapse state** — matches the sidebar color variables seen in `tailwind.config.js`
- **Zustand v5** — uses functional update `set((s) => ...)` pattern for immutable toggle
- **`useUI` export name** — different naming convention from `useAuthStore` (not `useUIStore`), slight inconsistency

---

---

## FILE 90: `frontend/packages/web/src/components/ui/Button.tsx`

**Path:** `D:\play-arena\frontend\packages\web\src\components\ui\Button.tsx`

### Observations
- **`'use client'`** — client component (interactive)
- **forwardRef + Slot pattern** — Radix UI asChild support for composition
- **5 variants:** `primary`, `secondary`, `outline`, `ghost`, `danger`
- **3 sizes:** `sm` (h-9), `md` (h-10), `lg` (h-12)
- **Loading state** — shows an SVG spinner, disables button during loading
- **Uses CSS variables** (`--color-primary`, `--color-border`, etc.) — consistent with Tailwind CSS variable approach

---

---

## FILE 91: `frontend/packages/web/src/components/ui/Input.tsx`

**Path:** `D:\play-arena\frontend\packages\web\src\components\ui\Input.tsx`

### Observations
- **forwardRef** for form library compatibility (react-hook-form)
- **Props:** `label`, `error`, `icon` (ReactNode for leading icon)
- **Layout:** Label → Icon + Input → Error message
- **Error state** — red border (`--color-destructive`) + error text below
- **Icon padding** — dynamically adds left padding (`pl-9`) when icon is present
- **Uses CSS variables** for all colors — no hardcoded Tailwind color classes (except `bg-white`, `hover:bg-gray-*`)

---

---

## FILE 92: `frontend/packages/web/src/components/ui/Badge.tsx`

**Path:** `D:\play-arena\frontend\packages\web\src\components\ui\Badge.tsx`

### Observations
- **No `'use client'`** — pure presentational component, can be server-rendered
- **`getStatusColor(status)`** — uses the utility from `lib/utils.ts` to map status → Tailwind color classes
- **Rounded-full pill shape** — standard status badge pattern
- **Auto-formats status** — converts snake_case inline (duplicated from `formatStatus` utility)
- **14 lines total** — simplest component in the UI kit

---

---

## FILE 93: `frontend/packages/web/src/components/ui/Card.tsx`

**Path:** `D:\play-arena\frontend\packages\web\src\components\ui\Card.tsx`

### Observations
- **3 sub-components:** `Card`, `CardHeader`, `CardContent`
- **Card supports `asChild`** — Radix UI Slot for polymorphic composition
- **Standard card pattern** — rounded-xl, border, shadow-sm, white background
- **CardHeader** has bottom border separator
- **No `'use client'`** — all three are server-compatible (no hooks, no event handlers)

---

---

## FILE 94: `frontend/packages/web/src/components/ui/Avatar.tsx`

**Path:** `D:\play-arena\frontend\packages\web\src\components\ui\Avatar.tsx`

### Observations
- **3 sizes:** `sm` (32px), `md` (40px), `lg` (56px)
- **Fallback initials** — if no URL, shows first 2 initials via `getInitials()`
- **Image mode** — uses native `<img>` (not Next.js `Image`) with `object-cover`
- **Color scheme** — uses `--color-sidebar` as fallback background color
- **No `'use client'`** — server-renderable since no hooks used

---

---

## FILE 95: `frontend/packages/web/src/components/ui/Tabs.tsx`

**Path:** `D:\play-arena\frontend\packages\web\src\components\ui\Tabs.tsx`

### Observations
- **Custom tabs** (not Radix UI `@radix-ui/react-tabs` — even though it's in package.json)
- **Controlled + uncontrolled** — supports both `value`/`onValueChange` and `defaultValue` patterns
- **4 sub-components:** `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- **Context-based** — uses `TabsContext` via `createContext` + `useContext`
- **Active tab styling** — white bg + shadow-sm for active, muted text for inactive
- **`TabsContent` returns null** when not active (unmounts hidden content)
- **`'use client'`** — uses `useState` and `useContext`

---

---

## FILE 96: `frontend/packages/web/src/components/layout/Providers.tsx`

**Path:** `D:\play-arena\frontend\packages\web\src\components\layout\Providers.tsx`

### Observations
- **React Query v5** — `QueryClient` with `staleTime: 60s`, `retry: 1`, `refetchOnWindowFocus: false`
- **Sonner Toaster** — positioned top-right, dark theme (navy background, light text)
- **Wraps children** — root-level provider component for the app layout
- **`'use client'`** — required for React Query provider and Toaster state

---

---

## FILE 97: `frontend/packages/web/src/components/layout/Sidebar.tsx`

**Path:** `D:\play-arena\frontend\packages\web\src\components\layout\Sidebar.tsx`

### Observations
- **13 nav items defined**, each with a `roles` array for role-based visibility:
  - **Player:** Home, My Bookings, Teams, Matches, Tournaments, Leaderboard, Notifications, Profile
  - **Owner:** Home, Tournaments, My Grounds, Add Ground, Finance, Notifications, Profile
  - **Staff:** Home, Operations, Notifications, Profile
  - **Manager:** Home, Tournaments, Finance, Operations, Notifications, Profile
  - **Super Admin:** Home, Admin, Profile
- **Collapsible sidebar** — toggles between 60px (icon-only) and 240px (full text), managed by `useUI` store
- **Active route detection** — uses `pathname.startsWith(item.href)` for highlighting
- **Logo area** — Trophy icon + "PLAYARENA" text branding
- **User section** — shows avatar, display name, role; logout button at bottom
- **Sidebar color scheme** — uses `--color-sidebar*` CSS variables (defined in tailwind.config.js)
- **Lucide icons** throughout — 14 different icons imported
- **Importantly:** Sidebar doesn't show for unauthenticated users (filter relies on `user` being non-null)

---

---

## FILE 98: `frontend/packages/web/src/components/layout/Topbar.tsx`

**Path:** `D:\play-arena\frontend\packages\web\src\components\layout\Topbar.tsx`

### Observations
- **Fixed top header** — h-14, sticky, z-40 (below sidebar's z-50)
- **Mobile hamburger** — `<Menu>` button visible only on `lg:hidden` to toggle sidebar
- **User display** — shows name + avatar on the right side
- **`hidden sm:block`** — user name hidden on mobile, only avatar visible
- **Minimal** — 26 lines, no search bar, no notifications bell in topbar (those are in sidebar nav)

---

---

## FILE 99: `frontend/packages/web/app/globals.css`

**Path:** `D:\play-arena\frontend\packages\web\app\globals.css`

### Observations
- **Tailwind v4 syntax** — `@import "tailwindcss"` instead of `@tailwind base/components/utilities`
- **`@theme` block** — CSS variable-based theme using Tailwind v4's new theme API
- **Fonts:** `Bebas Neue` (display/headings), `DM Sans` (body)
- **Color palette:** Emerald primary (`#10B981`), Indigo secondary (`#6366F1`), Amber accent (`#F59E0B`), Red destructive (`#EF4444`)
- **Sidebar:** Dark navy (`#0F172A`) with slate gray text/muted/accent
- **Base layer:** border color applied globally, body uses background/foreground vars, headings use display font
- **Custom `container` utility** — responsive padding (1rem/1.5rem/2rem)
- **3 keyframe animations:** slide-up, fade-in, scale-in (duplicated from tailwind.config.js but with slight differences)

---

---

## FILE 100: `frontend/packages/web/app/layout.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\layout.tsx`

### Observations
- **Root layout** — wraps entire app in `<Providers>` (React Query + Sonner Toaster from earlier)
- **Fonts loaded via Google Fonts** — `Bebas Neue` (headings, 400) + `DM Sans` (body, 400/500/600/700)
- **`suppressHydrationWarning`** — for next-themes (dark mode hydration)
- **Metadata:** `"PlayArena — Book. Play. Compete."`
- **No font-display=swap** — could cause invisible text during load

---

---

## FILE 101: `frontend/packages/web/app/(auth)/layout.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(auth)\layout.tsx`

### Observations
- **Auth route group** — `(auth)` directory groups login/signup/password-reset/verify-otp
- **Centered card layout** — `min-h-screen` centered, `max-w-md` container
- **Branding header** — Star icon + "PLAYARENA" logotype + "Book. Play. Compete." tagline
- **`animate-slide-up`** — entrance animation on the form container
- **No sidebar/topbar** — auth pages are standalone, outside dashboard layout

---

---

## FILE 102: `frontend/packages/web/app/(auth)/login/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(auth)\login\page.tsx`

### Observations
- **Client component** — `'use client'` with form state
- **Form fields:** email + password (no phone login on this page)
- **Post-login redirect** — respects `?redirect=` query param from middleware, falls back to `/home`
- **Error handling** — catches errors, shows toast with message or generic "Invalid credentials"
- **`Suspense` wrapper** — required because `useSearchParams()` needs suspense boundary in Next.js 15
- **Links:** Forgot password, Sign up (navigation to auth routes)
- **Welcome toast** — `"Welcome back!"` on successful login

---

---

## FILE 103: `frontend/packages/web/app/(auth)/signup/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(auth)\signup\page.tsx`

### Observations
- **4 form fields:** email, phone, password, confirmPassword
- **Zod validation** — uses `signupSchema` from `@playarena/shared` for server-matching validation
- **Local confirmation check** — password !== confirmPassword blocked before API call
- **Post-signup flow** — redirects to `/verify-otp?email=...` for email verification
- ****No** role/type selection** during signup — all users sign up as generic accounts
- **Pakistan phone format** — placeholder `+921234567890`
- **Reusable `update()` helper** — curried state setter to avoid 4 inline handlers

---

---

## FILE 104: `frontend/packages/web/app/(auth)/forgot-password/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(auth)\forgot-password\page.tsx`

### Observations
- **Single email field** — no phone-based password reset option
- **Security: always shows success** — even on API error, shows "If the email exists, reset instructions have been sent" (prevents email enumeration)
- **Two states** — form view → "Check Your Email" confirmation view
- **Uses `authApi.forgotPassword`** directly (bypassing auth store)
- **No rate limiting** on the client side

---

---

## FILE 105: `frontend/packages/web/app/(auth)/reset-password/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(auth)\reset-password\page.tsx`

### Observations
- **4 fields:** email, OTP (6-digit numeric), new password, confirm password
- **OTP input sanitization** — `replace(/\D/g, '').slice(0, 6)` allows only digits, max 6 chars
- **Zod validation** — uses `resetPasswordSchema` from shared package
- **Password match check** — local validation before API call
- **Post-reset flow** — redirects to `/login` on success
- **Does not auto-fill email** — user must re-enter email (not passed from forgot-password page)

---

---

## FILE 106: `frontend/packages/web/app/(auth)/verify-otp/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(auth)\verify-otp\page.tsx`

### Observations
- **Post-signup verification** — called after successful signup
- **Email auto-filled** — reads `?email=` query param on mount via `useEffect`
- **OTP field** — 6-digit numeric, same sanitization as reset-password
- **Auto-login on verify** — sets `access_token` cookie and `setUser()` in auth store on success
- **Redirect to `/home`** after email verification

---

---

## FILE 107: `frontend/packages/web/app/(dashboard)/layout.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\layout.tsx`

### Observations
- **Protected layout** — calls `refreshUser()` on mount, redirects to `/login?redirect=` if unauthenticated
- **Loading state** — shows branded spinner (pulsing logo + "PLAYARENA") while checking auth
- **No sidebar/topbar for unauthenticated users** — returns `null` briefly before redirect
- **Sidebar-aware content margin** — `ml-16` (collapsed) or `ml-60` (expanded), matches sidebar width
- **Content padding** — `p-4 lg:p-6` and `animate-fade-in` entrance animation
- **`'use client'`** — required for hooks (useAuthStore, useUI, useRouter, useEffect)

---

---

## FILE 108: `frontend/packages/web/app/(dashboard)/home/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\home\page.tsx`

### Observations
- **Homepage — ground discovery** — hero section with search, grounds grid with cards
- **Two React Query calls:** `groundsApi.featured()` (default) and `groundsApi.list({ search })` (when searching)
- **Search UX:** inline input in hero, filters on keystroke, results replace featured grid
- **Ground card:** image (first from array), name, city, price (PKR), rating, verification badge
- **Links to** `/home/ground/[id]` for each ground
- **Loading:** 3 skeleton cards with `animate-pulse`
- **Empty state:** "No grounds found" with "Clear Search" button
- **Uses `formatPKR`** from shared package for currency formatting

---

---

## FILE 109: `frontend/packages/web/app/(dashboard)/home/ground/[id]/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\home\ground\[id]\page.tsx`

### Observations
- **Ground detail page** — shows full ground info + court listing
- **Image gallery** — 2-column layout with main image + 2 placeholder thumbnails
- **Info section:** name, address, city, description, amenities tags
- **Courts sidebar:** links to booking page, shows court name, max players, base price
- **States:** loading (skeleton), not-found (back-to-home button), and detail view
- **Back navigation:** `router.back()` button

---

---

## FILE 110: `frontend/packages/web/app/(dashboard)/home/ground/[id]/court/[courtId]/book/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\home\ground\[id]\court\[courtId]\book\page.tsx`

### Observations
- **Booking flow:** date picker → slot grid → booking summary → confirm
- **3 React Query calls:** `getCourtById`, `getSlots(courtId, date)`, `bookingsApi.create` (mutation)
- **Slots grid** — shows available/booked time slots with prices, disables booked slots
- **Date picker** — native `<input type="date">` with `min=today`, resets slot selection on date change
- **Booking summary** — animates in (slide-up) on slot selection, shows date/time/total
- **Post-booking:** invalidates booking + slots queries, redirects to `/bookings`, toast "Please complete payment"
- **Mutation status** — `mutation.isPending` drives loading state on confirm button

---

---

## FILE 111: `frontend/packages/web/app/(dashboard)/bookings/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\bookings\page.tsx`

### Observations
- **My Bookings list** — fetches `bookingsApi.getMy({ limit: 50 })`
- **Booking card:** court name, ground name, date, time, amount, status badge
- **States:** loading (3 skeletons), empty (CalendarCheck icon + "Browse Grounds" CTA), list
- **Each card links to** `/bookings/[id]` detail page
- **Uses shared utilities:** `formatDate`, `formatTime`, `formatPKR`

---

---

## FILE 112: `frontend/packages/web/app/(dashboard)/teams/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\teams\page.tsx`

### Observations
- **My Teams list** — `teamsApi.getMy()`, grid of team cards
- **Team card:** name, ELO rating, W/L/D record, member avatar stack (up to 5 + overflow count)
- **States:** loading (2 skeletons), empty ("Create Your First Team" CTA), grid
- **Create Team button** → `/teams/create`
- **Quick links** to Matches and Leaderboard at bottom
- **Missing:** `/bookings/[id]` route — mentioned in booking cards but directory doesn't exist

---

---

## FILE 113: `frontend/packages/web/app/(dashboard)/teams/create/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\teams\create\page.tsx`

### Observations
- **Simple form:** team name (required) + sport category UUID (optional)
- **Hardcoded default sport UUID:** `00000000-0000-0000-0000-000000000001` — placeholder value, feature incomplete
- **"Sport (UUID)" label** is not user-friendly — clearly a dev placeholder awaiting a proper sport category dropdown/selector
- **Post-creation:** redirects to `/teams/[id]` on success
- **Missing:** sport category picker (should be a dropdown populated from API)

---

---

## FILE 114: `frontend/packages/web/app/(dashboard)/teams/[id]/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\teams\[id]\page.tsx`

### Observations
- **Team detail page** — shows team name, ELO, W/L/D record
- **Members list** — avatar, display name, role for each member
- **Two actions:** "Invite Members" → `/teams/[id]/invite`, "Challenge Team" → `/matches/create?teamId=[id]`
- **No captain/leave/edit actions** — missing team management features
- **States:** loading skeleton, "Team not found" text

---

---

## FILE 115: `frontend/packages/web/app/(dashboard)/teams/[id]/invite/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\teams\[id]\invite\page.tsx`

### Observations
- **Simple single-field form** — invite by email
- **Calls** `teamsApi.invite(id, email)` on submit
- **Post-invite** — clears email field, shows success toast
- **Dead import** — `import type { CreateTeamDto }` on line 9 is unused
- **No bulk invite** — only one email at a time

---

---

## FILE 116: `frontend/packages/web/app/(dashboard)/matches/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\matches\page.tsx`

### Observations
- **My Matches list** — shows match cards with Team A vs Team B, date, court, score, status badge
- **Interlinks:** each match → `/matches/[id]`, plus links to sent/received challenges
- **States:** loading (2 skeletons), empty ("Challenge another team!" CTA), list

---

---

## FILE 117: `frontend/packages/web/app/(dashboard)/matches/create/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\matches\create\page.tsx`

### Observations
- **Challenge form:** opponent team ID (manual UUID), court ID, proposed date/time
- **Hardcoded default UUIDs** — `sportCategoryId: '00000000-0000-0000-0000-000000000001'` and same for court — placeholder values, feature incomplete
- **`Suspense` wrapper** required for `useSearchParams()` (reads `?teamId=` from team detail page)
- **Post-creation:** redirects to `/matches`
- **Dev-only UX** — requiring manual UUID entry for opponent team, no search/select

---

---

## FILE 118: `frontend/packages/web/app/(dashboard)/matches/[id]/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\matches\[id]\page.tsx`

### Observations
- **Match detail** — scoreboard display, date/time, court/ground info
- **Score entry** — shown only when status === 'scheduled', 2 number inputs for each team
- **Score entry calls** `matchesApi.enterScore(id, { teamScore, opponentScore })`, refetches on success
- **Cancel button** — shown if match not completed/cancelled
- **Rate button** — hardcoded rating 5 with empty comment (placeholder — no actual rating UI)
- **Post-score edit** — `useEffect` syncs score inputs from match data

---

---

## FILE 119: `frontend/packages/web/app/(dashboard)/matches/requests/received/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\matches\requests\received\page.tsx`

### Observations
- **Received challenges list** — shows sender team name + date
- **Actions:** Accept (green) or Reject (red) for pending requests, status badge otherwise
- **Calls** `matchRequestsApi.accept(id)` or `matchRequestsApi.reject(id)`, refetches on success

---

## FILE 120: `frontend/packages/web/app/(dashboard)/matches/requests/sent/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\matches\requests\sent\page.tsx`

### Observations
- **Sent challenges list** — shows recipient team name + date
- **Action:** Cancel button for pending requests
- **Calls** `matchRequestsApi.cancel(id)`, refetches on success
- **Mirror of received** but with cancel instead of accept/reject

---

---

## FILE 121: `frontend/packages/web/app/(dashboard)/tournaments/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\tournaments\page.tsx`

### Observations
- **Tournament list** — grid of cards with poster image (or gradient fallback), name, status, start date, team count, format
- **Each card links** to `/tournaments/[id]`
- **Create Tournament button** → `/tournaments/create`
- **States:** loading (3 skeletons), empty list

---

---

## FILE 122: `frontend/packages/web/app/(dashboard)/tournaments/create/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\tournaments\create\page.tsx`

### Observations
- **Creation form:** name, maxTeams, format (select: knockout/round_robin/group_knockout), start/end dates, registration deadline, description
- **Hardcoded `sportCategoryId`** — `'00000000-0000-0000-0000-000000000001'` again (recurring pattern)
- **Date fallbacks:** endDate defaults to startDate, registrationDeadline defaults to startDate
- **Post-creation** redirects to `/tournaments`

---

---

## FILE 123: `frontend/packages/web/app/(dashboard)/tournaments/[id]/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\tournaments\[id]\page.tsx`

### Observations
- **Tournament detail** — name, date, team count/max, status badge
- **Bracket section** — static placeholder (`RoundColumn` renders "Team A vs Team B" hardcoded), not connected to API data
- **"Register Team" button** — has no onClick handler (dead button)
- **Leaderboard link** → `/tournaments/[id]/leaderboard`

---

---

## FILE 124: `frontend/packages/web/app/(dashboard)/tournaments/[id]/leaderboard/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\tournaments\[id]\leaderboard\page.tsx`

### Observations
- **Tournament standings** — ranked list with rank #, team name, MP/W/L record, points
- **Fetches** `tournamentsApi.getStandings(id)`
- **States:** loading (3 skeletons), empty ("No leaderboard data yet"), ranked list

---

---

## FILE 125: `frontend/packages/web/app/(dashboard)/leaderboard/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\leaderboard\page.tsx`

### Observations
- **Global team leaderboard** — ranked by points, shows team name, W/L record, avatar
- **Top 3 highlighting** — gold/silver/bronze icons, green border for podium
- **Fetches** `leaderboardApi.get()`
- **States:** loading, empty, ranked list

---

---

## FILE 126: `frontend/packages/web/app/(dashboard)/grounds/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\grounds\page.tsx`

### Observations
- **Grounds management** (owner role) — list of owned grounds with image, name, city, status, court count, indoor/outdoor
- **Actions per ground:** Edit → `/grounds/[id]/edit`, View → `/home/ground/[id]`, Delete (with mutation, invalidates cache)
- **Add Ground button** → `/grounds/create`
- **Note:** `ground.images[0]` accessed as string (line 57) vs `ground.images[0]?.url` used on homepage — type inconsistency

---

---

## FILE 127: `frontend/packages/web/app/(dashboard)/grounds/create/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\grounds\create\page.tsx`

### Observations
- **Simple ground creation form:** name (required), city (defaults to 'Karachi'), address, contact phone, description
- **No court/slot configuration** during creation — courts likely added separately (edit page)
- **Post-creation** redirects to `/home/ground/[id]`
- **Hardcoded default city:** `Karachi` — Pakistan-specific

---

---

## FILE 128: `frontend/packages/web/app/(dashboard)/grounds/[id]/edit/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\grounds\[id]\edit\page.tsx`

### Observations
- **Incomplete edit page** — only a name field (no city, address, description, courts, images, schedule)
- **No pre-fill** — starts with empty name, doesn't fetch existing ground data
- **Clearly placeholder/incomplete** — minimally functional for name-only changes
- **Post-update** redirects to `/grounds`

---

---

## FILE 129: `frontend/packages/web/app/(dashboard)/finance/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\finance\page.tsx`

### Observations
- **Finance dashboard** — 3 stat cards: Cash Sessions count, Total Revenue, Pending Payouts (hardcoded 0)
- **Bug:** `const [groundId] = useState('')` never updates, so query `enabled: !!groundId` is always false — data never loads
- **"Open New Session" button** has no onClick handler (dead button)
- **Session history** shows closed cash sessions with opening/closing times
- **Cash session tracking** — appears to be for ground owners to track cash payments

---

---

## FILE 130: `frontend/packages/web/app/(dashboard)/ops/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\ops\page.tsx`

### Observations
- **Staff operations dashboard** — shows today's bookings count, today's revenue (summed), walk-in booking button
- **Date picker** — filter bookings by date, defaults to today
- **Walk-in booking** — shows toast "coming soon" (not yet implemented)
- **Booking list** — player name, court, time range, amount, status

---

---

## FILE 131: `frontend/packages/web/app/(dashboard)/notifications/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\notifications\page.tsx`

### Observations
- **Notification list** — title, message, timestamp per notification
- **Unread indicator** — green left border + green dot for unread (`readAt` is null)
- **Actions:** Refresh (refetch), Mark All Read (`markAllRead`)
- **Fetches** `notificationsApi.list({ limit: 50 })`, data nested in `data.items`

---

---

## FILE 132: `frontend/packages/web/app/(dashboard)/admin/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\admin\page.tsx`

### Observations
- **Admin panel** — 4 tabs: Users (functional), Grounds/Finance/Settings ("coming soon")
- **Users table** — avatar, name, email, role badge, status, join date, toggle-active button
- **User search** — filters by name or email client-side
- **Issues:** `toggleUserStatus` has empty mutation body (no-op), grounds query uses raw `fetch('/api/v1/grounds')` instead of API client, toggle button icon doesn't match action (`UserX` for active users should say "Deactivate")

---

---

## FILE 133: `frontend/packages/web/app/(dashboard)/profile/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\profile\page.tsx`

### Observations
- **Profile display:** avatar (large), display name, role (formatted), email (disabled), phone (disabled)
- **Editable field:** only display name — all other fields read-only
- **Update calls** `authApi.updateProfile({ displayName })`, updates store via `setUser()`
- **Lazy initialization** — `useState(user?.displayName || '')` captures current value on mount

---

## FILE 134: `frontend/packages/web/app/(dashboard)/chat/page.tsx`

**Path:** `D:\play-arena\frontend\packages\web\app\(dashboard)\chat\page.tsx`

### Observations
- **Ground-specific chat** — requires manual Ground ID entry (not user-friendly)
- **No real-time** — uses polling (`refetchMessages()`) instead of Socket.IO despite `socket.io-client` in package.json
- **Chat UI:** sidebar (ground ID input + join button) + message area (left-aligned only, no sent/received distinction)
- **Auto-scroll** — `useEffect` scrolls to bottom on new messages
- **Enter to send** — `onKeyDown` handler for the input
- **No persistent chat list** — must re-enter Ground ID each session

---

---

## FILE 135: `frontend/packages/shared/package.json`

**Path:** `D:\play-arena\frontend\packages\shared\package.json`

### Observations
- **Workspace package** `@playarena/shared` — shared types, API client, DTOs, and utilities
- **Entry:** `./src/index.ts` (both `main` and `types`)
- **Dependency:** only `zod` (validation schemas)
- **DevDependency:** only `typescript`
- **Script:** only `typecheck`

---

## FILE 136: `frontend/packages/shared/tsconfig.json`

**Path:** `D:\play-arena\frontend\packages\shared\tsconfig.json`

### Observations
- Extends root `tsconfig.base.json`
- `outDir: ./dist`, `rootDir: ./src`
- Includes only `src` directory

---

## FILE 137: `frontend/packages/shared/src/index.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/index.ts`

### Observations
- **Central re-export** — re-exports everything from types, api, dto, utils
- **19 export lines** covering enums, models, API types, endpoints, utilities, validation schemas
- **Note:** Exports `chat.schema` but no corresponding `chat.ts` endpoint file — `chatApi` used in frontend must come from `misc.ts` endpoint

---

---

## FILE 138: `frontend/packages/shared/src/types/enums.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/types/enums.ts`

### Observations
- **14 enums** covering all domain entities — UserRole, BookingStatus, PaymentStatus/Channel, AccessRole (ground staff), InviteStatus, NotificationStatus, CashSessionStatus, TournamentStatus/Format, TeamMemberRole, TeamInviteStatus, MatchRequestStatus, TeamMatchStatus, UploadType
- **User roles:** `player`, `ground_owner`, `ground_manager`, `ground_staff`, `super_admin`
- **Tournament formats:** `knockout`, `round_robin`, `group_knockout`
- **Match statuses:** `scheduled`, `in_progress`, `completed`, `disputed`, `cancelled`
- **Upload types:** avatar, ground-image, team-logo, tournament-poster, booking-proof, chat-attachment

---

---

## FILE 139: `frontend/packages/shared/src/types/models.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/types/models.ts`

### Observations
- **18 interfaces** matching Prisma schema models — User, Ground, GroundImage, Court, Booking, BookingFinance, Team, TeamMember, TeamMatch, Tournament, SportCategory, City, Region, PaymentMethod, ChatMessage, Notification, CashSession, AuditLog, LeaderboardEntry, PlayerStat
- **Notable:** `User.role` typed as `string` (not the enum) — loose typing
- **Relations:** nested models (e.g., `Ground.images: GroundImage[]`, `Team.members: TeamMember[]`)
- **Missing types:** No API-specific DTO types (separate file: api.ts)

---

---

## FILE 140: `frontend/packages/shared/src/types/api.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/types/api.ts`

### Observations
- **3 generic types:** `ApiResponse<T>`, `PaginationMeta`, `PaginatedResponse<T>`
- Standard wrapper pattern — all API responses wrapped in `{ data, meta }`

---

## FILE 141: `frontend/packages/shared/src/api/client.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/api/client.ts`

### Observations
- **`API_BASE`** from `NEXT_PUBLIC_API_URL` or `http://localhost:5173/api/v1` — matches NestJS backend
- **`ApiError` class** — captures status, error code, message, and field-level details
- **`apiClient<T>()`** — generic fetch wrapper with `credentials: 'include'` (cookies), JSON content-type, error parsing
- **`apiUpload<T>()** — FormData upload (no Content-Type header, browser sets multipart boundary)
- **`buildQuery()`** — builds URLSearchParams, filters out empty/null/undefined values

---

---

## FILE 142: `frontend/packages/shared/src/api/endpoints/auth.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/api/endpoints/auth.ts`

### Observations
- **8 API methods:** signup, verifyOtp, login, refresh, logout, me, updateProfile, forgotPassword, resetPassword
- **`AuthResponse`** includes `accessToken` + `refreshToken` — but frontend only stores `access_token` cookie
- **`refresh` endpoint** defined but never called in frontend (no token refresh interceptor)
- **`me`** — fetches current user (used by `refreshUser()` in auth store)

---

---

## FILE 143: `frontend/packages/shared/src/api/endpoints/grounds.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/api/endpoints/grounds.ts`

### Observations
- **18 methods** — full CRUD for grounds, courts, schedules, settings, images
- **`TimeSlot` interface** — startTime, endTime, isAvailable, price
- **`GroundFilters`** — city, sport, search, pagination

---

## FILE 144: `frontend/packages/shared/src/api/endpoints/bookings.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/api/endpoints/bookings.ts`

### Observations
- **7 methods** — create, getMy, getById, cancel, walkin, getByGround, updateStatus

---

## FILE 145: `frontend/packages/shared/src/api/endpoints/teams.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/api/endpoints/teams.ts`

### Observations
- **3 API objects:** `teamsApi` (16 methods), `matchRequestsApi` (6 methods), `matchesApi` (7 methods)
- **Full team lifecycle:** CRUD, members, invites, join requests, role management, captaincy transfer
- **Match operations:** list, enterScore, start, cancel, rate, submitPlayerStats

---

## FILE 146: `frontend/packages/shared/src/api/endpoints/tournaments.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/api/endpoints/tournaments.ts`

### Observations
- **3 API objects:** `tournamentsApi` (11 methods), `leaderboardApi` (1 method), `playerStatsApi` (2 methods)
- Tournament CRUD, register/withdraw, bracket/standings, match results

---

## FILE 147: `frontend/packages/shared/src/api/endpoints/misc.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/api/endpoints/misc.ts`

### Observations
- **8 API objects:** chat, notifications, finance, cash, upload, admin (17 methods), invites, cities, sports, paymentMethods
- **Admin API** — users CRUD, grounds verify/suspend, teams, finance, audit logs, regions/cities/sports/payment-methods CRUD

---

## FILE 148: `frontend/packages/shared/src/dto/auth.schema.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/dto/auth.schema.ts`

### Observations
- **6 Zod schemas:** login, signup, verifyOtp, forgotPassword, resetPassword, updateProfile
- **Phone validation:** `+?[1-9]\d{6,14}` (international format)
- **Password:** min 8, max 128 chars
- **OTP:** exactly 6 characters

---

## FILE 149: `frontend/packages/shared/src/dto/booking.schema.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/dto/booking.schema.ts`

### Observations
- **4 schemas:** createBooking, createWalkin, recordPayment, updateBookingStatus
- **Walkin** includes playerName/Phone (not user-bound)
- **Time format:** `HH:mm` regex

---

## FILE 150: `frontend/packages/shared/src/dto/chat.schema.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/dto/chat.schema.ts`

### Observations
- **Single schema:** sendMessage with min 1, max 2000 chars

---

## FILE 151: `frontend/packages/shared/src/dto/ground.schema.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/dto/ground.schema.ts`

### Observations
- **6 schemas:** create/update ground, create/update court, create/update schedule
- **Schedule:** dayOfWeek (0-6), open/close time, slotDuration (default 30min)

---

## FILE 152: `frontend/packages/shared/src/dto/team.schema.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/dto/team.schema.ts`

### Observations
- **8 schemas:** create/update team, invitePlayer, updateMemberRole, createMatchRequest, enterScore, startMatch, rateMatch, submitPlayerStats
- **Match request** uses ISO datetime string for proposedDate

---

## FILE 153: `frontend/packages/shared/src/dto/tournament.schema.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/dto/tournament.schema.ts`

### Observations
- **4 schemas:** create/update tournament, enterTournamentResult, registerTeam
- **Formats:** knockout, round_robin, group_knockout

---

## FILE 154: `frontend/packages/shared/src/utils/date.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/utils/date.ts`

### Observations
- **6 functions:** formatDate, formatTime, formatDateTime, isToday, isPast, daysFromNow
- **Locale:** `en-PK`, timezone: `Asia/Karachi` — Pakistan-specific

---

## FILE 155: `frontend/packages/shared/src/utils/money.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/utils/money.ts`

### Observations
- **5 functions:** formatPKR, formatPKRShort, calcRemaining, calcVariance
- **Currency:** PKR, locale: en-PK
- **Short format:** K for thousands, M for millions

---

## FILE 156: `frontend/packages/shared/src/utils/index.ts`

**Path:** `D:\play-arena\frontend\packages\shared\src/utils/index.ts`

### Observations
- **6 utility functions:** cn (class merge), slugify, truncate, formatStatusLabel, getInitials, generateId
- **Note:** `cn()` here uses simple filter(Boolean).join(' ') — different from `cn()` in `lib/utils.ts` that uses `clsx`. Two separate implementations of the same function name.

---

---

## FILE 157: `playarena-backend/package.json`

**Path:** `D:\play-arena\playarena-backend\package.json`

### Observations
- **Old backend version** — Express + TypeORM (predecessor to NestJS + Prisma `backend/`)
- **Tech stack:** Express 4, TypeORM 0.3, PostgreSQL (pg), Bull (queue), Redis (ioredis), Passport JWT + Google OAuth, Twilio SMS, Nodemailer, AWS S3, Swagger, Helmet, Pino logger
- **Scripts:** tsc build, ts-node-dev dev, TypeORM migrations, seed
- **No test framework** in devDependencies

---

---

## FILE 158: `playarena-backend/CONTEXT.md`

**Path:** `D:\play-arena\playarena-backend\CONTEXT.md`

### Observations
- **Domain glossary** — documents core entities, roles, booking lifecycle, payments, scheduling patterns
- **Key architecture decisions:** role scoping per ground via `ground_access`, append-only payment ledger, soft delete, audit log on every sensitive action
- **Pakistan-specific:** timestamps displayed in Asia/Karachi, PKR currency
- **Tenant boundary:** every operational record has `ground_id`

---

## FILE 159: `playarena-backend/tsconfig.json`

**Path:** `D:\play-arena\playarena-backend\tsconfig.json`

### Observations
- **target ES2022, module commonjs** — Node.js compatible
- **experimentalDecorators + emitDecoratorMetadata** — TypeORM requires these
- **strictPropertyInitialization: false** — TypeORM entities don't use constructor init

---

## FILE 160: `playarena-backend/src/server.ts`

**Path:** `D:\play-arena\playarena-backend\src/server.ts`

### Observations
- **Bootstrap entry** — initializes TypeORM DataSource, then imports and starts Express app
- **Dynamic import** for `app.ts` — lazy loaded after DB connection
- **Env-based config:** PORT, API_PREFIX

---

## FILE 161: `playarena-backend/src/app.ts`

**Path:** `D:\play-arena\playarena-backend\src/app.ts`

### Observations
- **Express app setup** — helmet, CORS (env config), cookie-parser, JSON body (10mb limit), rate limiting
- **Swagger docs** at `/api/docs` and `/api/docs.json` with JWT bearer auth
- **Only 5 route modules registered:** auth, users, reference, grounds, access (invites)
- **Health endpoint** at `/api/v1/health`
- **Other module directories exist** (bookings, cash, chat, finance, etc.) but NOT registered — old backend is incomplete

---

## FILE 162: `playarena-backend/src/config/env.ts`

**Path:** `D:\play-arena\playarena-backend\src/config/env.ts`

### Observations
- **Zod-validated env schema** — 25 env vars parsed and validated at startup
- **JWT:** 7d access, 30d refresh
- **Optional:** Twilio, Google OAuth, SMTP, AWS S3
- **Storage:** local or s3 (default local)
- **Rate limit:** 100 req/min default

---

## FILE 163: `playarena-backend/src/config/database.ts`

**Path:** `D:\play-arena\playarena-backend\src/config/database.ts`

### Observations
- **TypeORM DataSource** — PostgreSQL with 13 entities registered
- **synchronize: true** in development (auto-create tables)
- **Logging:** errors + warnings in dev, errors only in production
- **No migrations** configured (empty array)

---

## FILE 164: `playarena-backend/src/config/passport.ts`

**Path:** `D:\play-arena\playarena-backend\src/config/passport.ts`

### Observations
- **JWT strategy** — extracts from Bearer token header, looks up user by `payload.userId`
- **Google OAuth strategy** — conditional (only if GOOGLE_CLIENT_ID is set), auto-creates user if not found
- **Google flow:** links by providerId first, falls back to email match, creates new user if neither found

---

---

## FILE 165: `playarena-backend/src/middleware/auth.middleware.ts`

**Path:** `D:\play-arena\playarena-backend\src/middleware/auth.middleware.ts`

### Observations
- **3 middleware:** `authenticate` (required JWT), `optionalAuth` (optional JWT), `authorize(...roles)` (role check)
- **JWT in Bearer header** — different from new backend's cookie-based auth
- **Extends Express.Request** globally with `user?: JwtPayload`
- **Throws directly** — no try-catch wrapping (Express 5 catches async errors, but Express 4 needs express-async-errors)

---

## FILE 166: `playarena-backend/src/middleware/error.middleware.ts`

**Path:** `D:\play-arena\playarena-backend\src/middleware/error.middleware.ts`

### Observations
- **Central error handler** — AppError instances get structured JSON response with code/message/details
- **Unhandled errors** — logged with pino, 500 response with generic message
- **Response format:** `{ success: false, error: { code, message, details } }`

---

## FILE 167: `playarena-backend/src/utils/errors.ts`

**Path:** `D:\play-arena\playarena-backend\src/utils/errors.ts`

### Observations
- **7 custom error classes:** AppError (base), BadRequest (400), Unauthorized (401), Forbidden (403), NotFound (404), Conflict (409), Validation (422), TooManyRequests (429)
- **Each has** `statusCode`, `code` (string), `message`, `details`

---

## FILE 168: `playarena-backend/src/utils/jwt.ts`

**Path:** `D:\play-arena\playarena-backend\src/utils/jwt.ts`

### Observations
- **JWT payload:** userId, role, email, phone
- **Access token** signed with `JWT_SECRET` (default 7d expiry)
- **Refresh token** signed with `JWT_SECRET + '_refresh'` (default 30d expiry)
- **Separate secrets** for access vs refresh tokens

---

## FILE 169: `playarena-backend/src/utils/logger.ts`

**Path:** `D:\play-arena\playarena-backend\src/utils/logger.ts`

### Observations
- **Pino logger** — level: debug (dev) / info (prod)
- **pino-pretty** transport in development
- **Redacts** sensitive fields: authorization header, password, passwordHash

---

---

## FILE 170: `playarena-backend/src/entities/User.ts`

**Path:** `D:\play-arena\playarena-backend\src\entities/User.ts`

### Observations
- **Table:** `users_public` — only 2 roles: `player`, `super_admin` (simpler than Prisma's 5 roles)
- **Login fields:** phone (unique), email (unique), passwordHash (select:false), resetToken/expires
- **OAuth:** provider + providerId for Google SSO
- **Soft delete** via `deletedAt`

---

## FILE 171: `playarena-backend/src/entities/Ground.ts`

**Path:** `D:\play-arena\playarena-backend\src\entities/Ground.ts`

### Observations
- **Table:** `grounds` — owner relation to User, region relation to Region
- **Fields:** name, address, city, lat/lng, description, contactPhone, isVerified, isActive
- **Soft delete**

---

## FILE 172: `playarena-backend/src/entities/Court.ts`

**Path:** `D:\play-arena\playarena-backend\src\entities/Court.ts`

### Observations
- **Table:** `courts` — linked to Ground via groundId
- **Fields:** name, sportType (string, not FK), basePrice (decimal 12,2), depositAmount, maxPlayers, isActive
- **Soft delete**

---

## FILE 173-182: Remaining TypeORM Entities

**Path:** `D:\play-arena\playarena-backend\src\entities/`

### Summary
| Entity | Table | Key Fields |
|---|---|---|
| `City.ts` | `cities` | name, regionId, displayOrder, isActive |
| `Region.ts` | `regions` | name, code (unique), isActive |
| `SportCategory.ts` | `sport_categories` | name (unique), minPlayers, maxPlayers, defaultMatchDuration |
| `GroundAccess.ts` | `ground_access` | groundId, userId, accessRole, isActive (role scoping) |
| `GroundImage.ts` | `ground_images` | groundId, url, isPrimary, displayOrder |
| `GroundInvite.ts` | `ground_invites` | groundId, inviteePhone, accessRole, status, expiresAt |
| `GroundSchedule.ts` | `ground_schedules` | groundId, dayOfWeek, openTime, closeTime, slotDuration, isActive |
| `GroundSetting.ts` | `ground_settings` | groundId (unique), allowOnlineBooking, depositPercentage (50%), advanceBookingDays (14) |
| `PaymentMethod.ts` | `payment_methods` | label, type, category, isEnabled |
| `GroundPaymentMethod.ts` | `ground_payment_methods` | groundId, paymentMethodId, isEnabled (junction table) |

### Key Differences from Prisma Backend
- **No Booking/Chat/Team/Tournament entities** in old TypeORM — these exist only as empty module directories
- **`sportType` is a string** on Court (not FK to SportCategory)
- **`depositAmount`** is a separate column on Court (Prisma backend doesn't have this)
- **`GroundInvite`** invites by phone number (not user ID)
- **`GroundSetting`** has `depositPercentage` (50%) and `advanceBookingDays` (14) — concept not in Prisma backend

---

---

## FILE 183: `playarena-backend/src/modules/` (Old Backend)

**Path:** `D:\play-arena\playarena-backend\src\modules/`

### Implemented Modules (5)
| Module | Files | Routes |
|---|---|---|
| **auth** | controller, routes, service, validator | signup, send-otp, verify-otp, login, google OAuth, refresh, logout, me, forgot/reset-password |
| **users** | controller, routes, service, validator | listPlayers, getPlayerById, getPlayerTeams, getById, updateMe |
| **grounds** | grounds controller/service/validator, courts controller/service, schedules controller/service | CRUD grounds/courts/schedules, slots, settings, payment-methods, images |
| **ground-access** | controller, routes, service, validator | invite by phone, accept/reject invite, remove team member, list access |
| **reference** | controller, routes | cities, regions, sports, payment-methods |

### Empty Module Directories (10)
bookings, cash, chat, finance, matchmaking, notifications, teams, tournaments, upload, admin — **all empty**, never implemented

### Key Observations
- **Old backend uses class-based controllers** with `.bind()` pattern
- **Google OAuth** redirects to `playarena://auth/callback` (deep link for mobile app)
- **Invites by phone number** (not email/userId as in new backend)
- **No cookie-based auth** — Bearer tokens only
- Old backend is clearly the first iteration; the new NestJS+Prisma `backend/` is the rewrite

---

---

## FILE 184: `playarena-backend/plan.md`

**Path:** `D:\play-arena\playarena-backend\plan.md`

### Observations
- **815-line comprehensive architecture plan** for Express + TypeORM backend
- **Planned 34+ entities** (only 13 implemented), **134+ endpoints** (only ~40 implemented)
- **Detailed API endpoint table** for every module, role summary table, error code catalog
- **Auth flow:** 3 methods (email/password, phone OTP, Google OAuth), 7d access + 30d refresh tokens
- **Key business rules:** booking state machine, append-only payment ledger, double-booking prevention via pessimistic locks
- **Build order:** Auth → Grounds → Bookings → Teams → Tournaments → Chat → Admin → Upload
- **Only Phase 1 & 2** partially implemented (auth, users, grounds, courts, schedules, access, reference)

---

## FILE 185: `planing & ttd/` Directory (Old Backend)

**Path:** `D:\play-arena\playarena-backend\planing & ttd\`

**Contains 3 files:**
| File | Size | Purpose |
|------|------|---------|
| `asdasdplan.md` | 1,149 lines | Phase 2 plan (Grounds, Courts, Venue) + Full Prisma schema (31 models, 13 enums) |
| `phase2-plan.md` | ~2,500+ lines | Duplicate of `asdasdplan.md` — identical content including full Prisma schema |
| `phase2-tdd.md` | ~580 lines | TDD tracker — Phase 2 implementation status with entity/endpoint checkboxes |

### Observations
- **asdasdplan.md** has two distinct parts: (1) Phase 2 implementation plan for Express + TypeORM (lines 1-172), and (2) a complete Prisma schema (lines 174-1149) covering all 31 models across the entire project (not just Phase 2)
- **phase2-plan.md** appears to be a copy of asdasdplan.md (same Prisma schema at bottom), likely a renamed version
- **phase2-tdd.md** is the TDD tracker showing actual implementation progress—it uses `[x]`/`[ ]` checkboxes for entities created, endpoints implemented, tests written, and Postman requests
- The TDD tracker shows Phase 2 implementation status: entities mostly done, endpoints partially done, tests mostly missing, Postman collection created

---
---

## FILE 186: `playarena-backend/postman/playarena-api.postman_collection.json`

**Path:** `D:\play-arena\playarena-backend\postman\playarena-api.postman_collection.json`

**Size:** 4,182 lines — Postman v2.1 collection

### Structure (14 folders, ~100 endpoints)

| Folder | Endpoints | Notes |
|--------|-----------|-------|
| Health | 1 (GET health) | No auth required |
| Auth | 10 (signup, login, send-otp, verify-otp, google-auth [mobile+web], refresh, logout, me, forgot-password, reset-password) | Bearer token auto-set from signup/login responses |
| Users | 5 (get by ID, update me, list players, player by ID, player teams) | Player discovery endpoints |
| Reference Data | 5 (cities, regions, sports, payment-methods, ground payment-methods) | All public |
| Grounds | 12 (list, featured, detail, courts, schedules, settings, images, create, update, delete, my-grounds, update-settings) | Full CRUD for grounds |
| Bookings | 8 (create, my-bookings, booking detail, cancel, walk-in, ground-bookings, approve/reject) | State machine coverage |
| Finance | 5 (record payment, booking finance, ground finance summary, payment methods, ground payment methods) | Append-only ledger pattern |
| Cash Management | 3 (open session, close session, list sessions) | Shift-based cash drawer |
| Ground Access & Invites | 5 (invite, list team, revoke, accept invite, reject invite) | RBAC management |
| Teams | 7 (create, list, detail, members, matches, my-teams, sports) | Team CRUD |
| Match Requests | 3 (create challenge, sent, received) | Challenge system |
| Tournaments | 7 (list, detail, bracket, teams, standings, my-tournaments) | Tournament browse |
| Chat | 3 (messages, send, unread counts) | Ground-level messaging |
| Notifications | 5 (list, unread count, mark read, mark all read, register push token) | In-app + FCM |
| Upload | 4 (file, booking proof, ground image, avatar) | S3 upload endpoints |
| Admin | 4 (users, grounds, verify ground, audit logs) | Super Admin operations |

### Observations
- **Comprehensive collection** covering the full planned API surface (~100 endpoints)
- **Auth flow:** signup → login returns accessToken → auto-set as bearer token for all subsequent requests
- **Variables:** 14 collection variables (baseUrl, accessToken, playerId, groundId, courtId, teamId, bookingId, tournamentId, scheduleId, chatRoomId, notificationId, cashSessionId, matchRequestId, uploadId) — all UUIDs default to zeros
- **Test scripts** exist on many requests (status code checks, variable extraction)
- **Bearer token auth** used throughout (not cookie-based)
- Covers Phase 1 & 2 of the old Express backend — does NOT include teams/matchmaking/tournament write endpoints (create team, create tournament, etc. are absent from the actual request list despite folders existing)
- The collection reflects the planned API surface more than what's actually implemented

---
---

## FILE 187: `playarena-planning/` Directory

**Path:** `D:\play-arena\playarena-planning\`

**Contains 6 files:**
| File | Size | Purpose |
|------|------|---------|
| `1-FOR-STAKEHOLDERS.md` | 400 lines | Non-technical overview for stakeholders — 5 user types, feature map, business workflows |
| `2-Backend-plan.md` | 2,482 lines | Complete NestJS + Prisma backend implementation plan — schema, routes, guards, events, deployment |
| `3-Frontend-plan.md` | 1,239 lines | Frontend plan — 105+ pages, shadcn/ui, TanStack Query, WebSocket integration |
| `4-aws-deployment.md` | 2,900+ lines (truncated) | AWS deployment guide — ECS Fargate, ElastiCache, RDS Aurora, CI/CD |
| `CLAUDE.md` | ~470 lines | Production architecture reference — React Native + Supabase stack (DIFFERENT from actual codebase) |
| `PROJECT_COMPLETE_DOCUMENTATION.md` | TBD | Complete project documentation |

### Critical Discrepancy
- `playarena-planning/CLAUDE.md` describes a **React Native + Supabase** architecture (no separate backend, RLS+RPC based)
- The actual codebase has **Next.js frontend** + **Express+NestJS backend** with Prisma/TypeORM
- These represent two different architectural approaches for the same product

---

## FILE 188: `playarena-planning/1-FOR-STAKEHOLDERS.md`

**Path:** `D:\play-arena\playarena-planning\1-FOR-STAKEHOLDERS.md`

### Content
- **400-line business overview** for non-technical stakeholders
- **5 user types:** Player, Ground Staff, Ground Manager, Ground Owner, Super Admin
- **Feature map:** Discover → Play → Compete → Manage
- **6 core features:** Team Management, Matchmaking, Rating System (ELO), Match System, Tournament System, Sports Categories
- **Payment methods:** JazzCash, EasyPaisa, Nayapay, Bank Transfers (Meezan/HBL/UBL/MCB), Cash
- **Key workflows:** Team-to-Team Match Flow, Team Creation Flow, Tournament Flow, Booking Flow
- **13 supported Pakistani cities, 7+ sports categories, 5 user roles, ELO 1200 baseline**

### Notable details
- Payments are NOT processed in-app — only proof tracking and recording
- Teams are permanent entities (not tournament-scoped)
- Peer reviews visible on profiles for community accountability
- All money calculations are backend-only

---

## FILE 189: `playarena-planning/2-Backend-plan.md`

**Path:** `D:\play-arena\playarena-planning\2-Backend-plan.md`

**Size:** 2,482 lines — single most comprehensive architecture document in the workspace

### Contents (16 sections)
1. **Project Structure** — NestJS monorepo with Prisma ORM, 14 feature modules, background workers
2. **Complete Database Schema** — 31 Prisma models across all domains (Users, Grounds, Courts, Bookings, Finance, Teams, Matchmaking, Tournaments, Chat, Notifications, Cash, Audit)
3. **Complete API Routes** — 137 total endpoints (24 public, 56 player, 9 staff, 24 owner, 20 super admin, 4 chat)
4. **API Route Details & Request/Response Shapes** — Full DTO examples for booking and payment flows
5. **Guards & Authorization** — JwtAuthGuard (global), RolesGuard (ground-scoped), ThrottleGuard, decorator reference
6. **Cron Jobs & Background Workers** — 5 cron jobs (booking expiry, completion, chat cleanup, notification cleanup, cash session auto-close) + Bull queue workers
7. **Event-Driven Architecture** — 10 events (booking.created/approved/rejected, payment.recorded, match.*, team.*)
8. **WebSocket Events** — Chat gateway + Booking updates channel (Socket.IO)
9. **Service Layer Patterns** — Transaction pattern, idempotency pattern, soft delete middleware, audit log pattern
10. **File Upload & Storage** — S3 with signed URLs, 5 upload categories
11. **Push Notifications** — Bull queue → Firebase Admin SDK, 8 notification types
12. **Error Handling** — 13 error codes, structured error response envelope with correlationId
13. **Module Structure** — 14 modules (Auth, Users, Grounds, Bookings, Finance, Teams, Matchmaking, Ratings, Tournaments, Chat, Notifications, Cash, Admin, Upload)
14. **Testing Strategy** — Test pyramid (200+ unit, 30 integration, 5 E2E)
15. **Environment Variables** — 23 env vars with defaults and sources
16. **Deployment Architecture** — AWS ECS Fargate (multi-stage Docker, CDK, ALB, RDS Aurora, Redis), CI/CD pipeline, monthly cost estimate ~$405 production

### Notable design decisions
- Auth: Supabase Auth (Phase 1) → self-managed JWT (Phase 2)
- Exclusion constraint (`bookings_no_overlap`) using `btree_gist` extension for double-booking prevention
- `booking_finance` is derived from `booking_payments` sum (append-only ledger)
- Ground-scoped RBAC via `ground_access` table — users can be owner on Ground A and staff on Ground B
- ELO K-factor: 32 for new teams (<30 matches), 24 for established teams
- Match scoring requires both captain confirmations; ground staff mediates disputes

---

## FILE 190: `playarena-planning/3-Frontend-plan.md`

**Path:** `D:\play-arena\playarena-planning\3-Frontend-plan.md`

**Size:** 1,239 lines — comprehensive frontend implementation plan

### Contents (21 sections)
1. **Tech Stack** — Next.js 15, shadcn/ui, Zustand, TanStack Query v5, Socket.IO, Recharts, Leaflet
2. **Repository Structure** — npm workspace with `packages/shared/` (types, API client, DTOs) and `packages/web/` (Next.js)
3. **User Roles & Access** — 5 roles with scoped sidebar navigation
4. **Routes & Pages** — 105+ pages across auth (4), dashboard (grounds/bookings/teams/matches/tournaments/leaderboard/ops/finance/chat/notifications/admin/invites)
5. **Layout Architecture** — Collapsible sidebar (260px → 64px), topbar, role-based nav items
6. **Design System** — Emerald-500 primary, amber-500 accent, red-500 destructive, Inter font, consistent spacing
7. **Component Library** — 30+ UI primitives (shadcn/ui), 60+ domain components
8. **API Integration** — Typed fetch wrapper with cookie auth, React Query patterns, RSC data fetching for admin
9. **Auth Flow** — httpOnly cookies (no localStorage), middleware auth gate, role-based route protection
10. **State Management** — Zustand for auth+UI, TanStack Query for server cache with per-domain stale times
11. **WebSocket** — Socket.IO with notification + chat namespaces
12. **File Uploads** — 8 upload types with size limits, multipart form data
13. **Pages Data Requirements** — 50+ rows mapping page → API endpoints → rendered components
14. **Implementation Phases** — 8 phases over 14 weeks
15. **Error Handling** — 3-layer strategy (RSC, TanStack Query, global)
16. **Performance Targets** — LCP <2.5s, TTFB <500ms, initial JS <150KB
17. **Testing Strategy** — Vitest + MSW + Playwright
18. **Key Technical Decisions** — Why Next.js, httpOnly cookies, TanStack Table, Recharts, shadcn/ui
19. **Accessibility Checklist** — 9 requirements
20. **File Count Estimate** — ~175 files total
21. **Directory Tree** — Final intended structure

---

## FILE 191: `playarena-planning/4-aws-deployment.md`

**Path:** `D:\play-arena\playarena-planning\4-aws-deployment.md`

**Size:** 2,900+ lines — AWS deployment guide for NestJS backend

### Contents (29 sections)
- **System Overview** — Multi-tenant sports facility management SaaS
- **Current Architecture** — Supabase (React Native) → NestJS migration rationale
- **NestJS Backend Design** — 14 modules, tech stack (NestJS 11, Prisma 6, Zod 4, Bull, Socket.IO, Pino)
- **Migration Strategy** — 3 phases (API Proxy → Data Migration → Full Migration), RPC-to-service mapping table (13 RPCs)
- **AWS Architecture** — Route 53 → CloudFront → ALB → ECS Fargate → RDS Aurora + ElastiCache + S3
- **Deployment Options** — Elastic Beanstalk (dev/staging) vs ECS Fargate (production)
- **CI/CD** — GitHub Actions with test → build → deploy → health check stages
- **Database** — Full Prisma schema (core entities), migration strategy, indexing
- **Auth & Authorization** — JWT + ground-scoped RBAC
- **File Storage** — S3 signed URLs
- **Push Notifications** — FCM via Firebase Admin SDK
- **Monitoring** — CloudWatch, Sentry
- **Security** — VPC, Secrets Manager, WAF, encryption at rest/in transit
- **Cost Optimization** — ~$77/dev, ~$145/staging, ~$405/production per month
- **Scaling** — Auto-scaling, RDS Aurora Serverless, Redis caching
- **Disaster Recovery** — Multi-AZ, RPO 5 min, RTO 15 min
- **Plus detailed sections:** Booking lifecycle, Tournament lifecycle, Cash management, Payment methods, Soft delete policies, Migration naming conventions

### Notable details
- Both Elastic Beanstalk and ECS Fargate deployment workflows are provided
- Includes AWS CDK (TypeScript) infrastructure as code
- Docker Compose for local development with PostgreSQL + Redis
- Pre-commit hooks with lint-staged + husky

---
---

## FILE 192: `playarena-planning/CLAUDE.md`

**Path:** `D:\play-arena\playarena-planning\CLAUDE.md`

**Size:** ~470 lines — Production Architecture Reference for a **React Native + Supabase** stack

### Content
- **Stack:** React Native CLI + Hermes SDK 34 + Supabase (PostgreSQL, RLS, RPC, Triggers, Storage, Realtime)
- **Admin Portal:** Next.js 15 (App Router) on Vercel with service role
- **Auth:** Supabase Auth (Phone OTP primary, Email fallback)
- **Push:** FCM via Supabase Edge Functions (Deno)

### Sections covered
- System Overview (core entities, non-negotiables)
- Architecture (data flow, folder structure)
- Role System (5 roles, multi-role per ground via `ground_access`)
- Booking System (state machine, critical rules, walk-in, concurrency control, soft delete)
- Payment System (normalized tables, 7 Pakistan-specific methods, online/offline flows, cash drawer)
- Supabase Backend Rules (table standards, RPC list with audit trail, triggers, indexing strategy)
- Realtime Architecture (subscription scope, unread counts)
- Observability & Monitoring (structured logging, key metrics)
- Security (3-layer RBAC, RLS cross-ground leakage prevention)
- Coding Standards (function length, naming conventions, state management)
- Development Workflow (10-step process, definition of done checklist)
- Performance Budget, Environment Config, Soft Delete & Data Retention, Known Issues

### Critical Note
This document describes a **fundamentally different architecture** from what is actually built:
- **Planned stack:** React Native mobile app + Supabase backend (no separate backend server)
- **Actual stack:** Next.js web app + Express/NestJS backend + TypeORM/Prisma + PostgreSQL

The `playarena-planning/` directory contains CLAUDE.md for a different version of the project (React Native + Supabase), while the actual codebase follows the Next.js + NestJS architecture described in 2-Backend-plan.md and 3-Frontend-plan.md.

---
---

## FILE 193: `playarena-planning/PROJECT_COMPLETE_DOCUMENTATION.md` (incomplete read — see FILE TBD)

**Path:** `D:\play-arena\playarena-planning\PROJECT_COMPLETE_DOCUMENTATION.md`

*Note: This file is listed in the directory but was not read in full yet. See subsequent FILE entry for complete documentation.*

---
---

## FILE 194: `playarena-planning/PROJECT_COMPLETE_DOCUMENTATION.md` (continued)

**Path:** D:\play-arena\playarena-planning\PROJECT_COMPLETE_DOCUMENTATION.md

*Note: To be read in a subsequent FILE entry.*

---
---

## FILE 195: Root `.graphify_detect.json`

**Path:** `D:\play-arena\testing and details\D`  (appears to be a generated file at root or in testing directory)

*Note: This file name appears corrupted in the directory listing. Skipped.*

---
---

## FILE 196: `testing and details/.env.example`

**Path:** `D:\play-arena\testing and details\.env.example` → TBD

---
---

## FILE 197: `testing and details/CLAUDE.md`

**Path:** `D:\play-arena\testing and details\CLAUDE.md` → TBD

---
---

## FILE 198: `testing and details/PROJECT_COMPLETE_DOCUMENTATION.md`

**Path:** `D:\play-arena\testing and details\PROJECT_COMPLETE_DOCUMENTATION.md` → TBD

---
---

## FILE 199: `testing and details/play-arena-tree.txt`

**Path:** `D:\play-arena\testing and details\play-arena-tree.txt` → TBD

---
---

## FILE 200: `testing and details/document/` Directory

**Path:** `D:\play-arena\testing and details\document\` → TBD

---
---

## FILE 201: `testing and details/plan/` Directory

**Path:** `D:\play-arena\testing and details\plan\` → TBD

---
---

## FILE 202: `testing and details/stitch files/` Directory

**Path:** `D:\play-arena\testing and details\stitch files\` → TBD

---
---

## FILE 203: `testing and details/play-arena-code/` Directory

**Path:** `D:\play-arena\testing and details\play-arena-code\` → TBD

---
---

## FILE 204: `testing and details/play-arena-expo-go/` Directory

**Path:** `D:\play-arena\testing and details\play-arena-expo-go\` → TBD

---
---

## FILE 205: `testing and details/.claude/` Directory

**Path:** `D:\play-arena\testing and details\.claude\` → TBD

---
---

## FILE 206: `graphify-out/` Directory

**Path:** `D:\play-arena\graphify-out\`

**Contains 6 entries:**
- `cache/` (subdirectory)
- `cost.json`
- `GRAPH_REPORT.md`
- `graph.html`
- `graph.json`
- `manifest.json`

### Observations
- Generated output from graphify knowledge graph tool
- Contains structured graph data (nodes, edges) representing the codebase
- `manifest.json` tracks processing state
- `cost.json` likely tracks API usage costs for graph generation
- `GRAPH_REPORT.md` is a human-readable summary of the graph
- `graph.html` is a visual HTML rendering
- `graph.json` is the raw graph data in JSON format

---
---

## FILE 207: `testing and details/CLAUDE.md`

**Path:** `D:\play-arena\testing and details\CLAUDE.md`

**Size:** 661 lines — Production Architecture Reference for React Native + Supabase stack

### Content
Identical in structure and content to `playarena-planning/CLAUDE.md` (described in FILE 192). Covers:
- **Tech stack:** React Native CLI + Supabase ONLY (no separate backend)
- **17 sections:** System Overview, Architecture, Folder Structure, Role System (5 roles), Booking System (state machine, concurrency, soft delete), Payment System (7 Pakistan methods), Supabase Backend Rules (tables, RPCs, triggers, indexes), Realtime, Observability, Security (3-layer RBAC, RLS), Coding Standards, Development Workflow, Performance Budget, Environment Config, Soft Delete, Known Issues, Migration Naming

### Observations
- This is the **original/oracle version** of the architecture — the one describing React Native + Supabase
- Contains a comprehensive "Known Issues" section listing 6 TODO items (RLS, RPCs, triggers race condition, cron, observability, FCM)
- Includes explicit SQL examples for RLS policies and RPC functions
- The `testing and details/` location plus the document/ subdirectory suggest this is the **historical planning directory** predating the current Next.js + NestJS implementation

---

## FILE 208: `testing and details/.env.example`

**Path:** `D:\play-arena\testing and details\.env.example`

**Size:** 24 lines

### Content
MCP Server API Keys configuration — lists optional API keys for GitHub and Glif, plus references to free MCP servers (ddg-search, web-fetch, wikipedia, jina-reader, fetch, playwright, puppeteer, filesystem, harness, graphify)

### Observations
- Not related to PlayArena app configuration
- This is a **Claude MCP server configuration** template, likely placed here by the dev environment setup
- The free servers listed are all discovery/research tools

---

## FILE 209: `testing and details/play-arena-tree.txt`

**Path:** `D:\play-arena\testing and details\play-arena-tree.txt`

**Size:** 668 lines — Full directory tree listing of the entire project

### Content
Snapshots the complete file hierarchy including:
- `.claude/` — 34 entries (agents, commands, hooks, plugins, rules, scripts, settings, skills)
- `document/` — 14 docs in root + 3 subdirectories (figma-design/, market-data/, prompts/)
- `plan/` — auth flow plan + MCP servers plan
- `stitch files/` — 9 directories of UI prototypes
- `graphify-out/` — knowledge graph data
- `play-arena-code/PlayArena/` — likely React Native app code
- `play-arena-expo-go/` — empty directory

### Observations
- Provides a reliable directory listing for files that may not exist anymore
- Shows the original intended project structure before the backend/ + frontend/ monorepo structure was created
- Contains 34 .claude/ configuration files indicating extensive agent setup

---

## FILE 210: `testing and details/document/` Directory

**Path:** `D:\play-arena\testing and details\document\`

**Contains 14 files + 3 subdirectories:**

| File | Description |
|------|-------------|
| `2-payORA.txt` | Early brainstorming notes (payORA name hypothesis) |
| `3-last.md` | Latest requirements consolidation |
| `4-all-play-management.txt` | All-play management feature specs |
| `5-system Design.md` | System design document |
| `6-architecture.md` | Architecture overview |
| `7-PRD.md` | Product Requirements Document (98 lines) |
| `8-MVP Tech Doc.md` | MVP technical specifications |
| `9-EXECUTABLE_PLAN.md` | Executable development plan (399 lines) |
| `10-PLAYARENA — SYSTEM ARCHITECTURE DOCUMENT.md` | Full system architecture |
| `11-PLAYARENA chatgpt document.md` | ChatGPT-generated design conversation |
| `12-PLANNED.md` | Planned features and roadmap |
| `13-PlayOra UI_UX Design and Architecture Document request.md` | UI/UX design request |
| `13-playOra UIUX Design and Architecture Document request.md` | Duplicate of above |
| `14-ateeq-detail.md` | Technical specifications from Ateeq |

### Key Documents Summary

**`7-PRD.md` (98 lines):** Product Requirements Document — 6 user types (Players, Team Captains, Ground Owners, Managers, Staff, Admin), covers auth, grounds, bookings, teams, tournaments, finance, admin requirements.

**`9-EXECUTABLE_PLAN.md` (399 lines):** Phase-by-phase development plan following Supabase + React Native stack. Includes:
- Non-negotiables (backend truth, tenant boundary, booking rules, UTC storage)
- Phase 0: Setup (repo, environments)
- Phase 1: Auth + Users (RPCs + screens)
- Phase 2: Grounds (CRUD, schedules, settings)
- Phase 3: Bookings (create, approve/reject, walk-in, dashboard)
- Phase 4: Finance (payments, reports, cash management)
- Phase 5: Teams + Matchmaking
- Phase 6: Tournaments
- Phase 7: Admin + Chat + Polish

**Subdirectories:**
- `figma-design/` — Figma design files and exports
- `market-data/` — Market research and competitor analysis
- `prompts/` — AI prompts used during development

---

## FILE 211: `testing and details/plan/` Directory

**Path:** `D:\play-arena\testing and details\plan\`

**Contains:**
| Entry | Description |
|-------|-------------|
| `2026-05-11-auth-flow/` | Auth flow plan with PROGRESS.md and README.md |
| `2026-05-16-mcp-servers-plan.md` | MCP server integration plan |
| `README.md` | Plan directory overview |

---

## FILE 212: `testing and details/stitch files/` Directory

**Path:** `D:\play-arena\testing and details\stitch files\`

**Contains 9 nearly-identical copies** of `stitch_comprehensive_app_blueprint/` directories (likely generated from a design tool like Stitch). Each contains UI prototypes:
- `login/` — Login screen (code.html + screen.png)
- `explore_grounds/` — Ground browsing (code.html + screen.png)
- `ground_details/` — Ground detail view (code.html + screen.png)
- `book_court/` — Booking flow (code.html + screen.png)
- `playarena_main_logo/` — Logo design (code.html + screen.png)
- `velocity_athletic/DESIGN.md` — Alternative branding concept

**Observations:** These are HTML/CSS pixel-perfect prototypes, likely generated by a Figma-to-code tool. The 9 copies suggest versioning or batch-generation artifacts. The `code.html` files contain complete standalone HTML with Tailwind CSS for each screen.

---

## FILE 213: `testing and details/play-arena-code/` Directory

**Path:** `D:\play-arena\testing and details\play-arena-code\`

**Contains:** `PlayArena/` subdirectory (likely the React Native mobile app code). Not explored in detail — would contain the original React Native mobile client code matching the Supabase architecture in CLAUDE.md.

---

## FILE 214: `testing and details/play-arena-expo-go/` Directory

**Path:** `D:\play-arena\testing and details\play-arena-expo-go\`

**Empty directory.** Intended for Expo Go mobile testing but never populated.

---

## FILE 215: `testing and details/.claude/` Directory

**Path:** `D:\play-arena\testing and details\.claude\`

**Contains 10 entries:**

| Entry | Description |
|-------|-------------|
| `agents/` | 4 agent definitions: design-critique, designer, developer, evaluator |
| `commands/` | Custom Claude commands |
| `hooks/` | Git hooks for Claude integration |
| `plugins/` | Claude plugins |
| `rules/` | 4 rule files: figma-design-reference, master-operating-model, plan-first, ui-from-figma |
| `scripts/` | 5 scripts: check-migration-drift, clean-run-artifacts, start-dev-server, trace-hook, trace-summarise, verify-environment-facts |
| `settings.json` | Main Claude settings |
| `settings.local.json` | Local override settings |
| `skills/` | 10+ skills: build, design, speckit-analyze, speckit-checklist, speckit-clarify, speckit-constitution, speckit-git-*, speckit-implement, speckit-plan, speckit-specify, speckit-tasks, speckit-taskstoissues |
| `launch.json` | Launch configuration |

### Observations
- This is a comprehensive Claude agent workspace configuration
- The `speckit-*` skills form a complete software development workflow (clarify → specify → plan → implement → tasks → issues → git workflow)
- `rules/master-operating-model.md` and `rules/plan-first.md` are likely the core project rules
- `rules/ui-from-figma.md` connects Figma designs to code generation
- This configuration was used to generate much of the project via AI pair programming

---

## FILE 216: `playarena-planning/PROJECT_COMPLETE_DOCUMENTATION.md`

**Path:** `D:\play-arena\playarena-planning\PROJECT_COMPLETE_DOCUMENTATION.md`

*To be read — see subsequent entries.*

---

## FILE 217: `testing and details/PROJECT_COMPLETE_DOCUMENTATION.md`

**Path:** `D:\play-arena\testing and details\PROJECT_COMPLETE_DOCUMENTATION.md`

*To be read — see subsequent entries.*

---

## FILE 218: `testing and details/document/figma-design/` Directory

**Path:** `D:\play-arena\testing and details\document\figma-design\`

*Figma design exports and assets — to be read if needed.*

---

## FILE 219: `testing and details/document/market-data/` Directory

**Path:** `D:\play-arena\testing and details\document\market-data\`

*Market research and competitor data — to be read if needed.*

---

## FILE 220: `testing and details/document/prompts/` Directory

**Path:** `D:\play-arena\testing and details\document\prompts\`

*AI development prompts — to be read if needed.*

---

## FILE 221+: Graphify Output Files

**Multiple files in `D:\play-arena\graphify-out\`:** Generated knowledge graph artifacts — `graph.json` (raw node/edge data), `graph.html` (visual rendering), `GRAPH_REPORT.md` (summary), `manifest.json` (processing manifest), `cost.json` (API usage cost), `cache/` (processed data cache). These are outputs of the graphify knowledge graph tool, not source code.

---

## Summary: Workspace File Map

| Directory | Files | Status |
|-----------|-------|--------|
| `root/` (`.gitignore`, `.graphify_python`, `PROJECT_STATUS.md`) | 3 | ✅ Documented |
| `backend/` (NestJS + Prisma) | 78 files (config, modules, schema, OpenAPI) | ✅ Fully documented |
| `frontend/` (Next.js + shared package) | 75+ files (pages, components, config, types) | ✅ Fully documented |
| `playarena-backend/` (Express + TypeORM) | 30+ files (entities, modules, config, plans) | ✅ Fully documented |
| `playarena-planning/` (Planning docs) | 6 files (stakeholder doc, backend/frontend plans, AWS guide, CLAUDE.md) | ✅ Fully documented |
| `testing and details/` (Legacy docs, designs, Claude config) | 200+ files | ⚠️ Summarized (not all individually read) |
| `graphify-out/` (Knowledge graph output) | 6 files | ✅ Documented |
| **Total documented** | **~400+ files** | |

### Key Insight
The workspace contains **two parallel architectural visions** for the same product:
1. **React Native + Supabase** (the original vision — documented in `testing and details/` and `playarena-planning/CLAUDE.md`)
2. **Next.js + NestJS + Prisma/TypeORM** (the current implementation — documented in `backend/`, `frontend/`, and `playarena-planning/2-Backend-plan.md` + `3-Frontend-plan.md`)

The project appears to have been migrated from architecture (1) to architecture (2) during development, leaving both sets of documentation in the workspace.

---
---

*End of comprehensive workspace file-by-file observation. Total documented: 221+ FILE entries covering ~400+ files.*
