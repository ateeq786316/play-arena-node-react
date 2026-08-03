# 010 — Role-Gated Navigation

**Type:** AFK | **Blocked by:** 009

## What to build

Replace the current single sidebar with a **dynamic sidebar** that renders different nav items based on `user.role`. Create three nav configs:

- **Player nav**: Home, Bookings, Teams, Matches, Tournaments, Leaderboard, Chat, Notifications, Profile
- **Owner nav**: Dashboard, Grounds, Bookings, Finance, Subscriptions, Analytics, CRM, Pricing, Notifications, Profile, Staff
- **Admin/Super Admin nav**: Dashboard, Users, Grounds, Bookings, Teams, Complaints, Broadcast, Finance Reports, Settings

Also build a **mobile bottom navigation bar** (shown on <768px) with role-contextual tabs and an active indicator. The sidebar becomes a slide-in drawer on mobile with backdrop overlay. The topbar shows the hamburger menu to toggle the drawer. Both sidebar and bottom nav use Lucide icons.

## Acceptance criteria

- [ ] Sidebar shows correct nav items per role
- [ ] Active route highlighted with Emerald indicator
- [ ] Collapsed state (64px) shows only icons with hover tooltip
- [ ] Mobile view (<768px): bottom nav bar with 5 tabs per role
- [ ] Mobile: sidebar becomes slide-in drawer with backdrop
- [ ] All icons use Lucide (replacing current emojis)
- [ ] Dark sidebar styling applied
