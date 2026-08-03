# 006 — UserRole Prisma Enum

**Type:** AFK | **Blocked by:** None

## What to build

Add `UserRole` enum to Prisma schema with values: `super_admin`, `admin`, `owner`, `manager`, `staff`, `player`. Change `User.role String @default("player")` to `User.role UserRole @default(player)`. Create database migration. Add a seed script or manual migration to set existing user roles: set your own user to `super_admin`, keep all others as `player`. Update the shared TypeScript type `User.role` from `string` to the new enum values in `packages/shared/src/types/index.ts`.

## Acceptance criteria

- [ ] Prisma schema has `UserRole` enum with all 6 values
- [ ] `User.role` field type updated from `String` to `UserRole`
- [ ] Migration runs successfully
- [ ] Existing users have correct roles assigned (at least one `super_admin`)
- [ ] Shared TypeScript types updated
- [ ] `prisma generate` produces correct client types
