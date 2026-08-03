# PlayArena Documentation

> **Last Updated:** 2026-08-03
> **Purpose:** This index explains where all documentation lives, why it's organized this way, and how to navigate it.

---

## Table of Contents

1. [Why So Many Files?](#why-so-many-files)
2. [Proposed Consolidated Structure](#proposed-consolidated-structure)
3. [Current Structure (Before Reorg)](#current-structure-before-reorg)
4. [Quick Reference by Topic](#quick-reference-by-topic)
5. [Development Workflow](#development-workflow)

---

## Why So Many Files?

The documentation grew organically across multiple feature cycles. Here's why there are so many files:

### Feature-Based Specs (`docs/specs/`)
Each feature (002, 003, 004, 005, 006) was planned as a separate initiative with its own:
- **spec.md** — Requirements & acceptance criteria
- **plan.md** — Implementation plan
- **tasks.md** — Task breakdown
- **research.md** — Research findings (if applicable)
- **data-model.md** — Data model changes
- **checklists/requirements.md** — Requirements checklist
- **contracts/** — API contract definitions

### Phase 4 Rebuild Issues (`docs/specs/004-phase4-rebuild/issues/`)
This directory contains **89 individual issue files** (001-089), each describing a single vertical slice or user story for the Phase 4 rebuild. These are granular implementation tickets.

### Vision Docs (`docs/vision/`)
Large, high-level documents:
- `project-scope.md` (94KB) — Comprehensive project scope
- `screens-spec.md` (55KB) — All 145 screen specifications
- `complete-project-spec.md` (50KB) — Complete project specification
- `over-all-observation.md` (185KB) — File-by-file workspace audit
- `prd-phase4-rebuild.md` (25KB) — PRD for Phase 4 rebuild
- `gap-documentation.md` (29KB) — 34 identified gaps with severity/effort/phase

### Backend Development Docs (`docs/vision/vision-backend/`)
The backend team's working documents:
- `RULES.md` — Must-follow rules (34 rules for backend development)
- `PLAN.md` — Overall backend development plan
- `STEPS.md` — Step-by-step progress tracker
- `CHANGES.md` — Change log (updated before/after every change)
- `TESTING.md` — Testing strategy, cases, and results
- `COMMANDS.md` — Custom commands reference
- `requirement.md` — Master spec consolidating all module requirements

### History/Prompts (`docs/history/prompts/`)
Archived prompt history records (PHRs) from planning sessions.

---

## Proposed Consolidated Structure

All documentation will be reorganized into a clean, logical hierarchy:

```
docs/
├── README.md                           # This file — documentation index
├── architecture/                       # System design & architecture
│   ├── system-overview.md            # Tech stack, architecture decisions
│   ├── data-model.md                 # Consolidated Prisma schema overview
│   ├── api-contracts/                # All API contracts (consolidated)
│   │   ├── auth.contracts.md
│   │   ├── grounds.contracts.md
│   │   ├── bookings.contracts.md
│   │   ├── teams.contracts.md
│   │   ├── matchmaking.contracts.md
│   │   ├── tournaments.contracts.md
│   │   ├── finance.contracts.md
│   │   ├── chat.contracts.md
│   │   ├── notifications.contracts.md
│   │   ├── ratings.contracts.md
│   │   ├── admin.contracts.md
│   │   ├── upload.contracts.md
│   │   ├── subscriptions.contracts.md
│   │   ├── analytics.contracts.md
│   │   ├── pricing.contracts.md
│   │   ├── disputes.contracts.md
│   │   ├── geo.contracts.md
│   │   ├── crm.contracts.md
│   │   └── socket.events.md
│   └── api-reference/
│       └── postman-collection.json     # Importable Postman tests
├── development/                        # Development workflow & standards
│   ├── RULES.md                      # Must-follow rules (backend + frontend)
│   ├── COMMANDS.md                   # Commands reference
│   ├── PLAN.md                       # Overall development plan
│   ├── STEPS.md                      # Step-by-step progress
│   ├── CHANGES.md                    # Change log
│   ├── TESTING.md                    # Testing strategy & results
│   ├── requirement.md                # Master spec
│   └── PROJECT_STATUS.md             # Current project status
├── features/                         # Feature specs (consolidated by feature)
│   ├── 002-complete-gaps/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   ├── tasks.md
│   │   ├── research.md
│   │   ├── data-model.md
│   │   └── checklists/
│   │       └── requirements.md
│   ├── 003-saas-subs-analytics-crm/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   ├── tasks.md
│   │   └── checklists/
│   │       └── requirements.md
│   ├── 004-phase4-rebuild/
│   │   ├── spec.md                   # Consolidated from 89 issues
│   │   ├── plan.md
│   │   ├── tasks.md
│   │   └── issues/                   # All 89 issue files (001-089)
│   │       └── (001-089-*.md)
│   ├── 005-saas-subscription-analytics/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   ├── tasks.md
│   │   ├── research.md
│   │   ├── data-model.md
│   │   ├── quickstart.md
│   │   ├── checklists/
│   │   └── contracts/
│   └── 006-e2e-user-journey-tests/
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
├── vision/                           # High-level vision docs
│   ├── project-scope.md
│   ├── screens-spec.md
│   ├── complete-project-spec.md
│   ├── prd-phase4-rebuild.md
│   ├── gap-documentation.md
│   └── over-all-observation.md
└── history/                          # Archived historical prompts
    └── prompts/
        ├── 002-complete-gaps/
        ├── 003-saas-subs-analytics-crm/
        ├── 004-phase4-rebuild/
        ├── 005-saas-subscription-analytics/
        └── constitution/
```

### Key Changes in the Reorg:
1. **`vision/vision-backend/` → `development/`** — Backend working docs moved to a top-level `development/` folder alongside frontend docs
2. **`vision/vision-frontend/` → `development/`** — Frontend docs merged into `development/`
3. **API contracts consolidated** — All contract files from various `specs/*/contracts/` directories merged into `architecture/api-contracts/`
4. **Postman collection** — Moved to `architecture/api-reference/`
5. **`vision/PROJECT_STATUS.md` → `development/PROJECT_STATUS.md`** — Moved to development folder
6. **Feature specs preserved** — Each feature's spec/plan/tasks kept together in `features/`

---

## Current Structure (Before Reorg)

### `docs/vision/` — High-Level Vision & Planning
| Path | Size | Description |
|------|------|-------------|
| `vision/project-scope.md` | 94KB | Comprehensive project scope & requirements |
| `vision/screens-spec.md` | 55KB | All 145 screens spec (mobile + web) |
| `vision/complete-project-spec.md` | 50KB | Complete project specification (30 sections) |
| `vision/prd-phase4-rebuild.md` | 25KB | PRD for Phase 4 rebuild (112 user stories) |
| `vision/gap-documentation.md` | 29KB | 34 identified gaps with severity/effort/phase |
| `vision/over-all-observation.md` | 185KB | File-by-file workspace audit |
| `vision/PROJECT_STATUS.md` | 6.8KB | Current project status audit |
| `vision/postman-collection.json` | 49KB | Importable Postman tests |
| `vision/vision-backend/` | 7 files | Backend development docs (RULES, PLAN, STEPS, CHANGES, TESTING, COMMANDS, requirement) |
| `vision/vision-frontend/` | 1 file (empty) | Frontend docs (frontend-CHANGES.md is 0 bytes) |

### `docs/specs/` — Feature Specifications
| Path | Description |
|------|-------------|
| `specs/002-complete-gaps/` | Platform gap closure (spec, plan, tasks, research, data-model, contracts/) |
| `specs/003-saas-subs-analytics-crm/` | SaaS & business tools (spec, plan, tasks, checklists/) |
| `specs/004-phase4-rebuild/` | Phase 4 rebuild — 89 issue files + spec/plan/tasks |
| `specs/005-saas-subscription-analytics/` | Subscription analytics (spec, plan, tasks, research, data-model, quickstart, contracts/) |
| `specs/006-e2e-user-journey-tests/` | E2E test spec (spec, plan, tasks) |

### `docs/history/` — Historical Records
| Path | Description |
|------|-------------|
| `history/prompts/` | Prompt history records (PHRs) organized by feature |

---

## Quick Reference by Topic

### Getting Started
- **Project Status:** `docs/vision/PROJECT_STATUS.md`
- **Project Scope:** `docs/vision/project-scope.md`
- **Quick Start:** `docs/specs/005-saas-subscription-analytics/quickstart.md`

### Backend Development
- **Rules:** `docs/vision/vision-backend/RULES.md`
- **Plan:** `docs/vision/vision-backend/PLAN.md`
- **Steps:** `docs/vision/vision-backend/STEPS.md`
- **Change Log:** `docs/vision/vision-backend/CHANGES.md`
- **Testing:** `docs/vision/vision-backend/TESTING.md`
- **Master Spec:** `docs/vision/vision-backend/requirement.md`
- **Commands:** `docs/vision/vision-backend/COMMANDS.md`

### API Reference
- **Postman Collection:** `docs/vision/postman-collection.json`
- **Auth Contracts:** `docs/specs/002-complete-gaps/contracts/auth.contracts.md`
- **All Contracts:** `docs/specs/002-complete-gaps/contracts/` (13 contract files)

### Feature Specs
- **Gap Closure:** `docs/specs/002-complete-gaps/`
- **SaaS/CRM:** `docs/specs/003-saas-subs-analytics-crm/`
- **Phase 4 Rebuild:** `docs/specs/004-phase4-rebuild/` (89 issues)
- **Subscription Analytics:** `docs/specs/005-saas-subscription-analytics/`
- **E2E Tests:** `docs/specs/006-e2e-user-journey-tests/`

---

## Development Workflow

1. **Before coding:** Read `RULES.md` → `PLAN.md` → `STEPS.md`
2. **Before implementing:** Update `CHANGES.md` with planned changes
3. **After implementing:** Write tests → Run `npm test` → Update `TESTING.md`
4. **After every endpoint:** Add to `postman-collection.json`
5. **After every checkpoint:** Commit with prefix (`feat:`, `fix:`, `docs:`, `test:`)
6. **Before each commit:** Run full test suite

---

## User Stories

- **All Features User Stories:** `docs/user-stories/all-features-user-stories.md` — Comprehensive user stories (US-A01 through US-H02, 165 stories total) covering every backend API endpoint and frontend page across all 19 modules
- **Booking Flow User Story:** `docs/user-stories/booking-flow.md` — Detailed player booking journey
- **Dispute Flow User Story:** `docs/user-stories/dispute-flow.md` — End-to-end dispute resolution flow

## Gap Analysis Document

For the specific frontend↔backend integration gaps that were recently identified and fixed, see:
- `gaps-need-to-fixed.md` (root of repo) — Master gap analysis with priority fix list
- `docs/vision/vision-backend/CHANGES.md` — Change log for the fixes applied