---
id: phr-20260730-001
title: create-project-constitution-v010
stage: constitution
date: 2026-07-30
surface: cli
model: deepseek-v4-flash-free
feature: foundation
branch: 003-saas-subs-analytics-crm
user: ateeq
command: "create constitution after reading the whole project even rules from every file and folder..."
labels: [constitution, governance, principles, foundation]
links:
  spec: specs/002-complete-gaps/spec.md
  ticket: ~
  adr: ~
  pr: ~
files:
  - .specify/memory/constitution.md
  - .specify/templates/spec-template.md
  - .specify/templates/plan-template.md
  - .specify/templates/tasks-template.md
tests:
  - Tests verified: backend 245/245 passing, frontend build 0 errors
---

## Prompt

Create constitution after reading the whole project even rules from every file
and folder and sub folder. Do research like this project at production level —
find everything about this type of project on github and every internet place —
and create the greatest constitution. Include skills needed for frontend and
backend. Premium frontend and proper backend required.

## Response snapshot

Created a comprehensive 10-principle constitution for PlayArena covering:
module architecture, test discipline, TypeScript contracts, API consistency,
frontend 4-states rule, database schema standards, security defense-in-depth,
SaaS plan gating, performance/reliability, and Pakistan market localization.
Added governance amendment procedure, quality gates, branch strategy, commit
convention, and explicit no-go decisions (no Redis, no localStorage tokens,
no `any` type). All 3 spec/plan/tasks templates aligned and verified.

## Outcome

- ✅ Impact: Foundational governance document now governs all 19 backend
  modules, 36 frontend pages, 48 database models, and 245 tests. Every future
  feature plan must pass constitution check.
- 🧪 Tests: 245/245 backend tests pass, frontend build 0 errors
- 📁 Files: constitution.md (new), 3 templates verified
- 🔁 Next prompts: /sp.spec for next feature, /sp.plan for implementation
- 🧠 Reflection: Constitution covers both technical architecture and market
  needs (Pakistan TZ/PKR/Urdu). No Redis dependency explicitly locked.
  The "Four-States Rule" for frontend pages is the most actionable frontend
  principle — every page must handle loading/empty/error/success.

## Evaluation notes (flywheel)

- Failure modes observed: None during constitution creation. Previous sessions
  showed CORS misconfiguration (wildcard * with credentials), rate-limit 429
  blocking logout, and reset-password redirecting to API URL instead of
  frontend — all now codified as constitutional rules.
- Graders run and results (PASS/FAIL): Template alignment check — PASS
- Prompt variant (if applicable): full-constitution-v1
- Next experiment (smallest change to try): Add frontend testing principle
  once React Testing Library is introduced
