# Gaps to Fix — Frontend ↔ Backend Integration

> Status: Analysis Complete
> Last Updated: 2026-08-03

---

## ✅ Well-Connected Areas (Frontend properly calls backend APIs)

1. **Auth** — Login, signup, profile, logout all connected
2. **Grounds** — Browse, featured, detail, create all connected
3. **Bookings** — List, detail, create, cancel all connected
4. **Teams** — List, detail, create, members, challenges all connected
5. **Matches** — List, detail, start, score, cancel all connected
6. **Tournaments** — List, detail, create, register, withdraw, bracket all connected
7. **Analytics** — Dashboard, heatmap, report all connected
8. **Subscriptions** — Plans, my subscription, billing, upgrade/downgrade/cancel all connected
9. **Pricing** — Rules, coupons, preview, validate all connected
10. **Disputes** — List, detail, file, resolve all connected
11. **Chat** — Unread counts, messages, send via WebSocket all connected
12. **Notifications** — List, mark read all connected
13. **CRM** — Broadcasts, create, send all connected
14. **Geo** — Nearby search connected

---

## ⚠️ Type Mismatches & Data Shape Issues

### 1. Match API Response Shape
- **Frontend** (`matches/page.tsx`): Expects `/api/matches/${teamId}` → `{ matches: MatchWithTeams[] }` with `challenger` and `opponent` objects
- **Backend** (`match.controller.js`): Returns `{ matches }` with includes `{ challenger: { id, name }, opponent: { id, name } }`
- **Status**: ✅ Compatible — both sides match

### 2. Analytics Dashboard Response Shape
- **Frontend** (`analytics/page.tsx`): Expects `{ snapshots, revenue: { totalRevenue, totalBookings, avgBookingValue }, bookings: { total, completed, cancelled }, dataAsOf, retentionDays, retentionNotice }`
- **Backend** (`analytics.service.js`): Returns `{ snapshots, revenue, bookings, period, dataAsOf, retentionDays, retentionNotice }`
- **Status**: ✅ Compatible — `revenue` and `bookings` shapes match

### 3. Subscription Response Shape
- **Frontend** (`subscriptions/page.tsx`, `subscriptions/my/page.tsx`): Expects `MySubscriptionResponse` with `subscription`, `plan`, `usage`, `trial`
- **Backend** (`subscription.service.js`): Returns `{ subscription, plan, usage, trial }`
- **Status**: ✅ Compatible

### 4. Dispute `filedBy` Field
- **Frontend** (`admin/disputes/page.tsx`): Uses `"filedBy" in d && d.filedBy` with `{ name }`
- **Backend** (`dispute.repo.js`): `findAll` includes `filedBy: { id, name, email }`
- **Status**: ✅ Compatible

### 5. Pricing Preview Response
- **Frontend** (`grounds/[id]/page.tsx`): Expects `PricePreview { basePrice, multiplier, finalPrice, source }`
- **Backend** (`pricing.service.js`): Returns `{ basePrice, multiplier, finalPrice, source }`
- **Status**: ✅ Compatible

### 6. Coupon Validation Response
- **Frontend** (`grounds/[id]/page.tsx`): Expects `CouponValidation { valid, coupon, discount, finalAmount }`
- **Backend** (`pricing.service.js`): Returns `{ valid, coupon, discount, finalAmount }`
- **Status**: ✅ Compatible

### 7. Leaderboard Response
- **Frontend** (`leaderboard/page.tsx`): Expects `{ teams: LeaderboardTeam[] }`
- **Backend** (`rating.controller.js`): Returns `{ teams }`
- **Status**: ✅ Compatible

### 8. Regions Response
- **Frontend** (`grounds/page.tsx`, `teams/create/page.tsx`): Expects `{ regions: RegionWithCities[] }` where `RegionWithCities` has nested `cities`
- **Backend** (`ground.repo.js`): `findRegions` returns regions with nested `cities`
- **Status**: ✅ Compatible

---

## ⚠️ Missing Backend Endpoints

### 1. `/api/leaderboard` without sportId
- **Frontend** calls `/api/leaderboard` (no sport) and `/api/leaderboard/${sportFilter}`
- **Backend** has both routes ✓
- **Status**: ✅ Already exists

### 2. Admin Stats Summary Endpoint
- **Frontend** (`admin/page.tsx`): Needs endpoints for user count, ground count, booking count
- **Backend**: Only has `/api/admin/finance` (which always 401s)
- **Status**: ❌ Missing — needs new endpoint `/api/admin/stats` or similar

### 3. Ops Dashboard Data Endpoint
- **Frontend** (`ops/page.tsx`): Needs today's bookings, pending approvals, checked-in counts
- **Backend**: Has `/api/grounds/:groundId/bookings` but not aggregated stats
- **Status**: ❌ Missing — needs new endpoint or extend existing

---

## ⚠️ Missing Frontend Pages

All expected frontend pages exist. No missing pages found.

---

## ⚠️ Stub Pages (Need Real Implementation)

### 1. `/app/(dashboard)/ops/page.tsx` — STUB
- Shows hardcoded "0" values for:
  - Today's Bookings
  - Pending Approval
  - Checked In
- Only loads grounds list, no actual booking data
- **Fix needed**: Add API calls for today's booking stats per ground

### 2. `/app/(dashboard)/admin/page.tsx` — PARTIAL STUB
- Only fetches finance data from `/api/admin/finance` (which always 401s)
- Other stat cards are hardcoded "—":
  - Users count
  - Grounds count
  - Bookings count
- Links point to `/api/admin/${link}` as hrefs (API endpoints, not pages)
- **Fix needed**: Add API calls for user/ground/booking counts, fix links to point to actual admin pages

### 3. `/app/(dashboard)/notifications/page.tsx` — Connected but incomplete
- Missing delete functionality (endpoint exists at `/api/notifications/:id` DELETE)
- **Fix needed**: Add delete button/UI

### 4. `/app/(dashboard)/chat/page.tsx` — Connected but incomplete
- Only shows unread counts with ground ID, no ground names
- **Fix needed**: Enrich chat list with ground names

---

## ⚠️ Backend Issues

### 1. `/api/finance/admin/finance` — Always 401
- **Issue**: The route exists but always returns 401
- **Frontend** (`admin/page.tsx`): Calls this endpoint, fails silently
- **Fix needed**: Investigate and fix the auth check in `finance.controller.js` `getAdminFinance`

### 2. `/api/disputes/all` — No role gate
- **Issue**: Any authenticated user can access all disputes
- **Frontend** (`admin/disputes/page.tsx`): Calls this without admin check
- **Fix needed**: Add `requireAdmin` middleware to dispute routes

### 3. `/api/disputes/:id/resolve` — No role gate
- **Issue**: Any authenticated user can resolve disputes
- **Frontend** (`disputes/[id]/page.tsx`): Calls this without admin check
- **Fix needed**: Add `requireAdmin` middleware to resolve endpoint

### 4. Upload `/:type` route shadowing
- **Issue**: `/api/upload/:type` is registered before `/api/upload/avatar` and `/api/upload/tournament-poster`
- **Fix needed**: Reorder routes so specific handlers come before the generic `/:type`

### 5. `/api/matches/[id]` takes teamId not matchId
- **Issue**: The route `/api/matches/:teamId` lists matches for a team, not a match by ID
- **Frontend**: Correctly uses `/api/matches/${teamId}` ✓
- **Status**: ✅ Working as designed (just confusing naming)

---

## ⚠️ Frontend Issues

### 1. `disputes/new/page.tsx` — React Anti-Pattern
- **Issue**: Uses `useState(() => { api.get(...) })` for data loading (runs during render)
- **Line 19**: `useState(() => { api.get<{ bookings: Booking[] }>("/api/bookings/my")... })`
- **Fix needed**: Move to `useEffect` with proper loading state

### 2. `disputes/[id]/page.tsx` — Uses alert() for errors
- **Issue**: Uses `alert()` for error messages instead of toast notifications
- **Lines 37, 43**: `alert(...)` instead of proper toast
- **Fix needed**: Replace with `useToast` pattern used elsewhere

### 3. `chat/[id]/page.tsx` — Fragile cookie parsing
- **Issue**: Socket auth uses `document.cookie.replace(/(?:(?:^|.*;\s*)accessToken\s*=\s*([^;]*).*$)|^.*$/, "$1")`
- **Fix needed**: Use a proper cookie parsing utility

### 4. `admin/page.tsx` — Links point to API endpoints
- **Issue**: Links use `href={`/api/admin/${link}`}` which are API endpoints, not pages
- **Lines 48-56**: Should link to actual admin UI pages
- **Fix needed**: Create admin sub-pages or fix hrefs

### 5. `profile/page.tsx` — No user refresh after update
- **Issue**: After profile update, the user state isn't refreshed
- **Fix needed**: Call `refreshUser()` after successful profile update

### 6. `bookings/[id]/page.tsx` — Missing `formatRelativeTime` import
- **Issue**: Line 14 imports `formatRelativeTime` — actually it IS imported ✓
- **Status**: ✅ No issue

---

## Priority Fix List

### High Priority (Breaks functionality)
1. Fix upload route ordering (shadowing)
2. Fix `/api/finance/admin/finance` 401 error
3. Add role gates to dispute endpoints
4. Fix `disputes/new/page.tsx` React anti-pattern

### Medium Priority (UX/Completeness)
5. Complete `ops/page.tsx` with real data
6. Complete `admin/page.tsx` with real stats
7. Fix `admin/page.tsx` links to point to pages
8. Replace `alert()` in `disputes/[id]/page.tsx` with toast
9. Fix `chat/[id]/page.tsx` cookie parsing
10. Add delete functionality to `notifications/page.tsx`
11. Enrich `chat/page.tsx` with ground names
12. Add `refreshUser()` to `profile/page.tsx`

### Low Priority (Polish)
13. Add admin stats endpoint
14. Add ops dashboard data endpoint
