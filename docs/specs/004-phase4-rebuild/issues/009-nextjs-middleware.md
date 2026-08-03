# 009 — Next.js Middleware

**Type:** AFK | **Blocked by:** 006

## What to build

Create `packages/web/src/middleware.ts` (Next.js will auto-detect this at the root of the web package). The middleware reads the `accessToken` cookie and decodes it to get the user's role. It maintains a route allowlist per role:
- **Public routes** (no auth needed): `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-otp`, `/grounds` (public), `/api/*` (proxy to backend)
- **Player routes**: all public + `/home`, `/bookings*`, `/teams*`, `/matches*`, `/tournaments*`, `/leaderboard`, `/chat*`, `/notifications`, `/profile`, `/ratings`
- **Owner routes**: all public + `/home`, `/grounds*`, `/finance`, `/bookings*`, `/subscriptions*`, `/analytics`, `/crm`, `/pricing`, `/disputes`, `/profile`, `/notifications`
- **Staff routes**: all public + `/ops`, `/profile`
- **Admin routes**: all public + `/admin*`, `/profile`
- **Super Admin routes**: all public + `/admin*`, `/profile`

If unauthenticated user hits a protected route → redirect to `/login?redirect=...`. If authenticated user hits a route they don't have role for → redirect to their role's home page.

## Acceptance criteria

- [ ] `middleware.ts` created and auto-loaded by Next.js
- [ ] Unauthenticated users redirected to login with redirect param
- [ ] Players can only access player routes
- [ ] Owners can only access owner routes
- [ ] Staff can only access staff routes
- [ ] Admin/Super Admin can only access admin routes
- [ ] Invalid/expired tokens handled gracefully (redirect to login)
- [ ] Public routes always accessible without token
