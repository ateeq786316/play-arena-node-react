# 058 — Admin Management

**Type:** AFK | **Blocked by:** 009

## What to build

Build **Admin Management** at `/admin/admins`. Only accessible by Super Admin. **DataTable**: Admin Name, Email, Role (Admin/Super Admin badge), Last Active, Actions. **Promote to Admin** section: search user by name/email → select → confirm → user role changes to `admin`. **Row Actions**: [Demote to Player] (ConfirmDialog, changes role to `player`), [Grant Super Admin] / [Revoke Super Admin] (toggle). **Audit per Admin** button: opens timeline of all actions by that admin (links to audit logs filtered by admin ID).

## Acceptance criteria

- [ ] Admin list table with roles
- [ ] Promote user to admin flow
- [ ] Demote admin to player with confirmation
- [ ] Grant/revoke super admin
- [ ] Per-admin audit view
- [ ] Loading, error, empty states
