---
id: PHR-005-004
title: tasks-saas-subscription-analytics
stage: tasks
date: 2026-07-31T06:00:00+05:00
surface: cli
model: deepseek-v4-flash-free
feature: SaaS Subscription Analytics Dashboard
branch: 005-saas-subscription-analytics
user: hp
command: /sp.tasks generate the task breakdown
labels: [tasks, subscription, analytics, node-cron, recharts, retention, aggregation-job, platform-analytics, pending-payment]
links:
  spec: docs/specs/005-saas-subscription-analytics/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - path: docs/specs/005-saas-subscription-analytics/tasks.md
    role: task-list
tests:
  - name: prerequisites
    status: pass
  - name: format-validation
    status: pass
---

## Prompt

User invoked /sp.tasks to generate the task breakdown for the SaaS subscription analytics dashboard, after /sp.plan completed. Prerequisites check confirmed FEATURE_DIR = docs/specs/005-saas-subscription-analytics with plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md, checklists/.

## Response snapshot

Created `docs/specs/005-saas-subscription-analytics/tasks.md` with 56 tasks across 8 phases, fully grounded in the actual codebase (verified live file inventory before writing):

- **Phase 1 (Setup)**: 3 tasks — node-cron + recharts deps, new frontend test infra (vitest + RTL).
- **Phase 2 (Foundational)**: 8 tasks — Prisma enum/field/PlatformSetting, split-enum migration, idempotent seed, plan.middleware dead-import fix, RFC 4180 CSV util, shared types, getStatusColor, 6 UI primitives.
- **Phase 3 (US1 P1)**: 8 tasks — usage-count queries, mySubscription enrichment, UsageBar, rebuild 2 pages, backend + frontend tests.
- **Phase 4 (US2 P1)**: 10 tasks — aggregateDay + node-cron job, service/repo retention clamp + dataAsOf, charts + heatmap, rebuild analytics page, tests.
- **Phase 5 (US3 P2)**: 5 tasks — CSV export wiring, RetentionNotice, date-range/CSV UI, csv.test.js, export contract test.
- **Phase 6 (US4 P2)**: 11 tasks — pending_payment lifecycle, downgrade, cancel fix, confirm-payment + expiring admin routes, validators, requirePlan wiring, PlanComparisonTable, UI flow, tests.
- **Phase 7 (US5 P3)**: 6 tasks — requireAdmin middleware, platform repo/service/routes, admin/analytics page, platform-analytics.test.js.
- **Phase 8 (Polish)**: 5 tasks — E2E quickstart flow, aggregation accuracy, retention verification, full test suite, frontend build.

Includes dependency graph, parallel execution windows, MVP scope (US1 only), and independent test criteria per story. Verified actual code paths: subscription.service auto-activates upgrades (to change), plan.middleware imports ../config/prisma.js (nonexistent), analytics routes lack /platform and admin role guard, admin routes use only authMiddleware (no role check), analytics page currently div-based (no recharts), tests extend existing Vitest mocked-Prisma suites.

## Outcome

- ✅ Impact: Complete, immediately-executable task list mapped to real file paths and existing test patterns. Closes the plan → execution gap for all 5 user stories.
- 🧪 Tests: Format validation PASS — every task matches `- [ ] [TaskID] [P?] [Story] Description` with file paths; story labels on all user-story phase tasks.
- 📁 Files: tasks.md (56 tasks, 8 phases)
- 🔁 Next prompts: /tdd (optional red-phase per task), or direct implementation from Phase 1
- 🧠 Reflection: Live verification paid off — discovered admin routes use bare authMiddleware (no role guard), so US5 needs a new requireAdmin middleware, and analytics routes must register /platform/* before /:groundId/* (Express route-order gotcha). Both encoded as explicit tasks.

## Evaluation notes (flywheel)

- Failure modes observed: create-phr.sh is bash-only — not executable on Windows PowerShell; fell back to agent-native template write (PHR-005-004).
- Graders run and results (PASS/FAIL): PASS (format validation)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
