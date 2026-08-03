# PRD: PlayArena — Phase 4 Complete Rebuild

> **Status:** Draft  
> **Date:** 2026-07-31  
> **Spec Source:** `docs/vision/complete-project-spec.md`  

---

## Problem Statement

PlayArena was built across three rapid phases — 19 backend modules, 48 Prisma models, 36 frontend routes — but the platform has critical gaps that make it unusable in production:

1. **Role & access control is broken.** The `User.role` field is an untyped string with only `"player"` and `"super_admin"` recognized on the backend. The frontend checks for `"admin"` and `"owner"` — roles that don't exist on the backend. Any authenticated user can create a ground, access any route by URL, and see UI elements meant for other roles.

2. **No ground verification workflow.** Grounds are created with `isVerified: false` but there's no approval queue, no rejection reason, no resubmit flow, and no notification to the owner. Non-verified grounds are visible in search results.

3. **No role-specific experiences.** All roles see the same generic home page. No dashboard for owners, no staff check-in interface, no admin verification queue.

4. **Missing design system.** Emoji icons, wrong fonts, light sidebar, inconsistent spacing, no animation library, no toast system, no empty states, no error boundaries.

5. **No subscription enforcement.** Free tier limits are not applied. Owners can create unlimited grounds without subscribing.

6. **No cron jobs.** Bookings are never auto-cancelled, subscriptions never expire, analytics are never aggregated.

This Phase 4 rebuild addresses all of these gaps holistically — transforming PlayArena from a feature-complete prototype into a production-ready global sports platform.

---

## Solution

A complete rebuild across 5 phases that delivers:

1. **Proper RBAC** — Prisma `UserRole` enum, centralized middleware, role-gated routes and UI
2. **Ground verification workflow** — pending/approved/rejected states, admin queue, owner notifications
3. **Role-specific dashboards** — tailored home pages for Player, Owner, Staff, Admin, Super Admin
4. **Full design system** — tokens, component library, Lucide icons, framer-motion, dark sidebar
5. **Subscription plan enforcement** — plan CRUD by Super Admin, limit checking on ground creation
6. **Background jobs** — 11 cron tasks for booking lifecycle, subscription expiry, analytics aggregation
7. **Admin & Super Admin portals** — 25 modules for complete platform management
8. **Owner ground management portal** — 17 page types covering every aspect of venue operations

---

## User Stories

### Role & Access Control

1. As a **Super Admin**, I want to assign any user to any role, so that I can manage the platform staffing.
2. As an **Admin**, I want to access operational tools (verification queue, complaints), so that I can manage daily platform operations without system-level access.
3. As an **Owner**, I want to only see ground management features, so that I am not distracted by player-focused features.
4. As a **Player**, I want to only see booking and team features, so that I am not confused by ground management tools.
5. As a **Manager**, I want to log in with my own credentials and see the grounds I manage, so that I can perform my duties without using the Owner's account.
6. As a **Staff**, I want to log in and see a simple check-in interface, so that I can focus on my shift tasks.
7. As a **Player**, I want to create and join multiple teams across different sports, so that I can compete with different groups.
8. As a **Captain**, I want to manage my team roster and promote members to Vice-Captain, so that I can delegate team management.
9. As an **Owner**, I want to create Manager and Staff accounts with specific permissions, so that I can delegate ground operations securely.
10. As any user, I want routes I don't have access to return a proper "Access Denied" or redirect, so that I am not confused by broken pages.

### Ground Verification

11. As an **Owner**, I want to submit my ground for verification after creating it, so that it can be reviewed by an Admin.
12. As an **Owner**, I want to see my ground's verification status (Pending/Approved/Rejected), so that I know where I stand.
13. As an **Owner**, I want to receive a reason when my ground is rejected, so that I can fix the issues and resubmit.
14. As an **Owner**, I want to edit and resubmit my ground after rejection, so that I don't have to create from scratch.
15. As an **Admin**, I want to see all pending grounds in a queue sorted by oldest first, so that I can process them efficiently.
16. As an **Admin**, I want to approve or reject a ground with a reason, so that owners know what to fix.
17. As an **Admin**, I want to suspend an active ground, so that I can handle policy violations.
18. As a **Player**, I want to only see verified grounds when searching, so that I trust the listings.
19. As an **Owner**, I want to be notified when my ground is verified or rejected, so that I can take action.

### Subscriptions & Free Trial

20. As a **Super Admin**, I want to create, edit, and delete subscription plans dynamically, so that I can adjust pricing without code changes.
21. As a **Super Admin**, I want to set the free trial duration, so that I can control the onboarding experience.
22. As a **Super Admin**, I want to override trial length for specific owners, so that I can handle special cases.
23. As an **Owner**, I want to see my current plan and usage (grounds used vs allowed), so that I know when to upgrade.
24. As an **Owner**, I want to upgrade or downgrade my plan, so that I can match my needs.
25. As an **Owner**, I want to see my subscription status and renewal date, so that I never get unexpectedly suspended.
26. As an **Owner**, I want to receive reminders before my subscription expires, so that I can renew on time.
27. As a **New Owner**, I want a free trial period so that I can explore the platform before paying.
28. As a **System**, I want to automatically suspend owners whose trial or subscription has expired, so that unpaid accounts don't continue operating.

### Owner Ground Management

29. As an **Owner**, I want a dashboard showing today's bookings, revenue, utilization, and active staff, so that I can monitor my ground at a glance.
30. As an **Owner**, I want to manage courts (add/edit/delete), so that I can keep my venue listing accurate.
31. As an **Owner**, I want to set operating hours per day of the week, so that players know when they can book.
32. As an **Owner**, I want to create dynamic pricing rules (peak/off-peak, holidays), so that I can maximize revenue.
33. As an **Owner**, I want to create coupons for promotions, so that I can attract more players.
34. As an **Owner**, I want to upload and manage ground images, so that players can see the venue before booking.
35. As an **Owner**, I want to configure ground settings (deposit, cancellation, advance booking, etc.), so that I control the booking experience.
36. As an **Owner**, I want to view a calendar of all bookings across all courts, so that I can see availability at a glance.
37. As an **Owner**, I want to create bookings manually (walk-in), so that I can accommodate players without online booking.
38. As an **Owner**, I want to see finance reports (revenue by method, cash sessions, commission), so that I can track my money.
39. As an **Owner**, I want to see analytics (utilization rate, popular sports, peak hours, repeat customers), so that I can make data-driven decisions.
40. As an **Owner**, I want to invite and manage staff with granular permissions, so that I can delegate operations securely.
41. As an **Owner**, I want to send broadcast messages (notifications/emails) to past customers, so that I can promote offers.
42. As an **Owner**, I want to see an activity log of all changes at my ground, so that I can audit staff actions.
43. As an **Owner**, I want a QR code for my ground that players can scan, so that they can easily find my listing.

### Player Experience

44. As a **Visitor**, I want to browse grounds by sport, city, and date without signing up, so that I can explore before committing.
45. As a **Visitor**, I want to see a map view of grounds with pins, so that I can find venues near me.
46. As a **Player**, I want to search grounds by name, sport, city, date, and amenities, so that I find exactly what I need.
47. As a **Player**, I want to see ground details including images, courts, pricing, and availability, so that I can choose a venue.
48. As a **Player**, I want to see an availability calendar showing which slots are free/busy, so that I can pick a time.
49. As a **Player**, I want to book a court for a specific date and time, so that I secure my slot.
50. As a **Player**, I want to pay online or choose "Pay at Venue", so that I have payment flexibility.
51. As a **Player**, I want to see my upcoming and past bookings, so that I can manage my schedule.
52. As a **Player**, I want to cancel a booking within the policy window, so that I don't lose money if plans change.
53. As a **Player**, I want a QR code for my booking, so that check-in at the venue is quick.
54. As a **Player**, I want to create and manage teams, so that I can compete with friends.
55. As a **Player**, I want to receive and respond to team invites, so that I can join teams.
56. As a **Player**, I want to challenge other teams to matches, so that I can compete.
57. As a **Player**, I want to view match history and my team's ELO rating, so that I can track performance.
58. As a **Player**, I want to browse and join tournaments, so that I can compete at a higher level.
59. As a **Player**, I want to see the leaderboard by sport, so that I can compare rankings.
60. As a **Player**, I want to rate matches and review grounds, so that I can share feedback.
61. As a **Player**, I want to chat with my team members, so that we can coordinate matches.

### Staff Operations

62. As a **Staff**, I want to see today's bookings when I log in, so that I know what to expect.
63. As a **Staff**, I want to check in players when they arrive, so that the system knows they showed up.
64. As a **Staff**, I want to create walk-in bookings, so that I can serve players who arrive without booking.
65. As a **Staff**, I want to record payments (cash, JazzCash, Easypaisa, bank transfer), so that all revenue is tracked.
66. As a **Staff**, I want to open a cash session at the start of my shift, so that the cash drawer is tracked.
67. As a **Staff**, I want to close the cash session at the end of my shift, so that variance is calculated.
68. As a **Staff**, I want to mark players as no-show if they don't arrive, so that the slot can be released.

### Admin Portal

69. As an **Admin**, I want a dashboard showing platform KPIs, so that I can monitor health at a glance.
70. As an **Admin**, I want to manage users (view, suspend, reset password), so that I can handle support requests.
71. As an **Admin**, I want to view and manage all grounds across the platform, so that I can moderate content.
72. As an **Admin**, I want to view and manage all bookings, so that I can resolve customer issues.
73. As an **Admin**, I want to view and manage complaints with a resolution workflow, so that disputes are handled fairly.
74. As an **Admin**, I want to manage teams and tournaments, so that inappropriate content is moderated.
75. As an **Admin**, I want to send platform-wide broadcasts, so that I can communicate with users.
76. As an **Admin**, I want to view finance reports, so that I can understand platform revenue.

### Super Admin Portal

77. As a **Super Admin**, I want to do everything an Admin can do, so that I can fill in when needed.
78. As a **Super Admin**, I want to promote/demote admins, so that I can manage the team.
79. As a **Super Admin**, I want to create and edit subscription plans, so that I can adjust pricing.
80. As a **Super Admin**, I want to manage all owner subscriptions, so that I can handle billing issues.
81. As a **Super Admin**, I want to configure platform settings (rate limits, OTP expiry, etc.), so that the platform is tuned.
82. As a **Super Admin**, I want to view audit logs, so that I can track who did what.
83. As a **Super Admin**, I want to manage regions, cities, sports, and payment methods, so that the platform catalog is accurate.
84. As a **Super Admin**, I want to view system health and trigger cron jobs manually, so that I can troubleshoot issues.
85. As a **Super Admin**, I want to export data as CSV/JSON, so that I can run external analysis.

### Finance & Cash

86. As an **Owner**, I want staff to track cash in a session-based system, so that I can reconcile daily revenue.
87. As an **Owner**, I want to see variance reports when staff close cash sessions, so that I can identify discrepancies.
88. As an **Owner**, I want to see revenue broken down by payment method, so that I understand payment preferences.
89. As a **Staff**, I want to log each payment with method and reference, so that the audit trail is complete.

### Notifications & Communication

90. As any user, I want to receive in-app notifications for relevant events, so that I stay informed.
91. As any user, I want a notification bell with unread count, so that I know when something happens.
92. As any user, I want to mark notifications as read, so that I can manage my attention.
93. As an **Owner**, I want to receive email for critical events (ground verification, subscription expiry), so that I don't miss important updates.
94. As a **Player**, I want booking reminders via notification, so that I don't forget my slot.

### Internationalization

95. As a **Pakistani user**, I want to use the platform in Urdu, so that I'm more comfortable.
96. As a **UAE user**, I want to use the platform in Arabic, so that I'm more comfortable.
97. As any user, I want to switch the language in settings, so that I can use my preferred language.
98. As an **Urdu/Arabic user**, I want the UI to support RTL layout, so that text displays correctly.
99. As any user, I want prices displayed in my local currency, so that I understand costs.

### Search & Discovery

100. As any user, I want to see grounds from my country by default, so that I find relevant results.
101. As any user, I want to filter grounds by sport, city, date, and price, so that I narrow down choices.
102. As any user, I want to switch countries to browse other markets, so that I can plan trips.
103. As any user, I want to see grounds on a map, so that I can find venues near me.

### Tournaments

104. As an **Owner**, I want to create a tournament at my ground, so that I can host events.
105. As a **Creator**, I want to pay a listing fee to make my tournament visible, so that only serious tournaments appear.
106. As a **Super Admin**, I want to confirm tournament payment before listing, so that fees are collected.
107. As a **Player**, I want to register my team for a tournament, so that we can compete.
108. As a **Creator**, I want to view and edit the tournament bracket, so that I can manage the event.
109. As a **Creator**, I want to mark match winners, so that the tournament progresses.

### Mobile

110. As a **Player**, I want to use PlayArena on my phone with a native feel, so that I can book on the go.
111. As an **Owner**, I want to manage my ground from my phone with a simplified interface, so that I can respond quickly.
112. As a **Staff**, I want to check in players and log payments from my phone, so that I can move around the venue.

---

## Implementation Decisions

### Module 1: RBAC System (Backend)

**New Prisma Enum:**
```prisma
enum UserRole {
  super_admin
  admin
  owner
  manager
  staff
  player
}
```

**Schema change:** `User.role String @default("player")` → `User.role UserRole @default(player)`

**New middleware:** `src/middlewares/rbac.middleware.js` — `requireRole(...roles)` decorator that reads `req.user.role` and returns 403 if unauthorized. Applied at route level.

**Route-level application:** Every route currently using `authMiddleware` gets additional `requireRole()` as needed:
- Ground creation routes → require `owner` | `admin` | `super_admin`
- Admin routes → require `admin` | `super_admin`
- Super Admin routes → require `super_admin`
- Staff operation routes → require `manager` | `staff` | `owner`

### Module 2: Player vs Owner Account Separation

**Signup endpoint** modified: accepts `role` field (`player` | `owner`). If `owner`, account is created with `role: owner`. If `player`, `role: player`.

**Email uniqueness** remains per-record (two accounts same email allowed since they have different roles? No — user decided **different emails required**). So unique constraint on `email` stays.

### Module 3: Ground Verification Workflow

**New Prisma Enum:**
```prisma
enum GroundVerificationStatus {
  pending
  approved
  rejected
}
```

**Schema changes to `Ground`:**
- Replace `isVerified Boolean @default(false)` with `verificationStatus GroundVerificationStatus @default(pending)`
- Add `verificationNote String?`
- Add `verifiedAt DateTime?`
- Add `verifiedById String? @db.Uuid`

**New endpoints:**
- `GET /api/admin/grounds/pending` — verification queue
- `PATCH /api/admin/grounds/:id/verify` — approve
- `PATCH /api/admin/grounds/:id/reject` — reject with reason
- `POST /api/grounds/:id/resubmit` — owner resubmits

**Ground visibility logic:** `listGrounds()` for public filters on `verificationStatus: "approved"`.

### Module 4: Subscription Plan CRUD

**Schema** already has `SubscriptionPlan` and `GroundOwnerSubscription`. No schema changes.

**New endpoints:**
- `GET /api/admin/plans` — list all plans
- `POST /api/admin/plans` — create plan
- `PATCH /api/admin/plans/:id` — update plan
- `DELETE /api/admin/plans/:id` — delete plan (soft: `isActive: false`)

**Subscription enforcement in ground creation:**
- `GroundService.createGround()` checks `limitByPlan("maxGrounds")` for the owner's active plan
- Returns 403 if limit exceeded

### Module 5: Trial Settings

**New model or KV config:** Add `PlatformSetting` model or use existing config pattern:
```prisma
model PlatformSetting {
  key   String @id
  value String
}
```
Seed with: `trial_enabled = "true"`, `trial_duration_days = "14"`

### Module 6: Cash Session Enhancement

No schema changes needed — `CashSession` model already has `openingCash`, `closingCash`, `expectedCash`, `variance`. Add:
- Variance auto-calculation in close session endpoint
- Variance threshold configuration (global + per-ground)
- Flagging logic for high variances
- Notification trigger on variance flag

### Module 7: Admin Portal Expansion

**Existing backend:** 9 admin endpoints. Needs expansion to ~50+ endpoints covering all modules listed in the spec.

**Frontend:** Complete rebuild from current broken `/admin` page to full admin portal with:
- Layout with sidebar navigation organized by category (Management, Finance, Config, System)
- Data tables with sort/filter/paginate on every list
- Detail pages for every entity
- Action modals for all mutations
- Charts on dashboard

### Module 8: Owner Ground Management Portal

**Backend:** Most ground management endpoints already exist. Need:
- Activity log endpoints
- QR code generation
- Broadcast send endpoints
- Expanded analytics endpoints

**Frontend:** Full 17-page portal under `/grounds/:id/*` route namespace. Reusable components: `GroundLayout`, `GroundSidebar`, `StatCard`, `BookingCalendar`, `DataTable`, `PricingRuleEditor`, `ScheduleGrid`.

### Module 9: Search & Discovery

**Backend:** Add full-text search endpoint `GET /api/grounds/search?q=...&sport=...&city=...&date=...`. PostgreSQL `tsvector` index on ground name, address, description.

**Frontend:** Search page with filter sidebar, result grid, map toggle. Map view using Leaflet (free, no API key) or Mapbox (limited free tier).

### Module 10: Player Dashboard Redesign

**Backend:** Most player endpoints exist. Need: booking reminders, personalized recommendations.

**Frontend:** Rebuild `/home` as role-aware dashboard. Player sees: upcoming bookings, recommended grounds, team invites, match requests, quick stats.

### Module 11: Staff Dashboard

**Backend:** Most endpoints exist. Add: cash session lifecycle endpoints (open/close/report).

**Frontend:** New `/ops` route that shows today's bookings, check-in buttons, walk-in creation form, cash session controls.

### Module 12: Tournament Listing Fee

**Backend:** Add `listingFee` field to `PlatformSetting`, payment confirmation endpoint, status flow.

**Schema change to `Tournament`:** Add `listingStatus` enum (`draft`, `pending_payment`, `listed`, `cancelled`).

### Module 13: Notification Enhancement

**Backend:** Most notification infrastructure exists (model, Socket.IO namespace). Need:
- Notification preference model reads
- Grouping logic (same-type notifications collapsed)
- Email sending via Resend for critical notifications
- Unread count endpoint

### Module 14: Internationalization

**Infrastructure:** `next-intl` setup, JSON translation files, RTL CSS, locale-aware formatting.
**Not a backend change** — purely frontend.

### Module 15: File Uploads

**Provider:** Cloudinary. Replace current S3 presigned URL approach with Cloudinary upload API.

### Module 16: Cron Jobs

**Infrastructure:** `node-cron` running inside Express. Create `src/cron/index.js` that registers all 11 jobs on server start.

### Module 17: Design System

**Frontend-only:**
- Tailwind config with custom tokens matching Emerald/Indigo/Amber palette
- Bebas Neue + DM Sans font setup
- Lucide React icon replacement
- Component library: Button, Input, Card, Badge, Modal, Toast, Skeleton, EmptyState, ErrorBoundary, DataTable, Pagination, Tabs, DropdownMenu, Avatar
- framer-motion integration with animation constants
- Dark sidebar component
- PageTransition wrapper

### Module 18: Public Website

**Frontend routes** (no auth required):
`/`, `/features`, `/pricing`, `/for-players`, `/for-owners`, `/grounds`, `/cities/[slug]`, `/about`, `/contact`, `/faq`, `/terms`, `/privacy`

### Module 19: Mobile App (Future)

**Not built in this phase.** Spec captured. Technologies: React Native, Expo Go, connects to same Express API.

---

## Testing Decisions

### Testing Philosophy

Test external behavior, not implementation details. For the backend, this means testing endpoint responses and error states through the controller, mocking only the Prisma layer. For the frontend, test rendered output and user interactions, not internal state.

### Backend Tests

- **All existing 245 tests must continue passing.** No regressions.
- **New modules require ≥5 test cases:** happy path, validation error, auth error, access control error, edge case.
- **RBAC middleware tests:** verify each `requireRole` combination returns correct status for each UserRole value.
- **Ground verification flow:** test state transitions (pending→approved, pending→rejected, rejected→resubmit→pending).
- **Subscription enforcement:** test that ground creation fails when plan limit exceeded, succeeds when within limit.
- **Cash session math:** test variance calculation, partial payments, multiple payment methods.
- **Prior art:** See existing test files in `playarena-backend/tests/` — all use Vitest v4, mocked Prisma, deterministic IDs, mock builders with overrides, `clearMocks()` in `beforeEach`.

### Frontend Tests

- **New:** Vitest + React Testing Library setup for frontend.
- **Every page component tests 4 states:** loading, empty, error, success.
- **Critical component tests:** Button variants, Input states, Card rendering, Badge colors, Toast show/dismiss, Modal open/close, EmptyState rendering, Skeleton animation.
- **Integration tests:** Auth flow (login→redirect), Booking flow (search→select→book→confirm), Role gating (player sees player nav, owner sees owner nav).

### E2E Tests

- **Playwright** for 3 critical flows:
  1. Player signup → browse → book → pay
  2. Owner signup → create ground → verification → receive booking → manage
  3. Staff login → open cash session → check in → close session
- Run on every PR via GitHub Actions.

---

## Out of Scope

- **Mobile app (React Native)** — spec captured in `complete-project-spec.md`, implementation deferred.
- **WhatsApp notifications** — spec captured, future enhancement.
- **Online payment gateway integration** — system supports manual payment logging. Gateway integration deferred until payment provider chosen.
- **Native iOS/Android builds** — React Native/Expo only.
- **Elasticsearch/Algolia** — PostgreSQL full-text search is sufficient at launch.
- **Redis** — explicit no-go per constitution.
- **Blog/CMS** — public website has blog placeholder, not implemented.
- **Careers page** — future.

---

## Further Notes

- **Constitution compliance:** This PRD respects all 10 principles of the PlayArena Constitution v0.1.0. The three-layer module pattern, soft deletes, UUID PKs, PKR currency, Asia/Karachi TZ, no Redis, no localStorage tokens, and HttpOnly cookies are all preserved.
- **Backward compatibility:** Existing API response shapes are preserved. New fields are additive. No existing endpoint is removed — only new endpoints and middleware added.
- **The complete spec** (`docs/vision/complete-project-spec.md`) contains all 30 sections of detailed design decisions from the grilling session. This PRD is the formal synthesis of that document into actionable stories.
- **Gap documentation** (`docs/vision/gap-documentation.md`) remains the reference for the 34 identified gaps that this Phase 4 closes.
