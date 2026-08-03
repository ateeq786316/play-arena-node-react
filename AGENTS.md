# play-arena-node-react Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-07-31

## Active Technologies

- JavaScript (ESM) for backend; TypeScript 5.x for frontend + Express 5, Prisma 7 with `@prisma/adapter-pg`, `pg` (backend); Next.js 16, React 19, Zustand 5, Tailwind v4, react-hook-form (frontend). NEW: `node-cron` (backend aggregation job), `recharts` (frontend charts) (005-saas-subscription-analytics)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

JavaScript (ESM) for backend; TypeScript 5.x for frontend: Follow standard conventions

## Recent Changes

- **2026-08-03 — Frontend ↔ Backend Integration Fixes:** Fixed upload route shadowing (`/:type` was catching all specific upload routes — reordered so `/avatar`, `/tournament-poster`, `/ground-image/:groundId`, `/booking-proof/:groundId` come before `/:type`). Fixed finance admin endpoint 401 (replaced hardcoded `userId === "admin-placeholder"` check with `requireAdmin` middleware on route). Added `requireAdmin` middleware to dispute `/all` and `/:id/resolve` routes. Fixed React anti-pattern in `disputes/new/page.tsx` (useState→useEffect). Added 3 new tests (296 total, all passing). Updated CHANGES.md, TESTING.md, Postman collection. See `gaps-need-to-fixed.md` for full gap analysis.
- 005-saas-subscription-analytics (US1–US5 + T052–T056 complete): subscription lifecycle backend (upgrade→`pending_payment`+unpaid invoice→admin confirm-payment at `POST /api/admin/subscriptions/:id/confirm-payment`, downgrade immediate, cancel keeps period end), admin expiring list `GET /api/admin/subscriptions/expiring`, `requireAdmin` middleware, `FORBIDDEN` error class, express-validator on mutation routes, `requirePlan` feature gate (accepts active/trial) on analytics routes; frontend `PlanComparisonTable` + upgrade/downgrade UI w/ retention-warning dialog + pending_payment banner; platform analytics `GET /api/analytics/platform/{summary,expiring,trends}` + admin dashboard page; all pre-existing frontend lint errors fixed (chat/[id] socket→ref, crm/pricing load-pattern, reset-password init-state, disputes typing). Manual E2E verified live (backend `npm start` on :3000 vs seeded Postgres): register→OTP→Free→upgrade→pending_payment→admin confirm→active→ground+court+bookings→aggregateDay(yesterday)→dashboard/heatmap/report CSV→retention clamp (Professional 365d vs Free 7d w/ notice)→platform summary/trends/expiring, 403s for non-admin. T053 uncovered+fixed timezone bug: `@db.Date` compares by UTC date component, but `aggregateDay`/`_clampWindow` built local-midnight Dates → off-by-one on non-UTC server; added `_utcMidnight` normalizer + snapshot `totalRevenue` now sums `bookingRevenue` (falls back to totalAmount when no finance) instead of online+offline only. Backend 293/293, frontend 21/21, lint 0 errors, tsc clean, production build passes.
- 006-e2e-user-journey-tests (NEW, spec-phase): full E2E user-journey test specification in `docs/specs/006-e2e-user-journey-tests/` (`spec.md` with 11 journeys J1–J11 mapping UI → API → DB persistence, `tasks.md`, `plan.md`). Built from a full route inventory (173 routes, all 19 modules) + full frontend page/API audit. HARD CONSTRAINT: tests must NEVER delete/truncate/wipe seed data or test-generated state — fixed namespaced identities make runs idempotent, only app-native soft transitions (cancel/withdraw/dismiss) may close out state, and a preservation-check runs before/after every journey (3 seeded plans, 4 settings). Documents known gaps to assert: `pendingEmail` localStorage never written by frontend, bracket returns bare array, `PricePreview`/`NearbySearchResponse` return direct objects, `/api/disputes/all`+resolve have no role gate, `/api/matches/[id]` is really a teamId, upload `/:type` shadows avatar/tournament-poster handlers, `/api/finance/admin/finance` always 401s.
- 003-saas-subs-analytics-crm (all 64 tasks checked, remaining frontend gaps now complete): T408 price preview in booking flow — `app/(dashboard)/grounds/[id]/page.tsx` has court cards + "Book a Court" form (court/date/start/end/coupon) calling `GET /api/pricing/preview` (returns `PricePreview {basePrice,multiplier,finalPrice,source}` object directly, no wrapper) + `POST /api/pricing/coupon/validate` (`{code,bookingAmount}` → `{valid,coupon,discount,finalAmount}`). T507 dispute detail `app/(dashboard)/disputes/[id]/page.tsx`: status badge, reason/description/filed/bookingId, evidence list, resolve form w/ action buttons (`resolved`/`no_show_penalty`/`dismissed`) → `PATCH /api/disputes/:id/resolve` `{resolution,action}` (service matches: `no_show_penalty` creates 500 no-show penalty; note repo always sets status `resolved`). T508 admin queue `app/(dashboard)/admin/disputes/page.tsx`: filters `GET /api/disputes/all?status=` by pending/under_review/resolved/dismissed, cards link to `/disputes/[id]`; linked from admin dashboard. T605–608 geo frontend: installed `leaflet@1.9.4` + `react-leaflet@5` + `@types/leaflet` in web package; `components/domain/geo/NearMeMap.tsx` (dynamic import `ssr:false` wrapper) → `NearMeMapImpl.tsx` (react-leaflet `MapContainer`+`TileLayer` OSM + `Marker`/`Popup` with fixed default `L.icon` since leaflet assets aren't bundled); home page has 📍 Near Me button (`navigator.geolocation` → `GET /api/geo/nearby?latitude&longitude&radius=10`, response `{grounds (w/ distance_km + courts), pagination, center}`) + 72-height map + "Clear" to restore `/api/grounds/featured`; distance chip rendered via `(ground as NearbySearchResponse["grounds"][number]).distance_km` cast. Shared types added: `PricePreview`, `CouponValidation`, `NearbyGround`, `NearbySearchResponse`, `Dispute.filedBy`. House lint rule `react-hooks/set-state-in-effect`: do NOT call setState synchronously in effect body — route through `.then/.catch` or event handlers; don't add `mounted` guards to components already loaded via `dynamic(...,{ssr:false})`. Backend 293/293, frontend 21/21, lint 0 errors, tsc clean, web `npm run build` passes.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
