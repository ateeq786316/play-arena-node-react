# Task Breakdown: Platform Gap Closure

**Branch**: `002-complete-gaps` | **Date**: 2026-07-30

---

## Phase 0: Research & Contract Mapping

### 0.1 — Backend Route Audit
Read every route file across all 12 backend modules, extract:
- HTTP method, path, auth requirement
- Body/query/param validation rules (express-validator)
- Response shape (status code, body structure)
- Error cases (which errors each route throws)

**Files to read**: All route files in `playarena-backend/src/modules/*/`

### 0.2 — Socket.IO Event Contract
Document both namespaces (`/chat`, `/notifications`):
- Events emitted by client → server (with payload types)
- Events emitted by server → client (with response types)
- Auth middleware (JWT validation per namespace)

**Files to read**: `playarena-backend/src/socket/socket.js`

### 0.3 — Auth Flow Documentation
Trace the complete auth lifecycle:
- Registration → OTP verification → login
- Google OAuth redirect flow
- Token refresh mechanism
- Logout (cookie clearing)
- Password reset flow
- Auth middleware behavior (redirect vs 401)

### 0.4 — Prisma Schema Type Reference
Extract every model's field types, enums, and relations for:
- Shared TypeScript type generation
- Zod DTO schema creation

**Files to read**: `playarena-backend/prisma/schema.prisma`

### 0.5 — Test Pattern Reference
Document testing patterns for future frontend tests:
- Vitest + supertest setup
- Prisma mock pattern
- Factory/helper functions

**Files to read**: `playarena-backend/tests/`

### Output
- `docs/specs/002-complete-gaps/contracts/` — one file per module
- `docs/specs/002-complete-gaps/contracts/socket.events.md`
- `docs/specs/002-complete-gaps/contracts/auth-flow.md`

---

## Phase 1: Frontend Foundation

### 1.1 — Monorepo Scaffold
- `npx create-next-app@latest playarena-frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- Initialize npm workspaces in root `package.json`
- Create `packages/shared/` with `tsconfig.json`, `package.json`
- Create `packages/web/` (move Next.js app here)
- Configure `tsconfig.base.json` with path aliases

### 1.2 — Shared Package: Types
- Generate TypeScript enums from Prisma schema
- Generate model interfaces matching API response shapes
- Create API response wrapper types (`ApiResponse<T>`, `PaginatedResponse<T>`, `ErrorResponse`)

### 1.3 — Shared Package: Zod DTOs
- Create validation schemas matching backend express-validator rules:
  - Auth: register, login, forgot-password, reset-password, update-password, verify-otp
  - Ground: create, update, court create/update, schedule create/update
  - Booking: create, approve, reject, cancel, check-in
  - Team: create, update, invite, join-request
  - Match: create, submit-score, confirm-score, dispute
  - Tournament: create, register, submit-result
  - Finance: open-session, close-session, record-payment
  - Chat: send-message
  - Profile: update

### 1.4 — Shared Package: API Client
- Create typed `apiClient` using `fetch` with:
  - Base URL from env
  - Automatic cookie sending (credentials: "include")
  - JWT refresh interceptor (on 401, call refresh, retry)
  - Generic request methods: `get<T>`, `post<T>`, `patch<T>`, `delete<T>`
  - Error handling → typed `ApiError`
- Create per-module service classes:
  - `AuthApi`, `GroundApi`, `BookingApi`, `TeamApi`, `MatchApi`, `TournamentApi`
  - `FinanceApi`, `ChatApi`, `NotificationApi`, `RatingApi`, `AdminApi`, `UploadApi`

### 1.5 — Shared Package: Utilities
- Date formatting (Asia/Karachi timezone, "2 hours ago" relative, "Mon 15 Jan" short)
- Money formatting (PKR: "Rs. 1,500")
- Sport icons mapping
- Booking status labels/colors
- Ground status labels

### 1.6 — shadcn/ui Integration
- `npx shadcn@latest init` with custom theme (primary green, dark mode toggle)
- Required primitives: Button, Input, Card, Badge, Avatar, Tabs, Dialog, DropdownMenu, Select, Toast, Sheet, Table, Calendar, Popover, Command, Separator, Skeleton, Textarea, Label, Switch, RadioGroup, Checkbox, Tooltip, Progress

### 1.7 — Layout Components
- `Sidebar`: 13 nav items grouped by role (player/owner/staff/admin), collapsible 240px/60px, active state, icons
- `Topbar`: user avatar + name, notification bell with unread count, mobile hamburger
- `PageShell`: Sidebar + Topbar + main content area with padding
- `Providers`: QueryClientProvider, Toaster, AuthProvider (restore session on mount)

### 1.8 — Zustand Stores
- `authStore`: user, isAuthenticated, login(), signup(), logout(), refreshUser(), restoreSession()
- `uiStore`: sidebarCollapsed, theme, notificationUnreadCount

### 1.9 — Next.js Middleware
- Read `accessToken` cookie server-side
- Redirect unauthenticated → `/login?redirect=<current_path>`
- Redirect authenticated users away from `/login`, `/signup` etc.
- Role-based guards for admin routes (`/admin/*`)

### 1.10 — Auth Pages
- `/login`: Email + password form, validation, error display, redirect after success
- `/signup`: Name + email + password + mobile form, Google OAuth button
- `/verify-otp`: 6-digit OTP input, resend timer
- `/forgot-password`: Email input, success message
- `/reset-password`: New password form, token from URL
- All: loading state, error handling, responsive

---

## Phase 2: Core Dashboard Pages

### 2.1 — Home / Ground Discovery
- Search bar with sport/city filters
- Featured grounds carousel
- Ground list with pagination
- Ground Detail page (images, courts, amenities, reviews, location map)
- Court selection flow → date/time picker → booking summary
- **States**: loading (skeleton cards), empty (no grounds found), error (retry button)

### 2.2 — Booking Management
- My Bookings list: tabs (Upcoming / Past / All)
- Booking Detail: ground info, court, time, status badge, payment info
- Cancel booking button with confirmation
- **States**: loading, empty, error

### 2.3 — Teams
- My Teams list with member counts
- Team Detail: roster, match history, stats tabs
- Create Team form (name, sport, description)
- Invite Member dialog (email/username input)
- Join Requests list with approve/reject
- Pending invitations with accept/reject
- **States**: loading, empty, error

### 2.4 — Matchmaking
- My Matches list with tabs (Ongoing / Completed / All)
- Match Detail: teams, scores, status, ground info
- Create Challenge: select ground, court, date, team
- Score Entry form (home/away scores per set)
- Requests Sent/Received with accept/decline
- **States**: loading, empty, error

### 2.5 — Tournaments
- Tournament list with filters (sport, status, date)
- Tournament Detail: bracket visualization, standings table, teams list
- Create Tournament form (name, sport, format, dates, max teams)
- Register team button
- Submit match result (for organizers)
- **States**: loading, empty, error

### 2.6 — Leaderboard
- Global ranking (ELO score) with player/team toggle
- Player Profile page: stats, recent matches, ratings
- **States**: loading, empty, error

### 2.7 — Chat
- Chat Rooms list with last message preview, unread count
- Chat Room: message list (scroll pagination), input box, typing indicators
- Real-time updates via Socket.IO `/chat` namespace
- **States**: loading, empty, error

### 2.8 — Notifications
- Notification list with read/unread styling
- Mark all as read button
- Individual mark read / delete
- Real-time updates via Socket.IO `/notifications` namespace
- **States**: loading, empty, error

### 2.9 — Finance (Owner)
- Finance Dashboard: revenue chart, booking count, commission summary
- Cash Session: open/close with starting/ending balance, variance report
- Session History list with pagination
- Record Payment form (amount, method, reference)
- Reports (daily/weekly/monthly downloads)
- Ground Finance Summary per-ground
- **States**: loading, empty, error

### 2.10 — Ground Management (Owner)
- My Grounds list with status badges
- Ground Dashboard: bookings today, revenue, quick actions
- Create/Edit Ground form (name, location, contact, amenities, images)
- Court Management: add/edit/delete courts with sport, price, capacity
- Schedule Management: set weekly recurring hours, block dates
- Settings: cancellation policy, min booking notice, payment methods
- Staff Management: invite, list, remove staff (manager/staff roles)
- Images: upload/reorder/delete ground photos
- **States**: loading, empty, error

### 2.11 — Operations (Staff)
- Ops Dashboard: today's bookings timeline, court status grid
- Walk-in Booking: quick create booking for walk-in customers
- Today's Bookings: list with check-in/approve/reject actions
- Booking Approval queue
- Court Status toggle (available/maintenance/occupied)
- **States**: loading, empty, error

### 2.12 — Profile
- My Profile view with avatar, name, email, mobile, stats
- Edit Profile form (name, avatar upload, mobile)
- Account Settings: change password, delete account
- Communication Preferences: email/SMS toggles
- Privacy settings
- **States**: loading, error

### 2.13 — Admin Panel
- Admin Dashboard: user count, ground count, booking count, revenue, chart
- User Management: search, filter, detail view (bookings, grounds, status)
- Ground Moderation: verify/reject/flag grounds, view complaints
- Finance Analytics: platform-wide revenue, commission earned, charts
- Audit Logs: filterable event log
- CRUD pages: Regions, Cities, Sports, Payment Methods
- **States**: loading, empty, error

---

## Phase 3: SaaS Backend Features

### 3.1 — Subscriptions Module
- Prisma models: `SubscriptionPlan`, `GroundOwnerSubscription`, `Invoice`, `PaymentMethod`
- Migration SQL with proper indexes and foreign keys
- Backend module: CRUD + upgrade/downgrade/cancel flows
- Commission override logic based on plan
- Feature flag middleware (`req.owner.plan.features.analytics`)

### 3.2 — Analytics Module
- Prisma models: `AnalyticsSnapshot`, `DailyAggregation`
- Scheduled job (cron or manual trigger) to compute daily aggregations
- Endpoints: dashboard overview, revenue analytics, utilization heatmap, booking analytics, customer analytics, forecast, report download (CSV)

### 3.3 — CRM Module
- Prisma models: `BroadcastMessage`, `CommunicationLog`, `UserCommunicationPreference`
- Endpoints: create/send broadcast, list broadcasts, toggle campaign, templates CRUD
- Email/SMS dispatch integration (SMTP for email, placeholder for SMS)

### 3.4 — Dynamic Pricing Module
- Prisma models: `PricingRule`, `HolidayPricing`, `Coupon`, `CouponUsage`
- Pricing rule engine: apply multipliers based on day-of-week, time-of-day, demand
- Holiday pricing: override rules for specific dates
- Coupon system: create, validate, apply, track usage
- Endpoints: CRUD rules/holidays/coupons, validate coupon, price preview

### 3.5 — Disputes Module
- Prisma models: `Dispute`, `DamageClaim`, `NoShowPenalty`
- Endpoints: file dispute, list disputes, add evidence, admin resolve
- No-show penalty: automatic penalty after booking no-show + grace period
- Damage claim: staff files with description + photos

### 3.6 — Geolocation (Ground Extension)
- Add PostGIS extension or lat/lng fields to Ground model
- Endpoint: `POST /api/grounds/nearby` with lat, lng, radius, optional sport/city filters
- Add migration for geo-indexed columns

---

## Phase 4: SaaS Frontend Features

### 4.1 — Subscriptions Pages
- Plans comparison table (Free / Starter / Professional / Enterprise)
- My Subscription: current plan, usage stats, period end
- Change Plan: upgrad/downgrade with prorated pricing
- Billing History: invoice list with download links
- Invoice Detail: line items, status, payment method
- Payment Methods: add/remove cards
- Cancel Subscription: confirmation flow, effective date

### 4.2 — Analytics Pages
- Analytics Dashboard: KPIs (revenue, bookings, customers), trend charts (Recharts)
- Revenue Analytics: daily/weekly/monthly breakdown, sports breakdown
- Utilization Heatmap: court × time-of-week grid, color-coded
- Booking Analytics: booking trends, cancellation rate, avg booking value
- Customer Analytics: new vs returning, booking frequency, top customers
- Revenue Forecast: simple projection based on historical trends
- Download Reports: date range picker → CSV export

### 4.3 — Dynamic Pricing Pages
- Pricing Rules list: active/inactive toggle, rule detail expand
- Create/Edit Rule: day-of-week, time range, multiplier, priority
- Holiday Pricing: calendar view, add holiday override
- Coupon Management: list, create (code, discount %, max uses, expiry)
- Price Preview: select court + date/time → show applied rules + final price

### 4.4 — CRM Pages
- Broadcast Messages list: sent date, audience size, open rate
- Create Broadcast: compose message, select audience (all customers / specific sport / specific ground), schedule
- Broadcast Analytics: delivery rate, open rate, click rate (if applicable)
- Templates: create/edit message templates
- Re-engagement Campaigns: automated trigger (e.g., no booking in 30 days)

### 4.5 — Disputes Pages
- My Disputes: list with status, ground involved, date
- File Dispute: select booking, describe issue, attach evidence (photos)
- Dispute Detail: timeline, messages, resolution
- Damage Claim (Staff): form with description + photo upload
- Moderation Queue (Admin): pending disputes list
- Moderation Detail (Admin): full dispute view, resolve with decision + notes

### 4.6 — Geolocation / Map View
- Leaflet integration with OpenStreetMap tiles
- Ground markers with clustering (leaflet.markercluster)
- Click marker → popup with ground name, sport, rating, "View" button
- Sync with results list: map pan/zoom updates list, list click centers map
- "Near Me" button → geolocate user → center map + filter
- Mobile: map as full-screen view with bottom sheet for results
