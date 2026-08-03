---
id: PHR-005-003
title: saas-subscription-analytics-plan
stage: plan
date: 2026-07-31T05:30:00+05:00
surface: cli
model: deepseek-v4-flash-free
feature: SaaS Subscription Analytics Dashboard
branch: 005-saas-subscription-analytics
user: hp
command: /sp.plan build the technical plan
labels: [plan, subscription, analytics, node-cron, recharts, aggregation-job, retention]
links:
  spec: docs/specs/005-saas-subscription-analytics/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - path: docs/specs/005-saas-subscription-analytics/plan.md
    role: implementation-plan
  - path: docs/specs/005-saas-subscription-analytics/research.md
    role: phase-0-research
  - path: docs/specs/005-saas-subscription-analytics/data-model.md
    role: phase-1-data-model
  - path: docs/specs/005-saas-subscription-analytics/contracts/subscriptions.contracts.md
    role: phase-1-api-contract
  - path: docs/specs/005-saas-subscription-analytics/contracts/analytics.contracts.md
    role: phase-1-api-contract
  - path: docs/specs/005-saas-subscription-analytics/quickstart.md
    role: phase-1-quickstart
  - path: AGENTS.md
    role: agent-context-updated
tests:
  - name: prerequisites
    status: pass
  - name: constitution-check
    status: pass
---

## Prompt

User requested the technical plan for the SaaS subscription analytics dashboard spec (after /sp.clarify resolved 5 ambiguities), invoking /sp.plan.

## Response snapshot

Created the full plan package on branch `005-saas-subscription-analytics`:

- **plan.md** — Technical context, constitution check (all gates pass), project structure, 3 justified complexity entries (node-cron, recharts, plan.middleware repair), 4 implementation phases.
- **research.md** — Resolved 7 technical unknowns: node-cron daily aggregation job (idempotent upserts self-heal), recharts for charts + custom CSS-grid heatmap, hand-rolled RFC 4180 CSV, service-layer soft retention enforcement, platform analytics repo queries with Admin+SuperAdmin RBAC, pending_payment lifecycle, plan.middleware dead-code repair.
- **data-model.md** — 3 schema deltas: extend SubscriptionStatus enum (+pending_payment, +trial), add SubscriptionPlan.analyticsRetentionDays (7/30/365), add PlatformSetting model. Documented state machine, validation rules, migration caveat (Prisma ADD VALUE transaction split).
- **contracts/** — subscriptions.contracts.md (upgrade→pending_payment, downgrade, admin confirm-payment, expiring, usage in /my) + analytics.contracts.md (retention-clamped dashboard, CSV export, 3 platform endpoints).
- **quickstart.md** — setup + seed + manual smoke test.
- **AGENTS.md** — agent context updated with node-cron + recharts (manual markers preserved).

Research grounded in a live codebase inventory: confirmed existing-but-unused AnalyticsSnapshot/DailyAggregation upserts, auto-activate subscription.service, dead plan.middleware.js, empty components/ui, no chart lib.

## Outcome

- ✅ Impact: Complete technical plan connecting the clarified spec to existing code. Closes 8 verified codebase gaps (aggregation producer, payment lifecycle, middleware repair, UI primitives, CSV, platform analytics, shared types, seed data).
- 🧪 Tests: prerequisites pass; constitution check pass (10/10 gates, 3 justified complexity entries)
- 📁 Files: plan.md, research.md, data-model.md, 2 contracts, quickstart.md, AGENTS.md
- 🔁 Next prompts: /sp.tasks
- 🧠 Reflection: The exploration inventory was decisive — it proved snapshots tables exist but are never populated, and the upgrade path auto-activates with no payment capture. This turned the plan from generic into a precise gap-closure plan.

## Evaluation notes (flywheel)

- Failure modes observed: None (update-agent-context.ps1 parsed plan correctly)
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
