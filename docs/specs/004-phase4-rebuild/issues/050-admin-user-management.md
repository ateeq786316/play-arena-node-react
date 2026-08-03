# 050 — Admin User Management

**Type:** AFK | **Blocked by:** 009

## What to build

Build **Admin User Management** at `/admin/users`. **DataTable**: Name, Email, Mobile, Role (badge), Verified, Auth Provider, Joined Date, Actions. **Search**: by name/email/mobile. **Filter**: by role dropdown. **Row Actions**: [View Profile], [Reset Password] (modal → new password input → confirm), [Suspend] / [Unsuspend] (toggle), [Delete] (soft delete with ConfirmDialog).

**User Detail** at `/admin/users/[id]`: Profile card (name, email, role, avatar, joined date, last login). Stats: bookings count, teams count, grounds count (if owner). Activity: recent actions. Account actions: Change Role (dropdown, with confirmation), Reset Password, Suspend/Unsuspend, Delete.

## Acceptance criteria

- [ ] User list table with search, filter, pagination
- [ ] Row actions: view, reset password, suspend, delete
- [ ] User detail page with stats and actions
- [ ] Change role with confirmation
- [ ] All actions have loading/error states
- [ ] Audit log entries for all admin actions
