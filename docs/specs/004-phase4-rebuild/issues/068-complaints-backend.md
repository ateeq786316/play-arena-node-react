# 068 — Complaints Backend

**Type:** AFK | **Blocked by:** 007

## What to build

Build backend endpoints for the complaints system. Model already exists (`Dispute` with type, reason, description, evidence, status). Reuse or create new endpoints:

- `POST /api/complaints` — file complaint (category, description, evidence images, bookingId optional). Auth required. Available to all roles.
- `GET /api/complaints/my` — list my complaints (filer's own). Auth required.
- `GET /api/complaints/ground/:groundId` — complaints about a specific ground (owner/manager view). Auth required.
- `GET /api/admin/complaints` — all complaints (admin/super admin). Filter by status, category, date range.
- `PATCH /api/admin/complaints/:id/status` — update status (under_review/resolved/dismissed). Includes resolution text, action type (refund/warn/ban/compensate/no-action).
- `POST /api/admin/complaints/:id/reply` — reply to filer.

Add `filedById` and `resolvedById` relations. Write tests for all endpoints covering auth, validation, and state transitions.

## Acceptance criteria

- [ ] File complaint endpoint with category, description, evidence
- [ ] My complaints list endpoint
- [ ] Ground complaints list (owner view)
- [ ] Admin complaints list with filters
- [ ] Status update endpoint with resolution/action
- [ ] Reply endpoint
- [ ] Tests pass for all endpoints
