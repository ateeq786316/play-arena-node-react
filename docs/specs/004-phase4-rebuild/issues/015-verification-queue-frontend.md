# 015 — Verification Queue Frontend

**Type:** AFK | **Blocked by:** 013

## What to build

Build the admin verification queue page at `/admin/grounds/verification`. Shows a DataTable of pending grounds: Ground Name, Owner Name, Owner Email, Submitted Date, Days Ago columns. Each row has inline [Approve] and [Reject] buttons. [Reject] opens a Modal with a textarea for the rejection reason. On Approve: toast "Ground verified", row removed from queue. On Reject: toast "Ground rejected with reason", row removed. Empty state when no pending grounds: illustration + "All grounds have been reviewed". Error state: error card with retry. Loading state: skeleton table. The page polls every 30 seconds for new pending items.

## Acceptance criteria

- [ ] Pending grounds table with all columns
- [ ] Approve button works with confirmation toast
- [ ] Reject button opens modal with reason textarea
- [ ] Empty state shown when no pending grounds
- [ ] Error state with retry button
- [ ] Loading skeleton on page load
- [ ] 30-second auto-refresh for new items
