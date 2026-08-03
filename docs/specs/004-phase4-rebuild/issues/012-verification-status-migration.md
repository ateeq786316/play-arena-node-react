# 012 — Verification Status Migration

**Type:** AFK | **Blocked by:** 006

## What to build

Add `GroundVerificationStatus` enum to Prisma schema with values `pending`, `approved`, `rejected`. Replace `Ground.isVerified Boolean @default(false)` with `verificationStatus GroundVerificationStatus @default(pending)`. Add `verificationNote String?`, `verifiedAt DateTime?`, `verifiedById String? @db.Uuid` fields to the Ground model. Create a database migration. Migrate existing grounds: if `isVerified = true` → `verificationStatus: "approved"`, if `isVerified = false` → `verificationStatus: "pending"`. Update shared TypeScript types accordingly. Update any existing queries/endpoints that reference `isVerified` to use `verificationStatus` instead.

## Acceptance criteria

- [ ] Prisma schema updated with new enum and fields
- [ ] Migration runs without data loss
- [ ] Existing `isVerified` values mapped correctly to new enum
- [ ] All backend code referencing `isVerified` updated to `verificationStatus`
- [ ] Shared types updated
