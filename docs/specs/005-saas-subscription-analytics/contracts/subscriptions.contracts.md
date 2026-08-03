# Subscription Module — API Contracts

**Base path**: `/api/subscriptions`
**Note**: Contracts below cover the endpoints this feature adds or modifies. Unchanged endpoints (`GET /plans`, `GET /invoices`) are listed for completeness.

---

## GET `/plans`
- **Auth**: Public
- **Response 200**: `{ plans: SubscriptionPlan[] }` — active plans ordered by `sortOrder`, includes `analyticsRetentionDays`

## GET `/my`
- **Auth**: JWT (owner)
- **Response 200**:
```json
{
  "subscription": {
    "id": "...",
    "planId": "...",
    "status": "trial | pending_payment | active | past_due | suspended | cancelled | expired",
    "currentPeriodStart": "2026-07-31T00:00:00+05:00",
    "currentPeriodEnd": "2026-08-14T00:00:00+05:00",
    "plan": { "id": "...", "name": "Free", "analyticsRetentionDays": 7, "maxGrounds": 1, ... }
  } | null,
  "plan": { "id": "...", "name": "Free", ... },
  "usage": { "grounds": 1, "courts": 2, "staff": 0, "groundsLimit": 1, "courtsLimit": 2, "staffLimit": 0 }
}
```
- **New**: includes `usage` (counts vs plan limits for FR-002) and trial/expiry metadata derived from `currentPeriodEnd` + `PlatformSetting.trial_duration_days`.

## POST `/upgrade`
- **Auth**: JWT (owner)
- **Body**: `{ planId: string }`
- **Validation**: `planId` required, must be UUID, must exist + `isActive`
- **Behavior** (Clarification Q1): rejects if target plan `sortOrder < current` and current status is `active`/`trial`; **rejects if `usage` exceeds target plan limits** (403 `"Plan limit reached: <field>"` FR-017); otherwise creates/updates subscription with `status: "pending_payment"` and creates `Invoice` with `status: "unpaid"`.
- **Response 201**: `{ message: "Upgrade requested. Awaiting payment confirmation.", subscription, invoice }`

## POST `/downgrade`
- **Auth**: JWT (owner)
- **Body**: `{ planId: string }`
- **Validation**: `planId` required; target `sortOrder` must be lower than current
- **Behavior**: takes effect immediately on confirmation (no payment required). Frontend MUST show retention warning before calling (FR-018).
- **Response 200**: `{ message: "Plan downgraded.", subscription }`

## POST `/cancel`
- **Auth**: JWT (owner)
- **Body**: none
- **Behavior**: sets `status: "cancelled"`, `cancelledAt`; plan remains active until `currentPeriodEnd` (corrected from current immediate-end behavior).
- **Response 200**: `{ message: "Subscription cancelled.", subscription }`

## GET `/invoices`
- **Auth**: JWT (owner)
- **Response 200**: `{ invoices: Invoice[] }` — newest first

---

## Admin routes

## POST `/api/admin/subscriptions/:id/confirm-payment`
- **Auth**: JWT (admin/super_admin)
- **Behavior** (Clarification Q1, FR-016a): transitions subscription `pending_payment → active`; sets `currentPeriodStart = now`, `currentPeriodEnd = now + interval`; marks matching unpaid `Invoice` as `status: "paid"` + `paidAt`.
- **Validation**: `:id` UUID; subscription must be in `pending_payment` status (409 otherwise).
- **Response 200**: `{ message: "Payment confirmed. Subscription activated.", subscription }`

## GET `/api/admin/subscriptions/expiring`
- **Auth**: JWT (admin/super_admin)
- **Query**: `days?=7` (default 7)
- **Response 200**: `{ subscriptions: [{ id, owner: { name, email }, plan: { name }, status, currentPeriodEnd }] }` — FR-020 (expiring within N days)

---

## Key Types

```typescript
type SubscriptionStatus = "active" | "pending_payment" | "trial" | "past_due" | "suspended" | "cancelled" | "expired";

type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;              // PKR
  interval: "monthly" | "yearly";
  maxGrounds: number;
  maxCourtsPerGround: number;
  maxBookingsPerMonth: number | null;
  commissionRate: number;
  analyticsRetentionDays: number;   // NEW
  features: Record<string, boolean>;
  isActive: boolean;
  sortOrder: number;
};

type PlanUsage = {
  grounds: number;      // approved grounds count (Clarification Q4)
  courts: number;
  staff: number;
  groundsLimit: number;
  courtsLimit: number;
  staffLimit: number;
};
```
