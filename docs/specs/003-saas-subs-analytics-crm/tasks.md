# Tasks: SaaS Monetization & Business Tools

**Input**: Design documents from `/specs/003-saas-subs-analytics-crm/`
**Prerequisites**: plan.md, spec.md

---

## Phase 0: Schema & Foundation (Shared Infrastructure)

- [x] T001 Add 18 new Prisma models to `playarena-backend/prisma/schema.prisma`
- [x] T002 [P] Create feature-flag middleware in `playarena-backend/src/middlewares/plan.middleware.js`
- [x] T003 [P] Add SaaS nav items to frontend sidebar in `packages/web/src/components/layout/sidebar.tsx`
- [x] T004 [P] Add 18 new TypeScript interfaces to `packages/shared/src/types/index.ts`
- [x] T005 Generate and apply Prisma migrations for 6 new modules

---

## Phase 1: User Story 1 — Subscription Plans (Priority: P1)

**Goal**: Ground owners can view, select, upgrade/downgrade, and cancel subscription plans

**Independent Test**: Create ground owner → view plans → upgrade to Starter → verify plan limits apply

### Backend
- [x] T101 [P] [US1] Create `SubscriptionPlan`, `GroundOwnerSubscription`, `Invoice` Prisma models with enums
- [x] T102 [P] [US1] Create `subscription.repo.js` — CRUD for plans, find by owner, update subscription status
- [x] T103 [US1] Create `subscription.service.js` — upgrade/downgrade logic, plan limit enforcement, auto-renew/cancel
- [x] T104 [US1] Create `subscription.controller.js` + `subscription.route.js` — plan listing, my subscription, upgrade, cancel
- [x] T105 [US1] Apply feature-flag middleware to analytics/CRM/pricing routes based on plan

### Frontend
- [x] T106 [US1] Build `/subscriptions` page — plan comparison table (Free/Starter/Professional)
- [x] T107 [US1] Build `/subscriptions/my` — current plan, usage stats, period end, change/cancel actions
- [x] T108 [US1] Build `/subscriptions/billing` — invoice history list with download
- [x] T109 [US1] Add subscription API calls to `packages/shared/src/api/index.ts`

**Checkpoint**: Subscription flow works end-to-end — plans visible, upgrade applies, limits enforced

---

## Phase 2: User Story 2 — Analytics Dashboards (Priority: P1)

**Goal**: Ground owners see revenue trends, utilization heatmaps, booking analytics, and download reports

**Independent Test**: Generate bookings → open analytics → verify charts show correct data

### Backend
- [x] T201 [P] [US2] Create `AnalyticsSnapshot`, `DailyAggregation` Prisma models
- [x] T202 [P] [US2] Create `analytics.repo.js` — aggregate queries, snapshot read/write
- [x] T203 [US2] Create `analytics.service.js` — compute daily aggregates, revenue by period, utilization calculation, booking trends
- [x] T204 [US2] Create `analytics.controller.js` + `analytics.route.js` — dashboard, heatmap, reports download

### Frontend
- [x] T205 [US2] Build `/analytics` page — revenue chart (Recharts), booking count, KPI cards
- [x] T206 [US2] Build utilization heatmap component (court × time-of-week grid)
- [x] T207 [US2] Add date range filter and CSV report download
- [x] T208 [US2] Add analytics API calls to shared package

**Checkpoint**: Analytics dashboard renders real data with charts, filters, and download

---

## Phase 3: User Story 3 — CRM Broadcasts (Priority: P2)

**Goal**: Ground owners send promotional messages and track delivery

**Independent Test**: Create broadcast → send → verify delivery status in broadcast analytics

### Backend
- [x] T301 [P] [US3] Create `BroadcastMessage`, `CommunicationLog`, `UserCommunicationPreference` Prisma models
- [x] T302 [P] [US3] Create `crm.repo.js`
- [x] T303 [US3] Create `crm.service.js` — message queuing, delivery tracking, preference filter
- [x] T304 [US3] Create `crm.controller.js` + `crm.route.js` — CRUD broadcasts, templates, toggle campaigns

### Frontend
- [x] T305 [US3] Build `/crm` page — broadcast list with status, sent date
- [x] T306 [US3] Build broadcast composer — message text, audience filter, schedule, send
- [x] T307 [US3] Build broadcast analytics — delivery rate, open rate
- [x] T308 [US3] Add CRM API calls to shared package

**Checkpoint**: Broadcast can be created, sent, and delivery tracked

---

## Phase 4: User Story 4 — Dynamic Pricing (Priority: P2)

**Goal**: Ground owners set automatic price rules and coupon codes

**Independent Test**: Create weekend pricing rule → check price preview → confirm multiplier applied

### Backend
- [x] T401 [P] [US4] Create `PricingRule`, `HolidayPricing`, `Coupon`, `CouponUsage` Prisma models
- [x] T402 [P] [US4] Create `pricing.repo.js`
- [x] T403 [US4] Create `pricing.service.js` — rule engine (priority resolution), holiday overrides, coupon validation
- [x] T404 [US4] Create `pricing.controller.js` + `pricing.route.js` — CRUD rules/holidays/coupons, validate coupon, price preview

### Frontend
- [x] T405 [US4] Build `/pricing` page — rules list with active/inactive toggle
- [x] T406 [US4] Build rule editor — day-of-week, time range, multiplier, priority
- [x] T407 [US4] Build `/pricing/coupons` — coupon list, create form (code, discount, max uses, expiry)
- [x] T408 [US4] Integrate price preview into court booking flow
- [x] T409 [US4] Add pricing API calls to shared package

**Checkpoint**: Pricing rules affect displayed prices; coupons can be created and validated

---

## Phase 5: User Story 5 — Dispute Resolution (Priority: P2)

**Goal**: Customers and owners file/resolve booking disputes; no-show penalties automated

**Independent Test**: File dispute for completed booking → add evidence → admin resolves → penalty applied

### Backend
- [x] T501 [P] [US5] Create `Dispute`, `DamageClaim`, `NoShowPenalty` Prisma models
- [x] T502 [P] [US5] Create `dispute.repo.js`
- [x] T503 [US5] Create `dispute.service.js` — dispute lifecycle, evidence handling, resolution logic, no-show detection
- [x] T504 [US5] Create `dispute.controller.js` + `dispute.route.js` — file, list, admin resolve, damage claim

### Frontend
- [x] T505 [US5] Build `/disputes` page — my disputes list with status
- [x] T506 [US5] Build dispute file form — select booking, reason, evidence upload
- [x] T507 [US5] Build dispute detail page — timeline, evidence, resolution
- [x] T508 [US5] Build admin moderation queue — pending disputes, resolve form
- [x] T509 [US5] Add dispute API calls to shared package

**Checkpoint**: Disputes can be filed, evidence attached, admin resolves, penalties applied

---

## Phase 6: User Story 6 — Geolocation Search (Priority: P3)

**Goal**: Players find grounds near a location

**Independent Test**: Search with lat/lng + radius → verify results within radius

### Backend
- [x] T601 [P] [US6] Extend Ground model with geo-indexed lat/lng (already exists — add index)
- [x] T602 [P] [US6] Create `geo.repo.js` — Haversine distance query or PostGIS
- [x] T603 [US6] Create `geo.service.js` — nearby search with radius, sport filter, distance sort
- [x] T604 [US6] Extend ground routes with `POST /api/grounds/nearby` endpoint

### Frontend
- [x] T605 [US6] Add Leaflet map component with OpenStreetMap tiles
- [x] T606 [US6] Integrate "Near Me" button + map view into home page
- [x] T607 [US6] Sync map markers with ground results list
- [x] T608 [US6] Add geo API calls to shared package

**Checkpoint**: Nearby search returns grounds within radius on map and list

---

## Phase 7: Integration Testing & Polish

- [x] T701 End-to-end subscription flow test
- [x] T702 Analytics data accuracy verification
- [x] T703 Broadcast delivery end-to-end test
- [x] T704 Dynamic pricing edge cases (overlapping rules, holiday override)
- [x] T705 Dispute resolution workflow test
- [x] T706 Geo-search accuracy verification
- [x] T707 Run all existing backend tests + new module tests
- [x] T708 Run frontend build

---

## Execution Order

1. **Phase 0** — Schema + foundation (blocks everything)
2. **Phase 1 (US1)** — Subscriptions (P1 — MUST ship first)
3. **Phase 2 (US2)** — Analytics (P1 — can proceed in parallel with US1 if staffed)
4. **Phase 3 (US3)** — CRM (P2 — starts after US1+US2)
5. **Phase 4 (US4)** — Dynamic Pricing (P2 — starts after US1+US2)
6. **Phase 5 (US5)** — Disputes (P2 — starts after US1+US2)
7. **Phase 6 (US6)** — Geolocation (P3 — lowest priority)
8. **Phase 7** — Integration + polish
