# 053 — Admin Complaint Queue

**Type:** AFK | **Blocked by:** 009

## What to build

Build **Admin Complaint Management** at `/admin/complaints`. **DataTable**: ID, Category badge, Filer Name, Ground (if applicable), Status badge, Created Date, Actions. **Filter**: by category, status, date range. **Row Actions**: [View], [Assign to Me]. **Detail Drawer**: complaint description, evidence images (if any), filer info, booking info (if linked), status timeline. **Actions at bottom**: [Mark Under Review], [Resolve] (opens modal: action type dropdown (Refund / Warn / Ban / Compensate / No Action), resolution notes), [Dismiss] (opens modal: reason), [Reply] (opens text input → sends message back to filer). Status badges: pending/amber, under_review/purple, resolved/green, dismissed/red.

## Acceptance criteria

- [ ] Complaints table with all filters
- [ ] Detail drawer with evidence, timeline, filer info
- [ ] Resolve modal with action type and notes
- [ ] Dismiss modal with reason
- [ ] Reply to filer
- [ ] Status badges with colors
- [ ] Loading, error, empty states
