# 038 — Player Home Dashboard

**Type:** AFK | **Blocked by:** 009

## What to build

Build player home dashboard at `/home` (for `role: "player"`). **Welcome header** with player name. **Next Up** card: next booking with countdown, or "No upcoming bookings" with CTA. **Quick Stats row**: matches played, win rate (if min 10 matches), teams joined, tournaments participated. **Recommended Grounds** grid: 3 grounds based on player's city and past bookings (or featured if no history). **Pending Items** section: team invites count, match requests count, unread notifications count — each links to relevant page. **Recent Activity** feed: last 5 activities (booking confirmed, team invite received, match completed, etc.). All 4 states: loading skeletons, error with retry, empty (new player with no history), success. Role-gated: only shown to players, owners see their own dashboard.

## Acceptance criteria

- [ ] Welcome header with player name
- [ ] Next Up card with countdown or empty state CTA
- [ ] Quick stats row with match data
- [ ] Recommended grounds grid
- [ ] Pending items section with counts
- [ ] Recent activity feed
- [ ] Loading, error, empty states
- [ ] Only visible to Player role
