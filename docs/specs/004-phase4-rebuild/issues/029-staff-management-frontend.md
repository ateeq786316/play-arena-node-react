# 029 — Staff Management Frontend

**Type:** AFK | **Blocked by:** 010

## What to build

Build the staff management page at `/grounds/:id/staff`. **Staff DataTable**: Name, Email, Role (Manager/Staff badge), Status (Active/Inactive), Last Login (relative time), Sessions Today (count), Actions [View] [Revoke]. **Invite Staff** button → Modal with form: Role (Manager/Staff), Name *, Email *, Password (auto-generated, shown once with copy button), Phone, **Permissions Override** section (listed as toggles): Can Create Bookings ✅, Can Cancel Bookings ✅, Can Record Payments ✅, Can Open/Close Cash Session (Manager only), Can View Finance (Manager only), Can Manage Staff (Manager only).

**Staff Detail Drawer**: slides in from right with profile info, today's activity log (bookings created, payments recorded), performance metrics (variance count this month, bookings processed). **Revoke Access** button → ConfirmDialog → immediate deactivation → row updates to Inactive.

## Acceptance criteria

- [ ] Staff list table with all columns and status badges
- [ ] Invite modal with all fields, auto-generated password
- [ ] Permission overrides default to Manager/Staff sensible defaults
- [ ] Detail drawer with profile and performance metrics
- [ ] Revoke with confirmation, updates UI immediately
- [ ] Loading, error, empty states
