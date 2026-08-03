# 051 — Admin Ground Management

**Type:** AFK | **Blocked by:** 009

## What to build

Build **Admin Ground Management** at `/admin/grounds`. **DataTable**: Ground Name, Owner Name, Owner Email, City, Sport Types, Verification Status badge, Active toggle, Bookings Count, Actions. **Search**: by name. **Filter**: by verification status, city, sport. **Row Actions**: [View Detail], [Approve] / [Reject] (if pending), [Suspend] / [Unsuspend] (toggle active), [Delete] (soft delete).

**Ground Detail Drawer** (or page): ground info, owner info, courts list, images, recent bookings, revenue summary. [Approve] and [Reject] actions with optional note.

**Bulk Actions**: select multiple → [Approve Selected] [Reject Selected] [Suspend Selected].

## Acceptance criteria

- [ ] Ground list table with search, filter, pagination
- [ ] Verification queue inline actions (approve/reject)
- [ ] Suspend/unsuspend toggle
- [ ] Detail drawer with ground info and recent activity
- [ ] Bulk actions for verification
- [ ] All actions have confirmation and toast feedback
