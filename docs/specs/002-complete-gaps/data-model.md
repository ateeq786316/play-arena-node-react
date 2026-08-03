# Data Model: New SaaS Entities

**Branch**: `002-complete-gaps` | **Date**: 2026-07-30 | **Plan**: [plan.md](./plan.md)

## Overview

These entities extend the existing Prisma schema (38 models) to support Phase 3 and Phase 4 SaaS features. Each section includes the model definition, key relationships, index strategy, and migration considerations.

---

## 1. Subscription System

### SubscriptionPlan
Tier definition for ground owner monetization.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default `gen_random_uuid()` | Primary key |
| name | String | unique, required | "Free", "Starter", "Professional", "Enterprise" |
| price | Decimal(12,2) | required | Monthly price in PKR |
| interval | String | required, enum: `monthly`/`yearly` | Billing cycle |
| maxGrounds | Int | required | Max grounds allowed |
| maxCourtsPerGround | Int | required | Max courts per ground |
| maxBookingsPerMonth | Int | nullable (null=unlimited) | Soft cap with overage |
| commissionRate | Decimal(5,4) | required | Platform commission (e.g., 0.05 = 5%) |
| features | JSON | required | Feature flag object: `{ analytics: bool, crm: bool, dynamicPricing: bool, customBranding: bool, apiAccess: bool }` |
| isActive | Boolean | default true | Soft enable/disable |
| sortOrder | Int | required | Display ordering |
| createdAt | DateTime | auto | — |
| updatedAt | DateTime | auto | — |

**Relations**: has many `GroundOwnerSubscription`
**Indexes**: `name` (unique), `isActive` + `sortOrder` (composite for listing)

### SubscriptionStatus (enum)
`active`, `past_due`, `suspended`, `cancelled`, `expired`

### GroundOwnerSubscription
Per-owner subscription tracking.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | — |
| groundOwnerId | UUID | FK → User, required | Subscription owner |
| planId | UUID | FK → SubscriptionPlan, required | Current plan |
| status | SubscriptionStatus | required | Current lifecycle state |
| currentPeriodStart | DateTime | required | Start of billing period |
| currentPeriodEnd | DateTime | required | End of billing period |
| stripeCustomerId | String | nullable | Stripe reference |
| stripeSubscriptionId | String | nullable | Stripe reference |
| cancelledAt | DateTime | nullable | When owner cancelled |
| createdAt | DateTime | auto | — |
| updatedAt | DateTime | auto | — |

**Relations**: belongs to `User` (groundOwnerId), belongs to `SubscriptionPlan`
**Indexes**: `groundOwnerId` (unique — one active subscription per owner), `status` + `currentPeriodEnd` (for expiry workers)

### InvoiceStatus (enum)
`pending`, `paid`, `overdue`, `cancelled`, `refunded`

### Invoice
Billing record per subscription cycle.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | — |
| subscriptionId | UUID | FK → GroundOwnerSubscription | Parent subscription |
| groundOwnerId | UUID | FK → User | For query convenience |
| invoiceNumber | String | unique, required | Format: `INV-{YYYYMM}-{sequential}` |
| amount | Decimal(12,2) | required | Invoice total |
| status | InvoiceStatus | required | Lifecycle state |
| periodStart | DateTime | required | Billing period start |
| periodEnd | DateTime | required | Billing period end |
| paidAt | DateTime | nullable | When payment confirmed |
| paymentMethod | String | nullable | Gateway used |
| paymentGatewayReference | String | nullable | Gateway transaction ID |
| createdAt | DateTime | auto | — |

**Relations**: belongs to `GroundOwnerSubscription`, belongs to `User`
**Indexes**: `invoiceNumber` (unique), `subscriptionId` + `status`, `groundOwnerId` + `createdAt`

### State Machine: Subscription Lifecycle

```
                    ┌─────────────┐
                    │   active    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        payment fails   owner cancels  renewal fails
              │            │            │
              ▼            ▼            ▼
        ┌─────────┐  ┌──────────┐  ┌─────────┐
        │ past_due │  │ cancelled│  │ expired │
        └─────┬───┘  └──────────┘  └─────────┘
              │
      ┌───────┼───────┐
      │       │       │
      ▼       ▼       ▼
    payment 14 days  30 days
    retries  no pay   no pay
      │       │       │
      ▼       ▼       ▼
    active  suspended cancelled
```

---

## 2. Analytics System

### AnalyticsPeriod (enum)
`daily`, `weekly`, `monthly`

### AnalyticsSnapshot
Pre-computed analytics data point.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | — |
| metricName | String | required | e.g., "revenue", "booking_count", "utilization_rate" |
| metricValue | Decimal(15,2) | required | Aggregated value |
| dimension | String | nullable | e.g., "groundId", "sportType", "staffId" |
| dimensionValue | String | nullable | e.g., actual UUID or "futsal" |
| period | AnalyticsPeriod | required | Aggregation window |
| snapshotDate | Date | required | Date this snapshot represents |
| createdAt | DateTime | auto | — |

**Indexes**: `(metricName, period, snapshotDate)`, `(dimension, dimensionValue, snapshotDate)`

### DailyAggregation
Per-ground daily rollup for fast dashboard queries.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | — |
| groundId | UUID | FK → Ground | Ground reference |
| date | Date | required | Calendar date |
| totalBookings | Int | default 0 | — |
| totalRevenue | Decimal(12,2) | default 0 | — |
| totalCommission | Decimal(12,2) | default 0 | — |
| totalCashCollected | Decimal(12,2) | default 0 | — |
| totalOnlineCollected | Decimal(12,2) | default 0 | — |
| newCustomers | Int | default 0 | First-time bookers |
| returningCustomers | Int | default 0 | Repeat bookers |
| bookingCancellations | Int | default 0 | — |
| walkInCount | Int | default 0 | — |
| avgBookingValue | Decimal(12,2) | default 0 | — |
| utilizationRate | Decimal(5,4) | default 0 | Booked slots / total slots |
| createdAt | DateTime | auto | — |

**Indexes**: `(groundId, date)` unique composite

---

## 3. CRM & Communications

### CommunicationChannel (enum)
`email`, `sms`, `whatsapp`, `push`, `in-app`

### CommunicationStatus (enum)
`queued`, `sent`, `delivered`, `failed`, `read`

### BroadcastMessage
Promotional broadcast sent by ground owner.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | — |
| groundId | UUID | FK → Ground | Sending venue |
| sentById | UUID | FK → User | Who sent it |
| subject | String | max 100 chars | — |
| body | String | max 2000 chars | — |
| ctaLabel | String | nullable, max 30 chars | Button text |
| ctaUrl | String | nullable | Button link |
| audienceFilter | JSON | nullable | Filter criteria object |
| audienceCount | Int | default 0 | How many recipients |
| sentCount | Int | default 0 | Delivery count |
| deliveredCount | Int | default 0 | — |
| clickCount | Int | default 0 | CTA clicks |
| createdAt | DateTime | auto | — |

**Indexes**: `groundId` + `createdAt`, monthly limit enforcement (max 2/ground/month)

### CommunicationLog
Audit trail for every outbound communication.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | — |
| userId | UUID | FK → User | Recipient |
| channel | CommunicationChannel | required | Delivery channel |
| messageType | String | required | e.g., "booking_confirmation", "match_reminder" |
| templateId | UUID | nullable | FK to template |
| referenceType | String | nullable | e.g., "booking", "match", "subscription" |
| referenceId | UUID | nullable | Entity being referenced |
| status | CommunicationStatus | required | Delivery status |
| sentAt | DateTime | nullable | — |
| deliveredAt | DateTime | nullable | — |
| readAt | DateTime | nullable | — |
| errorMessage | String | nullable | Failure reason |
| createdAt | DateTime | auto | — |

**Indexes**: `(userId, createdAt)`, `(referenceType, referenceId)`, `(status, createdAt)`

### UserCommunicationPreference
Per-user channel opt-in.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| userId | UUID | FK → User, PK | — |
| optInEmail | Boolean | default true | — |
| optInSms | Boolean | default false | Requires consent |
| optInWhatsapp | Boolean | default false | Requires consent |
| optInPush | Boolean | default true | — |
| updatedAt | DateTime | auto | — |

---

## 4. Dynamic Pricing

### PricingRule
Time-based price multiplier for courts.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | — |
| groundId | UUID | FK → Ground, required | Venue |
| courtId | UUID | nullable → Court | null = all courts |
| sportCategoryId | UUID | nullable → SportCategory | null = all sports |
| dayOfWeek | Int | -1 to 6 | -1 = all days, 0=Sun...6=Sat |
| startTime | String (HH:mm) | required | Rule applies from |
| endTime | String (HH:mm) | required | Rule applies until |
| priceMultiplier | Decimal(3,2) | required | e.g., 1.50 = 50% surge |
| isActive | Boolean | default true | — |
| priority | Int | default 0 | Higher = wins ties |
| createdAt | DateTime | auto | — |

**Constraint**: No overlapping time ranges for same `(groundId, courtId, dayOfWeek)`
**Indexes**: `(groundId, courtId, dayOfWeek, isActive)`, `(groundId, sportCategoryId, dayOfWeek)`

### HolidayPricing
Date-specific price override.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | — |
| groundId | UUID | FK → Ground | — |
| name | String | required | e.g., "Eid Special" |
| date | Date | required | Calendar date |
| priceMultiplier | Decimal(3,2) | required | Override multiplier |
| isActive | Boolean | default true | — |
| createdAt | DateTime | auto | — |

**Index**: `(groundId, date)` unique

### CouponType (enum)
`percentage`, `fixed_amount`

### Coupon
Discount coupon for bookings.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | — |
| groundId | UUID | nullable → Ground | null = platform-wide |
| code | String | unique, 6-12 chars | Case-insensitive |
| type | CouponType | required | — |
| value | Decimal(12,2) | required | % or amount |
| minBookingAmount | Decimal(12,2) | nullable | Minimum to apply |
| maxDiscountAmount | Decimal(12,2) | nullable | Cap on discount |
| usageLimit | Int | nullable | Total uses cap |
| perUserLimit | Int | nullable | Per-user cap |
| usedCount | Int | default 0 | Running usage |
| validFrom | DateTime | required | — |
| validUntil | DateTime | required | — |
| applicableSportIds | UUID[] | nullable | Sport filter |
| isActive | Boolean | default true | — |
| createdById | UUID | FK → User | Creator |
| createdAt | DateTime | auto | — |

**Indexes**: `code` (unique), `groundId` + `isActive` + `validUntil`

### CouponUsage
Tracks who used which coupon.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | — |
| couponId | UUID | FK → Coupon | — |
| bookingId | UUID | FK → Booking | — |
| userId | UUID | FK → User | Who applied it |
| discountAmount | Decimal(12,2) | required | Actual discount |
| appliedAt | DateTime | auto | — |

**Index**: `(couponId, bookingId)` unique (one coupon per booking)

---

## 5. Dispute System

### DisputeType (enum)
`booking`, `payment`, `match`, `damage`, `no_show`, `other`

### DisputeStatus (enum)
`submitted`, `under_review`, `resolved`, `rejected`, `escalated`

### ResolutionAction (enum)
`full_refund`, `partial_refund`, `no_refund`, `penalty_waived`, `other`

### Dispute
Moderation record for conflicts.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | — |
| disputeType | DisputeType | required | Category |
| referenceType | String | required | e.g., "booking", "match" |
| referenceId | UUID | required | Entity being disputed |
| filedById | UUID | FK → User | Complainant |
| description | String | max 2000 chars | Issue details |
| supportingImageUrls | JSON | nullable | Array of S3 URLs |
| status | DisputeStatus | required | Lifecycle |
| assignedToId | UUID | nullable | FK → User (moderator) |
| escalationLevel | Int | default 0 | Higher = more urgent |
| escalatedAt | DateTime | nullable | When escalated |
| resolvedById | UUID | nullable | FK → User |
| resolutionNotes | String | nullable | Moderator notes |
| resolutionAction | ResolutionAction | nullable | What was decided |
| resolvedAt | DateTime | nullable | — |
| createdAt | DateTime | auto | — |

**Indexes**: `(status, escalationLevel, createdAt)` for moderation queue, `(filedById, createdAt)`

### DamageClaim
Security deposit damage claim.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | — |
| bookingId | UUID | FK → Booking | — |
| groundId | UUID | FK → Ground | — |
| filedById | UUID | FK → User | Staff who filed |
| description | String | max 2000 chars | — |
| imageUrls | JSON | nullable | Evidence photos |
| estimatedCost | Decimal(12,2) | required | Repair estimate |
| withheldAmount | Decimal(12,2) | required | Actual withheld |
| status | String | enum: pending/approved/rejected | — |
| resolvedById | UUID | nullable | — |
| resolvedAt | DateTime | nullable | — |
| createdAt | DateTime | auto | — |

**Indexes**: `(bookingId)`, `(groundId, status)`

### NoShowPenalty
Automated no-show tracking.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | — |
| userId | UUID | FK → User | Offender |
| bookingId | UUID | FK → Booking | Missed booking |
| reason | String | required | Auto-generated |
| status | String | enum: pending/waived/confirmed | — |
| disputedById | UUID | nullable | Ground owner |
| resolvedAt | DateTime | nullable | — |
| createdAt | DateTime | auto | — |

**Indexes**: `(userId, status)`, `(userId, createdAt)` for threshold queries

### No-Show Thresholds
Hardcoded rules (not configurable):
- 3 in 30 days → 7-day booking restriction
- 5 in 90 days → 30-day booking restriction
- 10 in 365 days → permanent ban review (flagged for super_admin)

---

## 6. Geolocation Extensions

No new models required. The existing `Ground` model already has `latitude` and `latitude` as `Decimal(10, 7)`.

### Database Enhancement
Add PostgreSQL extension and index:

```sql
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- Or use GIST index for PostGIS:
-- CREATE INDEX grounds_location_gist_idx ON "Ground" USING GIST (
--   ll_to_earth(latitude::float8, longitude::float8)
-- ) WHERE "deletedAt" IS NULL AND "isVerified" = true AND "isActive" = true;

-- Bounding box index (without PostGIS):
CREATE INDEX grounds_coordinates_active_idx ON "Ground" (latitude, longitude)
WHERE "deletedAt" IS NULL AND "isVerified" = true AND "isActive" = true;
```

### GroundClosure
Venue closure dates.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | — |
| groundId | UUID | FK → Ground | — |
| startDate | Date | required | Closure start |
| endDate | Date | required | Closure end |
| reason | String | nullable | e.g., "Maintenance" |
| isRecurring | Boolean | default false | Yearly recurrence |
| createdAt | DateTime | auto | — |

**Index**: `(groundId, startDate, endDate)`

---

## Migration Strategy

1. **Subscription models** — Add in a single migration as they are tightly coupled
2. **Analytics models** — Add after subscription migration; analytics workers depend on subscription data
3. **CRM models** — Add after analytics; depend on notification infrastructure
4. **Pricing models** — Add standalone; only relate to existing Ground/Court/SportCategory models
5. **Dispute models** — Add standalone; relate to existing Booking/Match models
6. **Geolocation** — No new models (GroundClosure is optional); only add indexes via raw SQL

Migration command: `npx prisma migrate dev --name add_saas_models`
