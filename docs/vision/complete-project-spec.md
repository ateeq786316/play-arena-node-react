# PlayArena — Complete Project Specification

> **Generated from:** Product Design Grilling Session  
> **Date:** 2026-07-31  
> **Version:** v1.0 (pre-PRD)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Users & Roles](#2-users--roles)
3. [Ground Verification & Lifecycle](#3-ground-verification--lifecycle)
4. [Subscriptions & Billing](#4-subscriptions--billing)
5. [Bookings & Payments](#5-bookings--payments)
6. [Finance & Cash Management](#6-finance--cash-management)
7. [Owner Portal — Ground Management](#7-owner-portal--ground-management)
8. [Player Experience](#8-player-experience)
9. [Admin & Super Admin Portal](#9-admin--super-admin-portal)
10. [Staff Experience](#10-staff-experience)
11. [Teams & Matches](#11-teams--matches)
12. [Tournaments](#12-tournaments)
13. [Chat](#13-chat)
14. [Notifications](#14-notifications)
15. [Complaints System](#15-complaints-system)
16. [Ratings & Leaderboard](#16-ratings--leaderboard)
17. [Search & Discovery](#17-search--discovery)
18. [Payment Models](#18-payment-models)
19. [Languages & Internationalization](#19-languages--internationalization)
20. [Mobile App](#20-mobile-app)
21. [Architecture & Hosting](#21-architecture--hosting)
22. [Cron Jobs](#22-cron-jobs)
23. [Emails & Notifications](#23-emails--notifications)
24. [File Uploads](#24-file-uploads)
25. [Security & Data Privacy](#25-security--data-privacy)
26. [Analytics & Reports](#26-analytics--reports)
27. [Testing Strategy](#27-testing-strategy)
28. [Design System](#28-design-system)
29. [Public Website](#29-public-website)
30. [General Architecture Decisions](#30-general-architecture-decisions)

---

## 1. Product Overview

**PlayArena** is a global sports technology platform connecting players with sports grounds, teams, and tournaments. It operates as a B2B2C marketplace — ground owners list venues, players book and compete, the platform takes subscription fees and transaction commissions.

### Revenue Streams
- **Subscription fees** from ground owners (monthly/invoiced)
- **Tournament listing fees** — owner pays to list tournament, admin approves after payment
- **Advertising** (future scope)
- Platform **commission** on bookings (included in subscription tiers)

### Market
- Global platform (one instance, multi-country)
- Launch markets: Pakistan, UAE, UK, USA, Canada, Australia, Saudi Arabia, Malaysia
- Single codebase, single database, country-based filtering

---

## 2. Users & Roles

### 2.1 Role Model

Roles are **mutually exclusive at the User level**. One account = one primary role. A person who wants to be both a Player and an Owner must create **two separate accounts with different emails**.

| Role | Signup choice | Scope | Can do |
|---|---|---|---|
| **Player** | At signup | Platform | Book grounds, create/join teams, compete in matches, join tournaments, rate/ review |
| **Owner** | At signup | Their ground(s) | Create/manage grounds, manage staff, view finance, manage bookings, create tournaments |
| **Manager** | Created by Owner | Specific ground(s) | Operational management — bookings, finance, cash sessions, staff oversight |
| **Staff** | Created by Owner | Specific ground(s) | Check-in players, create walk-in bookings, record payments, open/close cash sessions |
| **Admin** | Assigned by Super Admin | Platform (operational) | Verify grounds, resolve complaints, manage users, moderate content |
| **Super Admin** | System-seeded | Platform (full) | Everything Admin can + system settings, subscription plans, admin management, audit logs, platform config |

### 2.2 Account Relationships

- **Player** and **Owner** are separate accounts — different emails, different logins
- **Manager/Staff** are created by **Owner** from their ground management dashboard
  - Owner fills: name, email, password, role, permissions
  - System creates a User record with `role = "manager"` or `role = "staff"`
  - These credentials are used to login directly
  - Manager/Staff cannot be a Player (cannot book grounds, join teams)
- **Captain/Vice-Captain** are team-level roles within a Player account
  - Captain = team creator
  - Vice-Captain = promoted by Captain (alias for `co_captain` in codebase)
  - They see Player features + team management tabs
- **Admin/Super Admin** are system-assigned roles, not available at signup

### 2.3 Role Hierarchy

```
PLATFORM LEVEL (User.role)
├── super_admin
├── admin
├── owner
├── manager
├── staff
└── player

GROUND LEVEL (GroundAccess.accessRole) — scoped to a specific ground
├── owner   (always the User who created the ground)
├── manager (operational management)
└── staff   (check-in, walk-in, basic ops)

TEAM LEVEL (TeamMember.role) — scoped to a specific team
├── captain
├── co_captain (vice-captain in UI)
└── player
```

### 2.4 User.role Enum (Backend)

```prisma
enum UserRole {
  super_admin
  admin
  owner
  manager
  staff
  player
}

model User {
  // ...
  role UserRole @default(player)
  // ...
}
```

### 2.5 RBAC Middleware

Centralized `rbac.middleware.js` that checks `req.user.role` against allowed roles for each route. All role checks move from service layer to middleware layer.

---

## 3. Ground Verification & Lifecycle

### 3.1 Verification Status Model

```prisma
enum GroundVerificationStatus {
  pending
  approved
  rejected
}

model Ground {
  // ... existing fields ...
  verificationStatus GroundVerificationStatus @default(pending)
  verificationNote    String?   // Rejection reason or admin note
  verifiedAt          DateTime?
  verifiedById        String?   @db.Uuid
}
```

### 3.2 Lifecycle

```
Owner creates ground
        │
        ▼
verificationStatus: pending
  ├── Owner can edit ground
  ├── Ground is NOT visible to players
  └── Owner sees "Pending Verification" badge
        │
        ▼
Admin/Super Admin reviews in Verification Queue
        │
    ┌───┴───────────┐
    ▼                ▼
Approved          Rejected
├── isActive: true  ├── verificationNote: reason
├── visible to      ├── Owner notified with reason
│   players         └── Owner can edit + resubmit
├── Owner notified
└── verifiedAt set
```

### 3.3 Visibility Rules

| Verification Status | Who can see the ground |
|---|---|
| `pending` | Owner only (in "My Grounds") |
| `approved` | Everyone |
| `rejected` | Owner only (with rejection reason) |

### 3.4 Required Backend Endpoints

| Method | Endpoint | Action | Role |
|---|---|---|---|
| `PATCH` | `/api/admin/grounds/:id/verify` | Approve ground | Admin, Super Admin |
| `PATCH` | `/api/admin/grounds/:id/reject` | Reject with reason | Admin, Super Admin |
| `GET` | `/api/admin/grounds/pending` | Verification queue | Admin, Super Admin |
| `POST` | `/api/grounds/:id/resubmit` | Resubmit after rejection | Owner |

### 3.5 Owner Subscription & Ground Creation

- New Owner gets a **dynamic free trial** (default 14 days, configurable by Super Admin)
- During trial: can create up to the Starter plan limits (3 grounds)
- All grounds stay `pending_verification` until:
  - Trial ends → grounds freeze (cannot create new bookings)
  - Owner subscribes → subscription activates → grounds proceed to verification
  - Admin can extend/modify trial per owner
- After subscription payment received → verification process starts

---

## 4. Subscriptions & Billing

### 4.1 Plan Structure

Super Admin can **dynamically create/edit/delete** plans via the admin portal. Seed data:

| Feature | Free | Starter | Professional |
|---|---|---|---|
| Price | Free | PKR 2,999/mo or PKR 29,999/yr | PKR 7,999/mo or PKR 79,999/yr |
| Max Grounds | 1 | 3 | Unlimited |
| Max Courts/Ground | 2 | 5 | Unlimited |
| Commission Rate | 5% | 3% | 1% |
| Staff Accounts | 0 | 3 | Unlimited |
| Analytics Retention | 7 days | 30 days | 365 days |
| CRM | ❌ | Basic | Full |
| Priority Support | ❌ | ❌ | ✅ |

### 4.2 Plan Management (CRUD — Super Admin only)

Model fields: `name`, `price`, `interval` (monthly/yearly), `maxGrounds`, `maxCourtsPerGround`, `commissionRate`, `features` (JSON), `isActive`, `sortOrder`, `description`

### 4.3 Owner Subscription Lifecycle

```
Owner signs up → Free trial starts (X days, default 14)
       │
Trial ends → Grounds freeze (no new bookings, existing bookings honored)
       │
Owner subscribes → Subscription created (status: pending_payment)
       │
Payment received (cash/online/transfer) → status: active (30 days)
       │
Each renewal → Invoice generated → Payment due
       │
If unpaid after 7 days → status: past_due
       │
If unpaid after 14 days → status: suspended (grounds freeze)
       │
If unpaid after 30 days → status: expired
```

### 4.4 Free Trial Settings (Super Admin)

- Default trial duration (days) — number input
- Toggle: Enable/disable free trial for new owners
- Per-owner override: Admin can set custom trial length from User Detail

---

## 5. Bookings & Payments

### 5.1 Booking Flow

```
Player selects ground → Court → Date → Time slot → Sees price
        │
        ▼
Player confirms booking
  ├── If online payment active → Pay → Booking confirmed
  └── If offline/cash → Booking created (status: pending_payment)
        │
        ▼
Player arrives at ground → Staff checks in → Payment recorded
  ├── Cash → Staff logs payment
  ├── JazzCash/Easypaisa/Bank Transfer → Staff logs with reference
  └── Already paid online → Staff marks as arrived
```

### 5.2 Booking States

```
pending_payment → approved → checked_in → completed
      │               │
      ▼               ▼
   cancelled      cancelled
```

### 5.3 Payment Recording

Staff can create booking directly (walk-in) OR mark existing booking as paid:

**Walk-in booking creation:**
```
[Court] [Date] [Time] [Player Name + Phone]
Amount: PKR 1,500
Payment Method: ○ Cash  ○ JazzCash  ○ Easypaisa  ○ Bank Transfer
Amount Paid: _____  Reference ID: _____
→ Creates booking as 'confirmed' if fully paid
```

**Payment on arrival:**
```
Booking #1234 — PKR 1,500
Payment: Cash | Amount: 1,500
→ Booking moves from pending_payment → checked_in
```

### 5.4 "Pay Without Booking" Toggle

- Owner/Manager can toggle **"Allow Pay Without Booking"** in ground settings
- If ON: Staff can record a payment without a booking (for casual drop-in players)
- Payment logged with: player name, phone, amount, method, court used, time

### 5.5 Payment Displays

Every booking shows:
- Total amount
- Amount paid
- Amount pending
- Payment method(s)
- Payment status: unpaid / partial / paid / overpaid

---

## 6. Finance & Cash Management

### 6.1 Cash Session Lifecycle

```
OPEN → COLLECT → COUNT → CLOSE → RECONCILE
```

**Step 1 — Open Session (start of shift)**
- Staff enters `openingCash` (physical cash in drawer at shift start)
- System records: `openedBy`, `openedAt`, `openingCash`

**Step 2 — During shift**
- Staff logs every transaction:
  - New booking (cash) → payment recorded
  - Online booking paid cash at ground → marked as paid
- System auto-computes: `expectedCash = openingCash + totalCashCollected`

**Step 3 — Close Session (end of shift)**
- Staff counts physical cash → enters `closingCash`
- System calculates: `variance = closingCash - expectedCash`

**Step 4 — Variance Handling**
| Variance | Action |
|---|---|
| 0 | Clean — session closed |
| Small (< PKR 500 or < 2%) | Auto-approved, logged |
| Large (> PKR 500 or > 2%) | Flagged — Owner/Manager notified |
| Repeated (3+ in 30 days) | Alert to Owner |

### 6.2 Owner Finance Reports

| Report | Content |
|---|---|
| **Daily Summary** | Court utilization, total revenue (cash vs non-cash), who opened/closed sessions |
| **Revenue by Method** | Cash vs JazzCash vs Easypaisa vs Bank Transfer breakdown |
| **Session History** | Every staff session with open/close amounts and variance |
| **Variance Log** | All flagged variances with staff name, amount, reason, resolution |
| **Payout Report** | Total revenue - commission = net payout |
| **Commission Report** | Platform commission deducted (amount + percentage) |

---

## 7. Owner Portal — Ground Management

Complete management interface for each ground owned.

### 7.1 Pages

| Page | Path | Contents |
|---|---|---|
| Ground Dashboard | `/grounds/:id` | KPI cards (today's bookings, revenue, utilization, active cash session, pending verification, open complaints, staff on duty, subscription status), 7-day charts, today's schedule, quick actions |
| Court Management | `/grounds/:id/courts` | CRUD table, bulk export, duplicate court |
| Schedule Management | `/grounds/:id/schedule` | Weekly grid, bulk copy, special closures, maintenance closures |
| Pricing Rules | `/grounds/:id/pricing` | Base pricing, dynamic rules (priority-based), holiday pricing, coupon management, price preview calculator |
| Images | `/grounds/:id/images` | Grid with upload, drag-reorder, set primary, delete |
| Settings | `/grounds/:id/settings` | 25+ toggles (online booking, walk-in, deposit, cancellation policy, check-in, no-show, late fees, etc.) |
| Staff Management | `/grounds/:id/staff` | Table, invite modal (with permissions override), detail drawer, revoke |
| Bookings Calendar | `/grounds/:id/bookings` | Day/Week/Month view, detail drawer, quick create, filters, export |
| Finance | `/grounds/:id/finance` | KPI cards, revenue charts, revenue table, cash session reports, payment log, commission report, expenses (optional) |
| Analytics | `/grounds/:id/analytics` | Utilization rate, booking lead time, cancellation rate, no-show rate, repeat vs new customers, popular sports, revenue per court, hourly distribution, day-of-week analysis |
| Complaints | `/grounds/:id/complaints` | Complaints against this ground, add response |
| Broadcast (CRM) | `/grounds/:id/crm` | Send broadcast (audience selector), history, customer list |
| Subscription | `/grounds/:id/subscription` | Current plan card, usage bars, plan comparison table, invoice history |
| Verification | `/grounds/:id/verification` | Status display, resubmit (if rejected), documents upload |
| Activity Log | `/grounds/:id/activity` | Chronological log of all changes at this ground |
| QR Code | `/grounds/:id/qr` | Auto-generated QR code, download, share link |

### 7.2 Staff Permissions (Granular)

When inviting staff, Owner can override default permissions:
- Can create bookings
- Can cancel bookings
- Can record payments
- Can open/close cash session (Manager only)
- Can view finance reports (Manager only)
- Can manage staff (Manager only)

### 7.3 Notifications to Owner

- New booking received
- Booking cancelled
- Payment received
- Cash session variance flagged
- Ground verified/rejected
- Complaint filed against ground
- Subscription expiring (7d/3d/1d)
- Daily booking summary (optional)
- Low utilization alert (optional)

---

## 8. Player Experience

### 8.1 Anonymous Browsing (No Login)

| Screen | Contents |
|---|---|
| Landing / Home | Hero search, sport category icons, featured grounds grid, "How it works" |
| Ground Search | Search + filters (sport, city, date, price, rating), card grid, map toggle |
| Map View | Full-screen map, ground pins, tap → popup, tap → detail |
| Ground Detail | Image gallery, info, sport tabs, court list, availability calendar, reviews, amenities |
| Sport Categories | `/cricket`, `/football` — filtered ground lists |
| City Pages | `/lahore`, `/karachi` — grounds by city |
| Tournaments Public | Browse tournaments, brackets, teams |
| Pricing Page | Marketing page for owners |

### 8.2 Player Dashboard (Logged In)

| Screen | Contents |
|---|---|
| Home | Upcoming bookings, recommended grounds, team invites, match requests, quick stats |
| My Bookings | List (upcoming/past/cancelled), QR code for check-in, cancel action |
| Booking Detail | Full info, countdown, directions, QR, cancel button, payment breakdown, receipt |
| Teams | My teams, create team, pending invites |
| Team Detail | Members, stats, match history, ELO, join requests, leave |
| Create Team | Name, sport, city, description, logo → becomes Captain |
| Team Invites | Accept/reject incoming |
| Matches | Upcoming/live/completed, filter by sport/status |
| Match Detail | Teams, scores, ground, date, player stats, ratings |
| Match Requests | Incoming challenges, accept/reject with message |
| Send Challenge | Search teams by sport/name → send with proposed date/ground |
| Tournaments | Browse, register team, my tournaments, brackets |
| Leaderboard | By sport/city, ELO-based, my rank |
| Ratings | Rate completed matches, review grounds |
| Chat | Team chats, messages, send |
| Profile | Edit info, avatar, password, stats, activity log |
| Settings | Notification prefs, language, quiet hours, delete account |

### 8.3 Player States

| State | UX |
|---|---|
| No bookings | Empty state: "Book your first ground" + CTA |
| No teams | Empty state: "Join or create a team" + CTA |
| No notifications | "Nothing yet — we'll notify you when something happens" |
| Booking cancelled by owner | Notification + refund status + "Browse other grounds" |
| Booking reminder | Notification: "Your booking at Arena 52 starts in 2 hours" |
| Match lost | ELO change + rematch button |
| Team invite expired | "Ask captain to send new invite" |
| Ground full | Suggested alternatives: "Try X — 2km away, slots available" |
| Offline | Banner + cached data + retry button |

---

## 9. Admin & Super Admin Portal

### 9.1 Super Admin Portal (Full Access — 25 Modules)

| # | Module | Description |
|---|---|---|
| 1 | **Platform Dashboard** | KPI row (users, grounds, bookings, revenue), trends, quick actions, recent audit log |
| 2 | **User Management** | Table (search, filter by role), row actions (view, edit, change role, reset password, suspend), detail page, bulk CSV export |
| 3 | **Admin Management** | Promote/demote admins, grant/revoke super admin, audit per admin |
| 4 | **Ground Management** | All grounds table, filter by verification status, owner, city, sport. Approve/reject/suspend/delete |
| 5 | **Ground Verification Queue** | Default view: pending grounds sorted oldest first. Inline approve/reject with reason |
| 6 | **Booking Management** | All bookings across all grounds, filter by status/ground/date/player. View, cancel, refund |
| 7 | **Team Management** | All teams, filter by sport/search. View, edit, change captain, disband, flag inappropriate names |
| 8 | **Match Management** | All matches, filter by status/sport. View, force cancel, edit scores |
| 9 | **Tournament Management** | All tournaments, filter by status/format. View, cancel, force complete, edit brackets |
| 10 | **Subscription Plans (CRUD)** | Create/edit/delete plans. Fields: name, price, interval, maxGrounds, maxCourts, commissionRate, features JSON, isActive, sortOrder |
| 11 | **Owner Subscriptions** | All owner subscriptions table, filter by status. Change plan, extend, cancel, force activate. Usage vs limits display |
| 12 | **Trial Settings** | Enable/disable trial, default duration, per-owner override |
| 13 | **Commission Settings** | Default commission rate, per-owner override |
| 14 | **Platform Settings** | Key-value config editor (timezone, rate limits, OTP expiry, auto-cancel time, booking reminder hours, maintenance mode toggle, etc.) |
| 15 | **Payment Methods (CRUD)** | Name, slug, icon, account details (for manual payments), isActive, displayOrder |
| 16 | **Region & City (CRUD)** | Province/State level, cities under each, with displayOrder |
| 17 | **Sport Categories (CRUD)** | Name, slug, icon, isActive |
| 18 | **Complaint Management** | All complaints table, filter by status/type/ground. Review evidence, mark under_review, resolve, dismiss, assign to admin |
| 19 | **Coupon / Promo Management** | Across all grounds, create/edit, usage report |
| 20 | **Communication / Broadcast** | Platform-wide broadcast to all users/owners/players. History with delivery stats |
| 21 | **Finance Reports** | Revenue by payment method, by ground, by owner. Owner payout report. CSV/PDF export |
| 22 | **Cash Session Reports** | All sessions across all grounds, filter by ground/staff/date/variance |
| 23 | **Audit Logs** | Every admin action, filter by admin/action/entity/date. Old values → new values. IP address. Retention: 1 year |
| 24 | **System Health** | API uptime, DB connection, last cron runs, error count (24h), active users. Error logs with stack traces. Manual cron trigger |
| 25 | **Data Export** | CSV/JSON export of any table. Manual DB backup trigger |

### 9.2 Admin Portal (Operational Only)

Same as Super Admin but:
- ❌ Cannot create/edit subscription plans
- ❌ Cannot change platform settings
- ❌ Cannot create/edit admin accounts
- ❌ Cannot change user roles
- ❌ Cannot perform full data export
- ❌ Cannot access system health
- Cannot delete grounds (only suspend)
- Cannot refund without approval
- Cannot change user roles

### 9.3 Verification Queue (Detail)

```
┌──────────────────────────────────────────────────────┐
│  Ground Verification Queue                    [3 pending]│
├──────────────────────────────────────────────────────┤
│  Ground          Owner        Submitted    Days Ago  │ Actions           │
│──────────────────────────────────────────────────────│
│  Arena 52        Ahmed Khan   2026-07-28   3 days    │ [Approve] [Reject]│
│  Futsal Club     Ali Raza     2026-07-29   2 days    │ [Approve] [Reject]│
│  Cricket Ground  Bilal        2026-07-30   1 day     │ [Approve] [Reject]│
└──────────────────────────────────────────────────────┘

[Reject] → Modal:
  ┌─────────────────────────────┐
  │ Reject Ground               │
  │                             │
  │ Reason *:                   │
  │ [Incomplete documents______]│
  │                             │
  │ Additional Notes:           │
  │ [Please upload proof of ___]│
  │                             │
  │ [Confirm Rejection]  [Cancel]│
  └─────────────────────────────┘
```

---

## 10. Staff Experience

### 10.1 Staff Dashboard

- Today's bookings list — time, court, player name, status
- Check-in button → mark player arrived
- Mark No-Show after X minutes (configurable)
- Create walk-in booking
- Open/close cash session
- View today's cash collected

### 10.2 Staff Shift Flow

```
1. Login → sees today's bookings
2. Open Cash Session → enter opening cash amount
3. Throughout day:
   - Check in arriving players
   - Create walk-in bookings
   - Log payments (cash/JazzCash/Easypaisa/Bank Transfer)
   - Flag no-shows
4. End of shift → Close Cash Session → enter closing cash
5. System shows variance → if flagged, Owner notified
```

### 10.3 What Staff Cannot Do

- Cannot manage staff (add/remove other staff)
- Cannot change ground settings
- Cannot view finance reports (staff level)
- Cannot cancel bookings without manager override
- Cannot refund payments

---

## 11. Teams & Matches

### 11.1 Teams

- Only **Players** can create teams
- Creator becomes **Captain**
- Captain can promote any member to **Vice-Captain**
- A Player can be on **multiple teams** (cross-sport)
- Max team size varies by sport (5v5 futsal, 7v7 cricket, etc.)
- Team has ELO rating (default 1200)
- Sport-specific ELO (separate rating per sport)

### 11.2 Team Invites

- Captain invites players → notification sent
- Player accepts/rejects
- Invite expires after X days
- Any team member can leave voluntarily

### 11.3 Match Requests

- Captain challenges another team **of the same sport**
- Ground is **optional** (can be played at any venue)
- Opponent captain accepts/rejects
- If accepted → match scheduled
- Scores entered by **both teams**
- If both enter → **average** of both scores
- If one enters → that score is valid
- If neither enters → result = "Unknown"
- No disputes over scores — if conflict, just average

### 11.4 Match Lifecycle

```
scheduled → in_progress → completed / score_pending / cancelled
                                │
                           Both teams rate match
                                │
                           ELO updated
```

---

## 12. Tournaments

### 12.1 Who Can Create

- **Owner** (tournament at their ground)
- **Admin** (platform tournaments)
- **Super Admin** (platform tournaments)

### 12.2 Tournament Listing Fee

- **Listing fee required** before tournament becomes visible
- Fee is **dynamic** — set by Super Admin in platform settings
- Creator submits tournament → status: `pending_payment`
- Creator tells admin which number/ID to check payment from
- Admin confirms payment → tournament listed
- Until approved: only creator can see it
- **Free tournaments** allowed if Super Admin/Admin permits

### 12.3 Tournament Flow

```
1. Creator sets up: name, sport, format, max/min teams,
   registration dates, match dates, entry fee (optional),
   prize (optional), ground assignment
2. Submits → pending_payment
3. Payment confirmed → listed
4. Teams register (with entry fee if set)
5. Registration closes → bracket auto-generated
6. Creator can manually edit bracket
7. Matches play out → creator marks winner for each match
8. No-show → opposing team wins
9. Tournament completed → winner declared
```

### 12.4 Tournament Formats

- **Knockout** — single elimination
- **Round Robin** — everyone plays everyone
- **Group + Knockout** — group stage then elimination

### 12.5 Entry Fees

- Optional — creator sets per-team fee
- Fee goes to the **Owner** (ground host)
- If no entry fee = free to join

---

## 13. Chat

### 13.1 Scope

- **Team-level group chat only** (one chat room per team)
- Automatically created when team is created
- Text-only (no images/file sharing at launch)

### 13.2 Rules

- All team members are in the chat
- Captain can remove any member (kicks from team + chat)
- If a Player leaves the team → lose access to chat history
- Chat history preserved forever (text is cheap)
- No read receipts (too expensive)
- No DMs between players
- No ground-level chat

### 13.3 Technical

- Socket.IO real-time messaging (namespace `/chat`)
- REST `GET /api/chat/:teamId` for history
- Push notification for every new message (in-app)
- Future: @mentions with notification

---

## 14. Notifications

### 14.1 Channels

| Channel | At Launch | Future |
|---|---|---|
| **In-app** (Socket.IO + Notification bell) | ✅ | — |
| **Email** | ✅ (Resend, 100/day free) | ✅ |
| **WhatsApp** | ❌ | ✅ (high priority) |
| **SMS** | ❌ | ❌ |

### 14.2 Notification Events

| Event | Recipient | Channel |
|---|---|---|
| Booking confirmed | Player | In-app |
| Booking reminder (2h before) | Player | In-app, Future: WhatsApp |
| Booking cancelled (by player) | Staff/Owner | In-app |
| Booking cancelled (by owner) | Player | In-app |
| New booking received | Staff/Owner | In-app |
| Payment received | Owner | In-app |
| Payment reminder | Player | In-app |
| Ground verified | Owner | In-app + Email |
| Ground rejected + reason | Owner | In-app + Email |
| Team invite | Player | In-app |
| Match request received | Captain | In-app |
| Match request accepted | Captain | In-app |
| Subscription expiring (7d/3d/1d) | Owner | In-app + Email |
| Subscription expired/suspended | Owner | In-app + Email |
| Cash session variance flagged | Owner | In-app |
| Complaint filed | Admin | In-app |
| Complaint resolved | Filer | In-app |
| Staff account created | New staff | Email |
| Welcome email | New user | Email |
| Tournament payment confirmed | Creator | In-app |
| Daily owner digest | Owner | In-app |

### 14.3 Notification UI

- Bell icon in topbar with unread count badge
- Real-time via Socket.IO
- Click bell → dropdown shows last 5 unread with preview
- Click "See All" → full `/notifications` page
- Mark as read on click
- Group similar notifications ("Ahmed, Ali, and 3 others joined your team")
- Notification preferences per role (in-app only / email too / quiet hours)

---

## 15. Complaints System

### 15.1 Categories

| Category | Filed By | Example |
|---|---|---|
| Refund | Player | "Paid PKR 1,500, court unavailable, want refund" |
| Fight / Conflict | Player or Owner | "Aggressive behavior at the ground" |
| Staff Behavior | Player | "Staff was rude / harassing" |
| Player Behavior | Owner | "Abusive to staff" |
| Facilities Issue | Player | "Floodlights not working, court muddy" |
| Double Booking | Player | "Our slot was given to someone else" |
| Payment Issue | Player or Owner | "Charged extra" / "Player didn't pay" |
| Damage | Owner | "Player broke goalpost" |
| No-Show | Owner | "Booked but never came" |
| Other | Anyone | Anything else |

### 15.2 Lifecycle

```
Complaint filed (category + description + evidence images)
        │
        ▼
Admin reviews
  ├── Resolved (with action: refund/warn/ban/compensate/no-action)
  │     └── Filer notified
  └── Reply (admin sends message, complaint stays open)
        └── Filer can respond
```

### 15.3 Admin Actions per Category

| Category | Possible Admin Actions |
|---|---|
| Refund | Process refund (amount, method, notes) |
| Fight | Warn parties, ban player from ground |
| Damage | Set compensation amount, bill player |
| No-Show | Apply penalty (X% of booking) |
| Other | Dismiss with note, or resolve |

### 15.4 Where Complaints Appear

- **Player** — "My Complaints" tab in profile
- **Owner** — "Complaints" tab per ground (only about their ground)
- **Admin/Super Admin** — Global complaints queue, filter by category/status/ground

---

## 16. Ratings & Leaderboard

### 16.1 Match Ratings

After match completes, both teams rate:
- Skill rating (1-5): How competitive?
- Sportsmanship (1-5): Respectful opponents?
- Punctuality (1-5): Showed up on time?
- Optional text review

### 16.2 Ground Reviews

After booking completes, Player rates the ground:
- Court quality (1-5)
- Cleanliness (1-5)
- Facilities (1-5)
- Staff behavior (1-5)
- Text review

Ground shows average rating on detail page.

### 16.3 ELO System

- Both teams start at ELO 1200
- Winner takes points from loser based on ELO difference
- Bigger upset = more points gained/lost
- Sport-specific ELO (separate per sport)
- Displayed on team profile + leaderboard

### 16.4 Player Stats

Accumulated per player:
- Matches played
- Wins / Losses / Draws
- Goals scored / conceded
- Win rate (min 10 matches for leaderboard)
- Per-sport breakdown

### 16.5 Leaderboard

- Top teams by ELO (per sport)
- Top players by win rate (min 10 matches)
- Filter by sport, city, country

---

## 17. Search & Discovery

### 17.1 Location-Based Search

1. User lands → IP detection → country auto-selected
2. Search results show grounds in that country only
3. User can switch country in UI dropdown
4. Within country → filter by city/region
5. Cascading filters: Country → Region → City

### 17.2 Search Fields

- Ground name (text search)
- Sport type (category filter)
- City / Region / Country (cascade)
- Date + time (availability filter)
- Price range (min-max)
- Rating (minimum stars)
- Amenities (floodlights, parking, AC, indoor)
- Open now (based on ground's timezone)

### 17.3 Sort Options

- Featured (default — verified + popular)
- Nearest (requires location permission)
- Rating (highest first)
- Price (low to high / high to low)

### 17.4 Map View

- Full-screen map
- Pins for matching grounds
- Tap pin → popup (name, price, rating)
- Tap popup → ground detail page

### 17.5 Technical

- PostgreSQL full-text search (`tsvector/tsquery`) at launch
- IP to country via free geoip lookup (or Cloudflare headers)
- Ground stores: lat/lng, timezone (derived from Country), city/region/country IDs

---

## 18. Payment Models

### 18.1 Online Payment

| Gateway | Countries | Launch? |
|---|---|---|
| Stripe | Global (cards) | Yes |
| JazzCash | Pakistan | Yes |
| Easypaisa | Pakistan | Yes |

- Super Admin can toggle payment gateways on/off
- When online: Player pays → booking auto-confirmed
- When offline: Manual logging by staff

### 18.2 Offline Payment

Methods that staff can log:
- Cash
- JazzCash (transfer reference)
- Easypaisa (transfer reference)
- Bank Transfer (transaction ID)

Staff records: amount, method, reference ID, recorded by, recorded at.

### 18.3 Payment Toggle

- Super Admin/Admin toggles which payment methods are active globally
- Owner sees activated methods in their ground settings

### 18.4 Subscription Payments

- Monthly invoiced
- Payment can be: online or manual (cash/bank transfer)
- Admin can mark subscription as paid when payment received
- Admin manages subscription lifecycle (activate, suspend, cancel, extend)

---

## 19. Languages & Internationalization

### 19.1 Launch Languages

| Language | Coverage | RTL? |
|---|---|---|
| English | 100% | No |
| Urdu | 100% | Yes |
| Arabic | 100% | Yes |

### 19.2 Future Languages

French, Spanish, Indonesian, Malay, Bengali, Hindi — English fallback until translated.

### 19.3 Implementation

- Library: `next-intl` (standard for Next.js i18n)
- JSON translation files per language
- AI-generated first pass, human proofread
- User can toggle language in Settings
- Auto-detect from browser locale on first visit

### 19.4 RTL Support

- Urdu and Arabic trigger RTL layout
- UI flips: sidebar, text alignment, icons
- CSS logical properties used (`margin-inline-start` instead of `margin-left`)

### 19.5 Locale-Aware Formatting

| Format | Rule |
|---|---|
| Date | Locale-appropriate (`DD/MM/YYYY` for PK, `MM/DD/YYYY` for US) |
| Number | Locale-aware (`1,234.56` vs `1.234,56`) |
| Currency | `PKR 1,500`, `AED 150`, `$10.00` |
| Timezone | Per-country (Asia/Karachi, Asia/Dubai, Europe/London) |

---

## 20. Mobile App

### 20.1 Approach

- **React Native** (separate project folder, NOT in monorepo)
- First tested on **Expo Go** for rapid prototyping
- After stable → native builds for iOS + Android
- Connects to the SAME Express API as the web app
- Developed AFTER web app is stable

### 20.2 Mobile Navigation

**Player Tab Bar (bottom):**
1. Home
2. Bookings
3. Teams
4. Chat
5. More (Profile, Settings, Notifications, Leaderboard)

**Owner Tab Bar (bottom) — contextually different:**
1. Dashboard
2. Bookings (calendar)
3. Cash (session + payments)
4. Staff
5. More (Courts, Schedule, Settings, Reports)

### 20.3 Mobile Patterns

- Bottom sheets for filters, actions, selections
- Floating action buttons for quick actions
- Swipe actions on list items
- Cards dominate layouts
- 44px minimum touch targets
- Pull-to-refresh on all list pages
- Push notifications via Expo Push API

---

## 21. Architecture & Hosting

### 21.1 Hosting Plan

| Component | Provider | Cost |
|---|---|---|
| **Backend + Database** | Oracle Cloud "Always Free" ARM VM | $0/mo |
| **Frontend** | Vercel Free Tier | $0/mo |
| **Domain** | Cloudflare / Namecheap (.com) | ~$10/yr |
| **Images** | Cloudinary Free Tier | $0/mo |
| **Emails** | Resend Free Tier | $0/mo (100/day) |
| **Total** | | **~$0.84/mo** |

### 21.2 Oracle Cloud Specs

- 4 ARM CPU cores
- 24GB RAM
- 200GB storage
- Ubuntu 22.04
- Docker + Docker Compose
- Nginx reverse proxy
- Certbot (SSL)
- PM2 (process manager)

### 21.3 Architecture Diagram

```
Frontend (Vercel)              Backend (Oracle Cloud VPS)
┌──────────────────┐           ┌──────────────────────────────┐
│  playarena.com    │    API    │  Nginx (SSL termination)     │
│  Next.js 16       │◄─────────►│  Express (PM2)               │
│  Vercel CDN       │           │  Socket.IO                   │
│  $0               │           │  node-cron                    │
└──────────────────┘           │  PostgreSQL (Docker volume)   │
                                │  - Daily pg_dump to backup   │
                                │  - Restart: always            │
                                └──────────────────────────────┘
                                          │
Images ─── Cloudinary ($0) ◄──────────────┘
Emails ─── Resend ($0)
```

### 21.4 Growth Path

| Phase | Users | Architecture | Cost |
|---|---|---|---|
| 1 | 0–500 DAU | One VPS (all-in-one) | ~$1/mo |
| 2 | 500–5,000 DAU | Same VPS + upgrade RAM/CPU | ~$5-15/mo |
| 3 | 5,000+ DAU | Separate app + DB servers, Redis, workers | $50-200/mo |

No migrations — all upgrades are additive.

### 21.5 Backup Strategy

```
Daily (cron on VPS, 3 AM):
  pg_dump → gzip → upload to backup (Cloudflare R2 / Google Drive / S3)
  Keep: 7 daily + 4 weekly + 3 monthly
  Auto-delete older than 1 year
```

---

## 22. Cron Jobs

All run via `node-cron` inside the Express process (built-in scheduler, no external dependency).

| Job | What it does | Frequency |
|---|---|---|
| **Auto-cancel unpaid bookings** | Cancel bookings unpaid > X min (configurable per ground) | Every 5 min |
| **Booking reminders** | Notify players 2h before their slot | Every 15 min |
| **Auto-complete past bookings** | Mark completed bookings past end time | Every 30 min |
| **No-show detection** | Flag no-shows if not checked in X min past start | Every 10 min |
| **Subscription expiry** | Suspend expired subs, send 7d/3d/1d reminders | Daily |
| **Trial expiry** | End free trial for owners whose trial is over | Daily |
| **Analytics aggregation** | Build AnalyticsSnapshot for each ground | Daily (midnight) |
| **Cleanup OTPs** | Delete expired OTP codes | Hourly |
| **Cleanup expired invites** | Mark expired team/ground invites | Daily |
| **Cleanup read notifications** | Delete read notifications > 90 days | Weekly |
| **Database backup** | Automated pg_dump | Daily |
| **Close overnight sessions** | Close cash sessions left open past midnight | Daily |

---

## 23. Emails & Notifications

### 23.1 All Email Triggers

| Email | Trigger | From |
|---|---|---|
| Verify Email (OTP) | New signup | System |
| Password Reset | Forgot password | System |
| Booking Confirmation | Booking created | System |
| Booking Reminder (2h) | 2 hours before slot | System |
| Booking Cancelled | Cancelled by owner or player | System |
| Ground Verified | Admin approves ground | System |
| Ground Rejected | Admin rejects ground | System (with reason) |
| Payment Received | Payment logged | System |
| Payment Reminder | Unpaid near start | System |
| Subscription Expiring | 7d/3d/1d before expiry | System |
| Subscription Suspended | Not paid | System |
| New Team Invite | Captain invites | System |
| New Match Request | Challenge sent | System |
| Match Result | Match completed | System |
| Tournament Payment Confirmed | Listing fee paid | System |
| Complaint Filed | New complaint | System |
| Complaint Resolved | Admin resolves | System |
| Account Deletion | User deletes | System |
| Welcome | First signup | System |
| Staff Account Created | Owner creates staff | System |
| Cash Session Variance | Variance flagged | System |

### 23.2 Provider

- **Resend** (free tier: 100 emails/day)
- Node.js SDK via `nodemailer` (already wired)
- Upgrade to $20/mo Resend plan when exceeding 100/day

---

## 24. File Uploads

### 24.1 What Gets Uploaded

| Content | Storage | Max Size | Format |
|---|---|---|---|
| Ground images | Cloudinary | 5MB | jpg, png, webp |
| User avatars | Cloudinary | 2MB | jpg, png, webp |
| Team logos | Cloudinary | 2MB | jpg, png, webp |
| Complaint evidence | Cloudinary | 5MB | jpg, png, webp, pdf |
| Tournament banners | Cloudinary | 5MB | jpg, png, webp |

### 24.2 Provider

**Cloudinary** (free tier: 25GB storage, 25GB CDN bandwidth/month)

### 24.3 Image Processing

- Auto-resize to standard sizes: thumbnail 150x150, medium 800x600
- Maintain aspect ratio
- Strip EXIF data (privacy)
- CDN delivery

---

## 25. Security & Data Privacy

### 25.1 Authentication

- JWT access tokens (15 minute expiry) in HttpOnly cookies
- Refresh tokens (7 day expiry) rotated on use
- OTP for email verification (6 digits, 10 minute expiry)
- bcrypt password hashing (10 rounds)
- Password rules: min 8 chars, 1 uppercase, 1 number, 1 special

### 25.2 Rate Limiting

- Global: 500 requests per 15 minutes per IP
- Applied before route handlers

### 25.3 CORS

- Explicit allowlist — never `*` wildcard with credentials
- Vercel frontend domain + localhost for dev

### 25.4 Data Deletion

- **Soft delete** always — set `deletedAt`, anonymize personal data
- Name → "Deleted User", email → `deleted-uuid@deleted.com`
- Booking records preserved (operational necessity)
- Active bookings auto-cancelled before deletion
- Team captain must transfer or auto-assign before deletion
- Owner must deactivate/transfer each ground first
- Suspension (`isActive: false`) — data preserved, account locked. Can be unbanned.
- No inactive account auto-cleanup

### 25.5 Data Retention

| Data | Retention |
|---|---|
| Bookings | Forever (anonymized) |
| Teams | Forever (anonymized) |
| Chat messages | 90 days |
| Notifications | 90 days |
| Audit logs | 1 year |
| User accounts | Until deletion |
| Cash sessions | Forever |
| Analytics snapshots | Per plan (7d/30d/365d) |

### 25.6 Other Security

- Helmet middleware (HTTP headers)
- Input validation via express-validator on all mutation routes
- Zod for env config validation at startup
- SQL injection: Prisma parameterized queries (Haversine geo: explicit parameter binding)
- File upload validation: type, size, dimensions

---

## 26. Analytics & Reports

### 26.1 Ground Owner Reports

| Report | What it shows |
|---|---|
| Daily Summary | Revenue, bookings, utilization, new vs returning customers |
| Revenue Breakdown | By payment method, sport, court, hour of day |
| Booking Trends | Daily/weekly/monthly trends, peak hours, popular sports |
| Utilization Rate | Per court, per day, trend over time |
| Customer Analytics | New vs returning, booking frequency, average spend |
| Staff Performance | Bookings processed, payments recorded, variance frequency |
| Commission Report | Platform fees deducted, net payout |

### 26.2 Player Stats

| Stat | Source |
|---|---|
| Matches played | Match records |
| Wins/Losses/Draws | Match results |
| Win rate | Calculated (min 10 matches) |
| ELO rating | Per sport |
| Goals scored/conceded | Match stats per player |
| Total spent on bookings | Booking payments |
| Grounds visited | Unique grounds booked |

### 26.3 Platform Analytics (Admin)

| Metric | Source |
|---|---|
| Total users | User count by role |
| User growth | New users per day/week/month |
| Total grounds | By verification status |
| Total bookings | By status, by date |
| Total revenue | Platform commission + subscriptions |
| Revenue by country | Country filter |
| Active subscriptions | By plan, by status |
| Top grounds | By bookings, by revenue |
| Complaints | By category, by status, resolution rate |

### 26.4 Technical

- **Daily aggregation** via cron job (AnalyticsSnapshot model already exists)
- Not real-time queries — pre-computed daily snapshots for performance
- Recharts for chart rendering on frontend
- CSV/PDF export on all report pages

---

## 27. Testing Strategy

### 27.1 Backend (Existing: 245 tests)

- Vitest v4 with mocked Prisma (global mock in `tests/setup.js`)
- Deterministic ID helpers, mock builders with overrides, `clearMocks()` in `beforeEach`
- Coverage: happy path → validation → auth/access control → edge cases → state machines
- Every new module must have matching test file with ≥5 test cases
- All tests must pass before merge

### 27.2 Frontend (New: 0 tests)

- Vitest + React Testing Library
- Every page component tests all 4 states: loading, empty, error, success
- Integration tests for critical flows

### 27.3 E2E (New)

- Playwright for 3 critical flows:
  1. Player signup → browse → book → pay
  2. Owner signup → create ground → verification → receive booking → manage
  3. Staff login → open cash session → check in player → close session
- Run on every PR via GitHub Actions

### 27.4 Order of Implementation

- Backend fixes + tests (parallel track)
- Frontend components + tests (parallel track)
- E2E tests (after both tracks stable)

---

## 28. Design System

### 28.1 Colors

| Token | Value | Usage |
|---|---|---|
| **Primary (Emerald)** | `#10B981` | Buttons, links, active states |
| Primary Hover | `#059669` | Button hover |
| Primary Pressed | `#047857` | Button active |
| Primary Light | `#D1FAE5` | Background tints |
| **Secondary (Indigo)** | `#6366F1` | Secondary actions |
| **Accent (Amber)** | `#F59E0B` | Highlights, warnings |
| Background | `#F8FAFC` | Page background |
| Surface | `#FFFFFF` | Cards, modals, inputs |
| Border | `#E2E8F0` | Borders, dividers |
| Muted Text | `#64748B` | Secondary text |
| Primary Text | `#0F172A` | Headings |
| Secondary Text | `#334155` | Body text |
| Disabled | `#CBD5E1` | Disabled elements |
| Success | `#10B981` | Success states |
| Warning | `#F59E0B` | Warning states |
| Danger | `#EF4444` | Error, delete |
| Info | `#3B82F6` | Information |

### 28.2 Typography

| Usage | Font | Weight |
|---|---|---|
| Headings | Bebas Neue | Bold |
| Body | DM Sans | Regular / Medium |
| Fallback | Inter | — |

**Type Scale:**
- H1: 48px / H2: 40px / H3: 32px / H4: 24px / H5: 20px / H6: 18px
- Body: 16px / Small: 14px / Caption: 12px

### 28.3 Spacing

4px grid: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80
- Card padding: 24-32px
- Section spacing: 48-80px

### 28.4 Border Radius

| Element | Radius |
|---|---|
| Inputs | 14px |
| Buttons | 14px |
| Cards | 20px |
| Modals | 24px |
| Bottom sheets | 24px |

### 28.5 Shadows

| Element | Shadow |
|---|---|
| Cards | `0 8px 24px rgba(15,23,42,0.08)` |
| Modals | `0 20px 60px rgba(15,23,42,0.15)` |

### 28.6 Button Sizes

- Mobile: 48px height
- Desktop: 52px height
- Radius: 14px

### 28.7 Input Sizes

- Height: 52px
- Radius: 14px
- Border: 1px solid `#E2E8F0`
- Focus: Emerald border

### 28.8 Icons

- **Lucide** outlined icons only
- Consistent stroke width
- No filled icon sets
- Replace all emoji icons in current codebase

### 28.9 Sidebar

- **Dark** sidebar (like Stripe, Linear, Supabase)
- Expanded: 240px / Collapsed: 64px
- Hover reveal on collapsed

### 28.10 Animations

Library: **framer-motion**

| Animation | Duration | Usage |
|---|---|---|
| Fade in/out | 250ms | Page transitions (desktop) |
| Slide | 250ms | Page transitions (mobile) |
| Scale in | 200ms | Modal open |
| Button hover | 150ms | 2-4px lift + scale 1.02 |
| Card hover | 250ms | Subtle shadow increase |
| Table row | 150ms | Background highlight |
| Skeleton | — | Shimmer loading |
| Count-up | 500ms | KPI numbers |
| Progress | 350ms | Bar fill animation |
| Toast slide-in | 250ms | Top-right entry |
| Sidebar collapse | 200ms | Smooth width transition |

**Banned:** No playful/bouncy, no excessive/overlapping, no 3D, no confetti/particles.

---

## 29. Public Website

Pages (must-have at launch):

| Page | Contents |
|---|---|
| **Home / Hero** | Value prop, search bar, sport categories, featured grounds, "How it works" |
| **For Players** | How to book, find grounds, join teams, tournaments |
| **For Owners** | How to list grounds, subscription plans, benefits |
| **Pricing** | Plan comparison table for owners |
| **Ground Directory** | Public searchable listing of verified grounds (SEO) |
| **City Pages** | `/lahore`, `/karachi`, `/dubai` — city-specific SEO pages |
| **About** | Mission, team |
| **Contact** | Support form |
| **FAQ** | Common questions |
| **Terms & Privacy** | Legal |
| **Blog** | Future (nice-to-have) |

---

## 30. General Architecture Decisions

### 30.1 Multi-Tenant Model

- **Single global instance** — one codebase, one database
- Country/Region/City hierarchy for data scoping
- IP-based country detection on first visit
- Manual country override in UI

### 30.2 Search Engine

- PostgreSQL full-text search (`tsvector`/`tsquery`)
- Add Meilisearch/Algolia when exceeding ~10,000 grounds

### 30.3 File Storage

- **Cloudinary** for images (free tier: 25GB, CDN, auto-resize)
- Local server storage DO NOT use (d option selected but reconsidered for global)
- Update: Cloudinary confirmed for global CDN delivery

### 30.4 Redis

- **Not required** — Socket.IO operates in-memory
- `REDIS_URL` env var exists but must NOT be imported/used
- Add Redis only when scaling to 1,000+ concurrent Socket.IO connections

### 30.5 Email Provider

- **Resend** (free tier: 100 emails/day)
- Nodemailer already configured — swap SMTP to Resend

### 30.6 Deployment

- VPS: Ubuntu 22.04, Docker, Nginx, Certbot, PM2
- CI/CD: GitHub Actions → build → deploy via SSH/rsync
- Database: PostgreSQL in Docker with volume mount + daily backups

### 30.7 Monorepo vs Separate

- Web frontend + shared package: **monorepo** (existing `playarena-frontend/`)
- Mobile app: **separate project folder** (outside monorepo)
- Backend: **separate folder** (existing `playarena-backend/`)

---

## Version History

| Version | Date | Changes |
|---|---|---|
| v1.0 | 2026-07-31 | Initial complete spec from grilling session |

---

*This document represents all design decisions made during the Product Design Grilling Session. Every topic was discussed, agreed upon, and recorded. Any future changes require a new session.*
