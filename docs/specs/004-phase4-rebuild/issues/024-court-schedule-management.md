# 024 — Court + Schedule Management

**Type:** AFK | **Blocked by:** 010

## What to build

Build court management page at `/grounds/:id/courts`. **Courts DataTable**: Court Name, Sport (dropdown from SportCategories), Base Price (PKR), Price/Hour (PKR), Deposit (PKR), Max Players, Amenities (tags), Active toggle, Actions [Edit] [Delete]. Create/Edit Court Modal with all fields, sport dropdown. Bulk actions: Export CSV.

Build schedule management page at `/grounds/:id/schedule`. **Weekly Grid Table**: Day (Mon-Sun), Open Time, Close Time, Slot Duration (min), Active toggle, Actions [Edit]. Bulk edit buttons: [Copy Monday to Weekdays] [Copy to All Days]. Edit Schedule Modal for single day. Special Closures section: add date + reason (ground closed that day), Maintenance Closures section: add date range + affected courts selection.

## Acceptance criteria

- [ ] Court DataTable with sortable columns and inline actions
- [ ] Create/Edit court modal with all fields and validation
- [ ] Delete court with ConfirmDialog (soft delete)
- [ ] Schedule weekly grid with edit per day
- [ ] Bulk copy schedule buttons work
- [ ] Special closures and maintenance closures sections
- [ ] Loading, error, empty states for both pages
