# 018 — Subscription Plan CRUD Backend

**Type:** AFK | **Blocked by:** 007

## What to build

Add CRUD endpoints for subscription plans, accessible only by Super Admin:

- `GET /api/admin/plans` — list all plans with pagination
- `POST /api/admin/plans` — create plan (name, price, interval, maxGrounds, maxCourtsPerGround, commissionRate, features JSON, isActive, sortOrder)
- `PATCH /api/admin/plans/:id` — update plan
- `DELETE /api/admin/plans/:id` — soft delete (set `isActive: false`)

Validate that at least one plan is always active. The existing `SubscriptionPlan` model should be used. Create a seed script in `prisma/seed.js` that creates 3 plans: Free (PKR 0, 1 ground, 2 courts, 5% commission), Starter (PKR 2,999/mo, 3 grounds, 5 courts, 3% commission), Professional (PKR 7,999/mo, unlimited, unlimited, 1% commission). Write tests for all CRUD operations.

## Acceptance criteria

- [ ] All 4 CRUD endpoints working with proper validation
- [ ] Only Super Admin can access plan CRUD
- [ ] Soft delete sets `isActive: false`, doesn't remove from DB
- [ ] Seed script creates 3 plans: Free, Starter, Professional
- [ ] Tests cover all CRUD operations + auth enforcement
