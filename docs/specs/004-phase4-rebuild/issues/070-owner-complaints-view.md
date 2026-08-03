# 070 — Owner Complaints View

**Type:** AFK | **Blocked by:** 068

## What to build

Build complaints view for ground owners at `/grounds/:id/complaints`. **DataTable** of complaints about this ground: Category badge, Filer Name, Description (truncated), Status badge, Date, Actions [View]. **Detail Drawer**: full complaint, evidence images, filer info, admin replies. **Owner Action**: [Add Response] (text input → adds note visible to admin and filer). Owner cannot resolve or dismiss — only admin can. Empty state: "No complaints about this ground." Loading skeleton, error state.

## Acceptance criteria

- [ ] Complaints list table for the ground
- [ ] Detail drawer with evidence and timeline
- [ ] Owner can add response (not resolve)
- [ ] Loading, error, empty states
