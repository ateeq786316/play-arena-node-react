# PlayArena — Gap Documentation

> **Author:** Principal Product Designer & Design System Architect  
> **Version:** v1.0  
> **Date:** 2026-07-31  
> **Design System Reference:** See `DESIGN_TOKEN.md` (soon)

---

## Table of Contents

1. [Role & Access Control](#1-role--access-control)
2. [Ground Verification Workflow](#2-ground-verification-workflow)
3. [Role-Specific Dashboards](#3-role-specific-dashboards)
4. [Frontend UX — Missing Design System](#4-frontend-ux--missing-design-system)
5. [Frontend UX — Missing Animation System](#5-frontend-ux--missing-animation-system)
6. [Frontend UX — Missing Components & States](#6-frontend-ux--missing-components--states)
7. [Backend Gaps](#7-backend-gaps)
8. [SaaS / Subscription Gaps](#8-saas--subscription-gaps)
9. [Mobile Experience](#9-mobile-experience)
10. [Recommended Skills & Agents](#10-recommended-skills--agents)
11. [Implementation Roadmap](#11-implementation-roadmap)

---

## 1. Role & Access Control

### 1.1 Current State

**Backend (`User.role`):** Free-text `String` with only 2 values in use — `"player"` (default) and `"super_admin"`. No enum, no type safety.

| User role value | Where used | Issue |
|---|---|---|
| `"player"` | Default, never checked | Represents ~90% of users, no capabilities defined |
| `"super_admin"` | `AdminService._requireSuperAdmin()` | Only platform-wide role check exists |
| `"admin"` | **Frontend only** (sidebar, admin page) | **Backend has NO `"admin"` role** — admin page unreachable via backend |

**Ground-level roles** work correctly via `GroundAccess` model (`AccessRole` enum: `owner`, `manager`, `staff`).

**Team-level roles** work correctly via `TeamMember` model (`TeamRole` enum: `captain`, `co_captain`, `player`).

**Frontend protection:** No Next.js `middleware.ts` exists. `src/proxy.ts` is unused. All role-gating is client-side in React:

| Gate | File | Issue |
|---|---|---|
| Sidebar SaaS visibility | `sidebar.tsx:35` — `isOwner = role === "owner" \|\| role === "admin"` | No "owner" role exists on backend (only ground-level) |
| Admin page | `admin/page.tsx:19` — `role !== "admin"` | Backend has no "admin" role |
| Grounds create page | **No check at all** | Any authenticated user can access + create |
| Finance / Ops pages | **No check at all** | Any authenticated user can navigate there |

### 1.2 Missing Role Hierarchy

```
PLATFORM LEVEL (User.role)
├── super_admin      — Full platform control, all modules
├── admin            — Content moderation, dispute resolution, ground verification
├── owner            — Ground owner (may own multiple grounds)
├── manager          — Ground operations manager
├── staff            — Ground check-in / walk-in staff
└── player           — Default role, book grounds, join teams, compete

─── These are GROUND-LEVEL (GroundAccess, scoped to a specific ground):

GROUND LEVEL (GroundAccess.accessRole)
├── owner            — Full ground control (always the User who created it)
├── manager          — Operational management (bookings, finance, staff)
└── staff            — Check-in, walk-in, basic ops

TEAM LEVEL (TeamMember.role)
├── captain          — Full team control
├── co_captain       — Assistant captain (frontend calls "vice-captain")
└── player           — Team member
```

**Gaps:**
- `User.role` must become a **Prisma enum** with all 6 platform roles
- Backend has **no `"admin"` enum value** — create it
- Frontend checks `"admin"` and `"owner"` but backend only recognizes `"super_admin"` 
- No `vice_captain` terminology — backend uses `co_captain`, frontend may need alias
- **`GroundService.createGround()` has ZERO role check** — any user including `"player"` can create a ground
- **`GroundService.listMyGrounds()`** returns grounds via `findManagedByUser()` which returns grounds where user is `ownerId` OR has ANY `GroundAccess` — staff see "My Grounds" as owners do

### 1.3 Required Changes

**Backend:**
1. Replace `User.role String` with `UserRole` enum: `super_admin | admin | owner | manager | staff | player`
2. Create central **RBAC middleware** (`rbac.middleware.js`) — `requireRole(...roles)` that checks `req.user.role`
3. Add `requireRole("owner", "admin", "super_admin")` to `GroundService.createGround()`
4. Rename backend `"super_admin"` role checks to include `"admin"` where appropriate (admin routes)
5. Add platform-level `"manager"` and `"staff"` concept so groundless staff can still use the app
6. Add migration to set existing user roles properly

**Frontend:**
1. Create **`middleware.ts`** (Next.js) with route protection + role redirects
2. Create **`useAuthorization`** hook — `can(user, action, resource)` for granular permission checks
3. Create **role-gated route groups** — separate layouts for `player`, `owner`, `admin`
4. Update Sidebar — show only items relevant to the user's role
5. Add `"vice_captain"` as display alias for `"co_captain"` in team UI

**Skills to use:**
- _impeccable_ — for designing the permission UI and role-switching experience
- _design-taste-frontend_ — for the role-management admin screens

---

## 2. Ground Verification Workflow

### 2.1 Current State

`Ground.isVerified` is a **boolean** (default `false`). `AdminService.verifyGround()` just sets it to `true`.

| Flow step | Current | Required |
|---|---|---|
| Owner creates ground | ✅ Works immediately | Should create as `verificationStatus: "pending"` |
| Admin reviews ground | ❌ No queue, no UI | Dedicated verification queue page |
| Admin approves ground | ✅ Sets `isVerified: true` | Set `verificationStatus: "approved"` + timestamp |
| Admin rejects ground | ❌ No rejection path | Set `verificationStatus: "rejected"` + reason |
| Owner notified on decision | ❌ No notification | Push notification + in-app |
| Ground visibility | ❌ Any ground visible | Non-verified grounds hidden from public search |
| Owner resubmits after rejection | ❌ No resubmit | Allow re-upload + resubmit |

### 2.2 Required Changes

**Model:**
```prisma
enum GroundVerificationStatus {
  pending
  approved
  rejected
}

model Ground {
  // ... existing fields ...
  verificationStatus GroundVerificationStatus @default(pending)
  verificationNote  String?                     // Rejection reason or admin note
  verifiedAt        DateTime?
  verifiedById      String?   @db.Uuid
}
```

**Backend:**
1. Change `isVerified: Boolean` → `verificationStatus` enum + migration
2. `GroundService.createGround()` — set `verificationStatus: "pending"` by default
3. `GroundService.listGrounds()` — filter out non-approved grounds for non-owner users
4. `AdminService.verifyGround()` — set `approved`, add rejection endpoint
5. Add notification to owner when status changes
6. Admin dashboard — verification queue with approve/reject actions

**Frontend:**
1. Create admin **ground verification queue** page — list of pending grounds with inline approve/reject
2. Owner ground detail — show verification badge (pending/yellow, approved/green, rejected/red)
3. Owner cannot list non-approved grounds in public (but can see them in "My Grounds")
4. Toast notification when verification status changes

**Skills to use:**
- _impeccable_ — for the verification queue UI and admin workflow
- _design-taste-frontend_ — for the ground submission with document upload

---

## 3. Role-Specific Dashboards

### 3.1 Current State

Every role sees the exact same **generic home page** (`(dashboard)/home/page.tsx`) with featured grounds search.

| Role | Current experience | Required experience |
|---|---|---|
| **Player** | Generic home with grounds search | Personalized — recent bookings, nearby grounds, team invites |
| **Captain** | Same as player | Team dashboard — pending match requests, member management, team stats |
| **Owner** | Same as player | Business dashboard — today's revenue, booking calendar, subscription, analytics |
| **Manager** | Same as player | Operations dashboard — today's schedule, court utilization, staff on duty |
| **Staff** | Same as player | Check-in dashboard — today's bookings, walk-in form, court status |
| **Admin** | Broken "admin" check (no backend match) | Platform dashboard — verification queue, user stats, revenue, system health |
| **Super Admin** | Same as admin | Full platform control — all admin + system config + audit logs |

### 3.2 Required Changes

**Frontend:**
1. Create role-based **dashboard switcher** in the home page layout:
   - `/home` → redirects to role-specific dashboard based on `user.role`
   - `/dashboard/player` → player home
   - `/dashboard/owner` → owner business dashboard
   - `/dashboard/admin` → admin portal (renamed from `/admin`)
2. Each dashboard has: Header → KPI Cards → Trends → Action Area → Detailed Tables
3. Owner dashboard includes subscription status + upgrade CTA
4. Staff dashboard is simplified — today's bookings as cards, quick walk-in button
5. Dashboard components should be reusable (same KPI card, same table component)

**Skills to use:**
- _design-taste-frontend_ — for each role-specific dashboard
- _impeccable_ — for dashboard layout, information hierarchy, KPI card design
- _review-animations_ — for chart entrance animations, count-up effects

---

## 4. Frontend UX — Missing Design System

### 4.1 Current vs Required

| Design Token | Current | Required (from Design System) |
|---|---|---|
| **Primary color** | Tailwind default `primary` | Emerald 500 `#10B981` |
| **Secondary** | None | Indigo 500 `#6366F1` |
| **Accent** | None | Amber 500 `#F59E0B` |
| **Background** | `bg-background` (white) | `#F8FAFC` (slate 50) |
| **Surface** | — | `#FFFFFF` |
| **Border** | `border-border` | `#E2E8F0` (slate 200) |
| **Sidebar** | Light (`bg-background`) | **Dark** (like Stripe/Linear) |
| **Typography** | Geist (Next.js default) | Headings: **Bebas Neue**, Body: **DM Sans**, Fallback: **Inter** |
| **Type scale** | Default Tailwind | H1 48 / H2 40 / H3 32 / H4 24 / H5 20 / H6 18 / Body 16 / Small 14 / Caption 12 |
| **Border radius** | Tailwind defaults | Inputs 14px / Buttons 14px / Cards 20px / Modals 24px |
| **Button height** | `py-2.5` (~36px) | 48px mobile / 52px desktop |
| **Input height** | `py-2` (~32px) | 52px |
| **Shadows** | Tailwind defaults | Cards: `0 8px 24px rgba(15,23,42,0.08)` |
| **Spacing** | Inconsistent | 4px grid — 4/8/12/16/20/24/32/40/48/64/80 |
| **Icons** | Emoji (🔍🏠📅👥) | **Lucide** outlined icons only |
| **Card padding** | `p-4` (16px) | 24-32px |
| **Section spacing** | Inconsistent | 48-80px |
| **Status colors** | Tailwind defaults | Pending: Amber / Approved: Green / Completed: Blue / Cancelled: Red / Under Review: Purple |

### 4.2 Required Changes

**Infrastructure:**
1. Install and configure fonts: **Bebas Neue** (Google Fonts + `next/font`), **DM Sans** (Google Fonts + `next/font`)
2. Install **Lucide React** — `npm install lucide-react`
3. Update `tailwind.config` (or v4 CSS-based config) with custom design tokens
4. Create a `tokens.css` with CSS custom properties for all design tokens
5. Create reusable component library:
   - `Button` (Primary / Secondary / Ghost / Danger — 48/52px height, 14px radius)
   - `Input` (52px height, 14px radius, emerald focus, label + icon support)
   - `Card` (20px radius, `0 8px 24px rgba(15,23,42,0.08)` shadow, 24-32px padding)
   - `Badge` (status colors — amber/green/blue/red/purple)
   - `Modal` (24px radius, backdrop blur, ESC/click-outside close)
   - `Select`, `Textarea`, `Toggle`, `Radio`, `Checkbox`
6. Build a **dark sidebar** replacing the current light one (240px expanded, 64px collapsed)
7. Replace every emoji icon with Lucide equivalent

**Skills to use:**
- _design-taste-frontend_ — for building the token system and component library
- _impeccable_ — for the sidebar redesign, card system, and form components
- _high-end-visual-design_ — for the premium feel and polished surfaces

---

## 5. Frontend UX — Missing Animation System

### 5.1 Current State

No animation library. Only CSS `transition-all` from Tailwind. No `framer-motion`.

| Animation | Current | Required |
|---|---|---|
| **Page transitions** | None (instant swap) | Desktop: Fade (250ms) / Mobile: Slide (250ms) |
| **Button hover** | `hover:opacity-90` | 2-4px elevation increase + scale 1.02 |
| **Card hover** | `hover:border-primary/50` | Very subtle lift (shadow increase) |
| **Table rows** | None | Hover highlight |
| **Loading state** | `animate-pulse` | Skeleton loaders with shimmer effect |
| **Empty state** | Simple text | Illustrated with entrance animation |
| **Modal open** | None | Scale in (200ms) with backdrop fade |
| **Sidebar collapse** | 200ms transition | Smooth icon + label animation |
| **Dashboard KPIs** | Static numbers | Count-up animation on mount |
| **Progress bars** | None | Animated fill |
| **Notification badge** | None | Bounce/pulse on new |
| **Form validation** | Instant error | Shake on error + smooth field highlight |
| **Dropdown/select** | Native | Slide down (150ms) |
| **Toast** | `alert()` | Slide in from top-right (250ms) + auto-dismiss |

### 5.2 Required Changes

1. **Install `framer-motion`** — `npm install framer-motion`
2. Create animation constants file:
   ```ts
   const DURATIONS = { fast: 150, normal: 250, slow: 350, max: 500 }
   const EASINGS = { default: [0.25, 0.1, 0.25, 1], // CSS ease
                     smooth: [0.4, 0, 0.2, 1],      // Material
                     spring: { type: "spring", stiffness: 300, damping: 30 } }
   ```
3. Build `PageTransition` wrapper component — fades content on route change
4. Build `AnimatedCounter` component — count-up animation for KPIs
5. Build `Skeleton` component with shimmer
6. Build `Toast` component with slide-in animation + progress bar auto-dismiss
7. Add `motion.div` to cards, buttons, modals with `whileHover`, `whileTap`
8. Add `layoutId` for shared element transitions between list/detail views

**Allowed animation types** (per design spec):
- Fade In / Fade Out
- Slide Up / Down / Left / Right
- Scale In / Scale Out
- Skeleton Loading (shimmer)
- Count Up Metrics
- Progress Animation
- Micro Hover Effects (2-4px lift, 1.02 scale)

**Banned:**
- No playful/bouncy animations
- No excessive/overlapping animations
- No 3D transforms
- No confetti/particles
- Animate only what serves the UX

**Skills to use:**
- _improve-animations_ — survey all current animation gaps, create implementation plan
- _apple-design_ — for fluid, interruptible, physical motion reference
- _emil-design-eng_ — for the high craft bar on micro-interactions
- _review-animations_ — audit final animation implementation

---

## 6. Frontend UX — Missing Components & States

### 6.1 Every Page Must Handle 4 States

| State | Current | Required |
|---|---|---|
| **Loading** | `animate-pulse` skeleton (on 2 pages only) | Full shimmer skeleton matching page layout |
| **Empty** | Plain text "No grounds available yet." | Illustration + headline + description + CTA |
| **Error** | `{error && <p>{error}</p>}` | Error card with icon, message, retry button |
| **Success** | Works (mostly) | Toast notification + seamless transition |

### 6.2 Missing Global Components

| Component | Current state | Required |
|---|---|---|
| **Toast system** | `alert()` calls scattered | Centralized `useToast()` hook + `<Toaster />` |
| **Error boundary** | None | `<ErrorBoundary>` wrapping each page |
| **Notification bell** | Not in topbar | Bell icon in topbar with unread count badge |
| **Breadcrumbs** | None | Breadcrumb component for nested pages |
| **DataTable** | None | Reusable table with sort/filter/paginate/search |
| **Pagination** | None | Reusable pagination component |
| **Confirm dialog** | `window.confirm()` | `<ConfirmDialog>` modal |
| **Bottom sheet** | None | Mobile bottom sheet for filters/actions |
| **Drawer** | None | Mobile sidebar drawer |
| **Tooltip** | `title` attribute | `<Tooltip>` component |
| **Avatar** | Manual div | `<Avatar>` with fallback initials |
| **Dropdown menu** | None | `<DropdownMenu>` |
| **Tabs** | None | `<Tabs>` component |
| **Empty state** | Text only | `<EmptyState>` with illustration + CTA |
| **Page header** | Ad-hoc per page | `<PageHeader>` with title + actions |
| **Stat card** | Ad-hoc div | `<StatCard>` for KPI dashboards |

### 6.3 Required Changes

**Install additional packages:**
- `lucide-react` (icons)
- `framer-motion` (animations)
- `recharts` or `chart.js` via `react-chartjs-2` (charts — per design spec: "Use Recharts-style visuals")

**Build shared component library in `packages/web/src/components/ui/`:**
- `button.tsx`
- `input.tsx`
- `card.tsx`
- `badge.tsx`
- `modal.tsx`
- `toast.tsx` + `toaster.tsx` + `use-toast.ts`
- `skeleton.tsx`
- `empty-state.tsx`
- `error-boundary.tsx`
- `page-header.tsx`
- `data-table.tsx`
- `pagination.tsx`
- `confirm-dialog.tsx`
- `avatar.tsx`
- `tabs.tsx`
- `dropdown-menu.tsx`
- `tooltip.tsx`
- `bottom-sheet.tsx`
- `animated-counter.tsx`
- `page-transition.tsx`

**Skills to use:**
- _pick-ui-library_ — to confirm the best toast, table, chart, and dialog libraries
- _wireframe_ — to sketch empty states and layout before coding
- _impeccable_ — for final polish of every component

---

## 7. Backend Gaps

### 7.1 Missing Cron Jobs

| Job | Purpose | Frequency |
|---|---|---|
| Booking expiry | Auto-cancel unpaid `pending_payment_verification` bookings | Every 15 minutes |
| Subscription lifecycle | Suspend expired subscriptions, send renewal reminders | Daily |
| Analytics aggregation | Build daily `AnalyticsSnapshot` from booking data | Daily at midnight |
| No-show detection | Flag bookings as no-show if not checked in past start time | Every 10 minutes |
| OTP cleanup | Delete expired OTP codes | Hourly |

**Implementation:** Use `node-cron` in a standalone worker process or Supabase pg_cron.

### 7.2 Missing Endpoints / Logic

| Endpoint | Missing | Priority |
|---|---|---|
| `POST /api/admin/grounds/:id/reject` | Ground rejection with reason | High |
| `GET /api/admin/grounds/pending` | Verification queue | High |
| `POST /api/admin/users/:id/role` | Change user role | High |
| `GET /api/admin/stats` | Platform dashboard stats | Medium |
| `POST /api/grounds/:id/resubmit` | Re-submit ground after rejection | Medium |
| `GET /api/notifications/unread-count` | Quick unread count for badge | Medium |
| `PATCH /api/bookings/:id/mark-no-show` | No-show marking | Low |

### 7.3 Data Integrity Gaps

| Issue | Detail |
|---|---|
| `User.role` is string | Must be Prisma enum |
| No cascade deletes | Deleting a Ground should cascade to Courts, Schedules, Access, etc. |
| Missing soft-delete | Most models lack `deletedAt` (only Ground has it) |
| Missing unique constraints | Some models need composite unique keys |
| Audit trail | Admin has AuditLog but ground-level ops don't log |

### 7.4 File Upload Validation

Current upload has no file type validation, size limits, or virus scanning.

**Required:**
- Accept only images (jpeg, png, webp)
- Max 5MB per file
- Resize to standard sizes (thumbnail 150x150, medium 800x600)
- Validate dimensions (min 200px wide)
- Sanitize filenames

### 7.5 Required Changes

1. Add `node-cron` to dependencies
2. Create `src/cron/` directory with individual job files
3. Create `src/cron/index.js` to register all jobs on server start
4. Add `UserRole` enum migration
5. Add cascade deletes to Prisma schema
6. Add soft-delete fields to remaining models
7. Add file validation middleware
8. Add audit logging for ground-level operations

**Skills to use:**
- _diagnose_ — for finding edge cases and race conditions in cron jobs
- _zoom-out_ — for understanding the data model relationships before adding cascade deletes

---

## 8. SaaS / Subscription Gaps

### 8.1 Current State

Subscription module exists but is not connected to ground creation limits.

| Feature | Current | Required |
|---|---|---|
| **Plan seeding** | No seed data | 3 plans: Free, Starter, Professional |
| **Free tier** | Not enforced | Max 1 ground, 2 courts, 5% commission |
| **Plan gating** | `plan.middleware.js` exists but unused by ground creation | Check plan before creating ground |
| **Usage tracking** | None | Track grounds/courts created per owner |
| **Analytics** | `AnalyticsSnapshot` model exists, no aggregation cron | Daily aggregation |
| **Invoices** | Model exists, no generation | Auto-generate on subscription |
| **Payment webhook** | None | Webhook handler for payment events |

### 8.2 Plan Structure

| Feature | Free | Starter (PKR 2,999/mo) | Professional (PKR 7,999/mo) |
|---|---|---|---|
| Max grounds | 1 | 3 | Unlimited |
| Max courts/ground | 2 | 5 | Unlimited |
| Commission | 5% | 3% | 1% |
| Analytics | 7 days | 30 days | 365 days |
| CRM | ✗ | Basic | Full |
| Staff accounts | 0 | 3 | Unlimited |
| Priority support | ✗ | ✗ | ✓ |

### 8.3 Required Changes

1. Create seed script `prisma/seed.js` with 3 subscription plans
2. Add `limitByPlan("maxGrounds")` check to `GroundService.createGround()`
3. Add usage tracking — increment counter on ground creation
4. Create analytics aggregation cron job
5. Create invoice generation on subscription renewal

---

## 9. Mobile Experience

### 9.1 Current State

No mobile-responsive layout exists. The sidebar is fixed-left, not a drawer.

| Aspect | Current | Required |
|---|---|---|
| Navigation | Fixed left sidebar | Bottom tab bar (<768px) / Sidebar (≥768px) |
| Sidebar on mobile | Covers 240px of screen | Becomes slide-in drawer with backdrop |
| Layout | Sidebar + topbar + content | Single column stacked |
| Tables | Render as-is | Convert to card list on mobile |
| Filters | Inline | Bottom sheet |
| Touch targets | Variable | Minimum 44px |
| Bottom padding | None | Safe area inset |

### 9.2 Required Changes

1. Create responsive sidebar that becomes drawer on mobile
2. Create bottom navigation component for mobile view
3. Create responsive table → card list transform
4. Create bottom sheet for mobile filters
5. Add safe area insets for mobile browsers
6. Test all 36 routes on 375px viewport

**Skills to use:**
- _design-taste-frontend_ — for the mobile-adaptive layout
- _imagegen-frontend-mobile_ — for generating mobile screen references

---

## 10. Recommended Skills & Agents

### 10.1 Skills to Activate by Task

| Task | Primary Skill | Supporting Skills |
|---|---|---|
| RBAC design + middleware | `impeccable` | `create-hook` (for auth hook) |
| Role-specific dashboards | `design-taste-frontend` | `impeccable`, `canvas` |
| Design system tokens + components | `design-taste-frontend` | `high-end-visual-design` |
| Sidebar redesign (dark) | `impeccable` | `apple-design` |
| Animation system setup | `improve-animations` | `emil-design-eng`, `apple-design` |
| Toast + notification system | `impeccable` | `pick-ui-library` |
| Ground verification workflow | `impeccable` | — |
| Cron jobs | `diagnose` | — |
| Mobile responsive layout | `design-taste-frontend` | `imagegen-frontend-mobile` |
| Empty state illustrations | `brandkit` | `canvas` |
| Admin portal redesign | `design-taste-frontend` | `industial-brutalist-ui` |
| Payment/Subscriptions UX | `impeccable` | `pick-ui-library` |
| Charts + dashboards | `canvas` | — |
| Commission new components | `impeccable` | `review-animations` (for motion review) |
| Audit existing animation | `review-animations` | — |

### 10.2 Recommended Agent Sequence

```
Phase 4.1 — Foundation
├── Agent: Design System Setup
│   └── Skill: design-taste-frontend
│   └── Deliverable: tokens.css, component library, font setup
│
├── Agent: Animation Infrastructure
│   └── Skill: improve-animations → emil-design-eng → apple-design
│   └── Deliverable: framer-motion setup, AnimatedCounter, PageTransition, Toast

Phase 4.2 — Backend RBAC
├── Agent: Role Enum Migration
│   └── Deliverable: Prisma UserRole enum, migration, seed data
├── Agent: RBAC Middleware
│   └── Deliverable: rbac.middleware.js, requireRole(), route updates
├── Agent: Ground Verification Workflow
│   └── Deliverable: verificationStatus enum, admin queue endpoints, notifications

Phase 4.3 — Frontend RBAC
├── Agent: Middleware + Route Protection
│   └── Skill: impeccable
│   └── Deliverable: middleware.ts, useAuthorization hook, route groups
├── Agent: Role-Gated Navigation
│   └── Deliverable: dynamic sidebar, bottom nav, role-based home redirect
├── Agent: Admin Portal
│   └── Skill: design-taste-frontend
│   └── Deliverable: admin dashboard, verification queue, user management

Phase 4.4 — Dashboards
├── Agent: Player Dashboard
│   └── Skill: design-taste-frontend
├── Agent: Owner Dashboard
│   └── Skill: design-taste-frontend + canvas (charts)
├── Agent: Staff Dashboard
│   └── Skill: design-taste-frontend
├── Agent: Super Admin Dashboard
│   └── Skill: design-taste-frontend + canvas (charts)

Phase 4.5 — Polish
├── Agent: Empty States + Error States
│   └── Skill: brandkit (illustrations)
├── Agent: Mobile Responsive
│   └── Skill: design-taste-frontend
├── Agent: Animation Audit
│   └── Skill: review-animations
```

---

## 11. Implementation Roadmap

### Phase 4.1 — Foundation (Week 1)
1. Design system tokens + fonts + colors
2. Component library (Button, Input, Card, Badge, Modal)
3. Animation infrastructure (framer-motion, page transitions, toast)
4. Lucide icons replace emojis
5. Dark sidebar implementation

### Phase 4.2 — Backend RBAC (Week 1-2)
1. UserRole Prisma enum + migration
2. RBAC middleware
3. Ground verification enum + migration
4. Ground verification workflow endpoints
5. Seed subscription plans
6. Free tier enforcement in ground creation

### Phase 4.3 — Frontend RBAC (Week 2)
1. Next.js middleware.ts with route protection
2. useAuthorization hook
3. Role-gated navigation (sidebar + bottom nav)
4. Admin portal redesign
5. Ground verification queue UI

### Phase 4.4 — Role Dashboards (Week 2-3)
1. Player dashboard
2. Owner dashboard (KPI cards, charts, subscription)
3. Staff dashboard (check-in, today's schedule)
4. Manager dashboard (operations)
5. Super admin dashboard

### Phase 4.5 — Polish & Mobile (Week 3)
1. Empty states with illustrations
2. Error boundaries + retry logic
3. Mobile responsive (bottom nav, drawer, card lists)
4. Animation audit
5. Cross-browser testing
6. Load testing

---

## Appendix: Quick-Reference Gap Matrix

| # | Category | Gap | Severity | Effort | Phase |
|---|---|---|---|---|---|
| 1 | RBAC | User.role is string, not enum | Critical | M | 4.2 |
| 2 | RBAC | No RBAC middleware | Critical | M | 4.2 |
| 3 | RBAC | Any user can create ground | Critical | S | 4.2 |
| 4 | RBAC | Backend has no "admin" role | Critical | S | 4.2 |
| 5 | RBAC | Frontend checks "admin" / "owner" that don't exist on backend | Critical | S | 4.2 |
| 6 | RBAC | No Next.js middleware — routes unprotected | Critical | M | 4.3 |
| 7 | RBAC | Staff sees same "My Grounds" as owner | High | S | 4.2 |
| 8 | Ground | No verification workflow (only boolean) | Critical | L | 4.2 |
| 9 | Ground | No rejection reason or resubmit flow | High | M | 4.2 |
| 10 | Ground | Non-verified grounds visible in public | Critical | S | 4.2 |
| 11 | Design | No design system tokens applied | Critical | L | 4.1 |
| 12 | Design | Emoji icons (need Lucide) | High | M | 4.1 |
| 13 | Design | Light sidebar (needs dark) | High | M | 4.1 |
| 14 | Design | Wrong font (needs Bebas Neue + DM Sans) | High | S | 4.1 |
| 15 | Design | Wrong border radius / shadows / spacing | High | M | 4.1 |
| 16 | Anim | No framer-motion | High | M | 4.1 |
| 17 | Anim | No page transitions | Medium | S | 4.1 |
| 18 | Anim | No count-up / progress animations | Medium | M | 4.1 |
| 19 | UX | No toast system (uses alert()) | High | M | 4.1 |
| 20 | UX | No error boundaries | High | M | 4.5 |
| 21 | UX | No empty state illustrations | Medium | M | 4.5 |
| 22 | UX | No notification bell/badge | Medium | S | 4.3 |
| 23 | UX | No confirmation dialogs | Medium | M | 4.1 |
| 24 | Dash | No role-specific dashboards | Critical | XL | 4.4 |
| 25 | Dash | Admin page broken (backend mismatch) | Critical | S | 4.2 |
| 26 | Backend | No cron jobs (booking expiry, analytics) | High | L | 4.2 |
| 27 | Backend | No subscription plan seed data | High | S | 4.2 |
| 28 | Backend | No cascade deletes | Medium | M | 4.2 |
| 29 | Backend | No file upload validation | Medium | S | 4.5 |
| 30 | SaaS | Free tier not enforced | Critical | M | 4.2 |
| 31 | Mobile | No responsive layout | Critical | L | 4.5 |
| 32 | Mobile | No bottom navigation | High | M | 4.5 |
| 33 | Mobile | No mobile drawer sidebar | High | M | 4.5 |
| 34 | Mobile | Tables not responsive | Medium | M | 4.5 |

**Severity:** Critical / High / Medium / Low  
**Effort:** XS (<1h) / S (1-4h) / M (1-2d) / L (3-5d) / XL (1-2w)
