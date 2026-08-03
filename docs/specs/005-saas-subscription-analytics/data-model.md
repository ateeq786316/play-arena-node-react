# Data Model: SaaS Subscription Analytics Dashboard

**Phase 1 output** — schema deltas for `playarena-backend/prisma/schema.prisma`.
**Branch**: `005-saas-subscription-analytics` | **Date**: 2026-07-31

## Overview

This feature makes 3 targeted schema changes to the existing SaaS models (already present from branch 003):

1. **Extend `SubscriptionStatus` enum** — add `pending_payment`, `trial` (Clarification Q1 + FR-001).
2. **Add `SubscriptionPlan.analyticsRetentionDays`** — drives soft retention enforcement (FR-005, research §4).
3. **Add `PlatformSetting` model** — key/value config for trial duration and thresholds (FR-003/FR-004, research §6).

No new entities beyond these — `AnalyticsSnapshot`, `DailyAggregation`, `Invoice`, `GroundOwnerSubscription` already exist and are reused.

---

## 1. Enum change — `SubscriptionStatus`

**Current**:
```prisma
enum SubscriptionStatus {
  active
  past_due
  suspended
  cancelled
  expired
}
```

**New**:
```prisma
enum SubscriptionStatus {
  active
  pending_payment   // NEW — upgrade created, awaiting admin payment confirmation (FR-016a)
  trial             // NEW — owner on Free plan within trial window (FR-001)
  past_due
  suspended
  cancelled
  expired
}
```

**State transitions**:

```text
trial ──(upgrade confirmed)─────────────→ active
trial ──(trial expires)────────────────→ expired
active ──(upgrade requested)───────────→ pending_payment
active ──(downgrade confirmed)─────────→ active (new plan; no payment needed)
pending_payment ──(admin confirms)─────→ active
pending_payment ──(expires after 7d)───→ cancelled
active ──(renewal unpaid 7d)───────────→ past_due
past_due ──(unpaid 14d)────────────────→ suspended
suspended ──(unpaid 30d)───────────────→ expired
active/past_due ──(owner cancels)──────→ cancelled
```

---

## 2. `SubscriptionPlan` — new field

```prisma
model SubscriptionPlan {
  // ...existing fields unchanged...
  analyticsRetentionDays Int    @default(7)   // NEW — 7/30/365; retention window for dashboard queries (FR-005)
  // ...
}
```

**Constraints**:
- Free → 7, Starter → 30, Professional → 365 (seed values; Super Admin editable via plan CRUD).
- `null` forbidden — default 7 ensures Free-tier fallback if unseeded.
- Used at analytics query time to compute `startDate` clamp (soft enforcement — research §4).

---

## 3. New model — `PlatformSetting`

```prisma
model PlatformSetting {
  key       String   @id
  value     String
  updatedAt DateTime @updatedAt

  @@map("platform_settings")
}
```

**Seeded keys** (research §6):

| key | value | Used for |
|-----|-------|----------|
| `trial_enabled` | `"true"` | Toggle free trial availability |
| `trial_duration_days` | `"14"` | Default trial length (FR-003/FR-004) |
| `variance_threshold` | `"500"` | Cash session variance flag (read-only reference — existing feature) |
| `retention_grace_days` | `"0"` | Extra days granted after downgrade before retention clamp applies |

---

## 4. Existing models reused (no changes)

### `AnalyticsSnapshot` — per-ground daily rollup
`groundId`, `date`, `totalRevenue`, `onlineRevenue`, `offlineRevenue`, `totalBookings`, `completedBookings`, `cancelledBookings`, `utilizationRate`, `newCustomers`, `returningCustomers`, `avgBookingValue` — `@@unique([groundId, date])`. **Produced** by the new aggregation job (currently only consumed; upserts exist in `analytics.repo.js`).

### `DailyAggregation` — court × hour granularity
`groundId`, `date`, `hour`, `courtId`, `bookings`, `revenue` — `@@unique([groundId, courtId, date, hour])`. Feeds heatmap (FR-008) + revenue stats. **Produced** by aggregation job.

### `Invoice` — subscription billing records
`subscriptionId`, `amount`, `currency`, `status` (plain string — values `unpaid`/`paid` used by this feature), `paidAt`, `dueDate`, `invoiceUrl`. No schema change; lifecycle updated in service.

### `GroundOwnerSubscription`
`groundOwnerId @unique`, `planId`, `status`, `currentPeriodStart/End`, `cancelledAt`. Uses extended `SubscriptionStatus`. No schema change.

### `Ground` — approved-ground filter
`isVerified Boolean` is the **approval gate** for analytics data scope (Clarification Q4). Aggregation job and analytics reads MUST filter `ground.isVerified == true`. (A `verificationStatus` enum is a Phase 4 concern — issue `012-verification-status-migration` — out of scope here.)

---

## 5. Validation rules (from requirements)

| Field | Rule | Source |
|-------|------|--------|
| `SubscriptionPlan.analyticsRetentionDays` | Int 1–3650 | FR-005 |
| `PlatformSetting.key` | unique, non-empty | — |
| `Invoice.amount` | Decimal(12,2), > 0 | — |
| Upgrade limits | `limitByPlan(maxGrounds/maxCourtsPerGround/maxBookingsPerMonth)` before creating `pending_payment` sub | FR-017 |
| Downgrade | allowed if target `sortOrder` lower; requires frontend retention warning | FR-018 |
| Analytics scope | only `isVerified == true` grounds | Clarification Q4 |
| Retention window | `startDate >= today - (retentionDays - 1)` | FR-013 |

---

## 6. Migration

One new migration file: `playarena-backend/prisma/migrations/<ts>_add_subscription_analytics_fields/migration.sql`

- `ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'pending_payment';` then `'trial'`
- `ALTER TABLE "subscription_plans" ADD COLUMN "analyticsRetentionDays" INTEGER NOT NULL DEFAULT 7;`
- `CREATE TABLE "platform_settings" (...);`
- Seed runs via new `prisma/seed.js` (upsert — idempotent).

> Note: Prisma requires `ALTER TYPE ... ADD VALUE` to be in a migration that also runs at least one other statement in the same transaction, OR used with `--create-only` + manual split. Plan the migration as `--create-only` and split the enum additions from the table/column changes to avoid the "new enum value cannot be used in same transaction" error.
