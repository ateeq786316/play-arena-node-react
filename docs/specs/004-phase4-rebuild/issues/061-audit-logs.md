# 061 — Audit Logs

**Type:** AFK | **Blocked by:** 009

## What to build

Build **Audit Logs** at `/admin/audit-logs`. **DataTable**: Timestamp, Admin Name, Action (e.g., "ground_verified", "user_suspended", "plan_created"), Entity (e.g., "Ground", "User"), Entity ID, Details (truncated), IP Address. **Filters**: by admin user (dropdown), by action type (dropdown), by entity type, by date range. **Row click** → detail drawer showing: full action description, old value → new value (if applicable), full metadata JSON, user agent. **Export**: CSV of filtered results. **Retention notice**: "Logs older than 1 year are automatically deleted." Loading skeleton, empty state "No audit logs matching filters."

## Acceptance criteria

- [ ] Audit log table with all columns
- [ ] Filters for admin, action, entity, date range
- [ ] Detail drawer with old/new values and metadata
- [ ] CSV export
- [ ] Retention notice displayed
- [ ] Loading, error, empty states
