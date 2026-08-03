# 007 — RBAC Middleware

**Type:** AFK | **Blocked by:** 006

## What to build

Create `src/middlewares/rbac.middleware.js` with `requireRole(...roles)` that reads `req.userId`, fetches user's role from DB (or caches in `req.user` via auth middleware), and returns 403 if the user's role is not in the allowed list. Also create `requireAdmin()` as shorthand for `requireRole("admin", "super_admin")` and `requireSuperAdmin()` for `requireRole("super_admin")`.

Update all route files to use the new middleware:
- Admin routes (`admin.route.js`) → `requireAdmin()`
- Super Admin-only routes → `requireSuperAdmin()`
- Ground creation (`ground.route.js` `POST /`) → `requireRole("owner", "admin", "super_admin")`
- Ground management (update/delete) → keep existing `checkOwnerAccess` at service level
- Staff/manager routes → keep existing GroundAccess checks

Update `authMiddleware` to also fetch and attach `req.user` with `id` and `role` to avoid duplicate queries.

Write tests: each `requireRole` combination returns correct HTTP status for each UserRole value (200 for allowed, 403 for denied).

## Acceptance criteria

- [ ] `rbac.middleware.js` created with `requireRole()`, `requireAdmin()`, `requireSuperAdmin()`
- [ ] Auth middleware attaches `req.user` with `id` and `role`
- [ ] All admin routes are protected by `requireAdmin()`
- [ ] All super admin routes are protected by `requireSuperAdmin()`
- [ ] Ground creation route requires `owner` | `admin` | `super_admin`
- [ ] Every protected route returns 403 with proper error message when unauthorized
- [ ] Tests pass for all role/permission combinations
