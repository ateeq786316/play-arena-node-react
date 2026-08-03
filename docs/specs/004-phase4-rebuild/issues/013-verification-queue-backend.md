# 013 — Verification Queue Backend

**Type:** AFK | **Blocked by:** 007, 012

## What to build

Add three admin endpoints and one owner endpoint:

- `GET /api/admin/grounds/pending` — returns paginated list of grounds with `verificationStatus: "pending"`, sorted oldest first. Includes owner name, email, submission date, ground details.
- `PATCH /api/admin/grounds/:id/verify` — sets `verificationStatus: "approved"`, `verifiedAt: now()`, `verifiedById: req.userId`. Creates audit log entry. Triggers notification to owner.
- `PATCH /api/admin/grounds/:id/reject` — requires `reason` in body. Sets `verificationStatus: "rejected"`, `verificationNote: reason`. Creates audit log. Triggers notification to owner with rejection reason.
- `POST /api/grounds/:id/resubmit` — owner endpoint. Sets `verificationStatus: "pending"`, clears `verificationNote`. Only allowed if current status is `"rejected"`.

All endpoints protected by appropriate RBAC middleware. Write tests for all 4 endpoints covering happy path, validation errors, auth errors, and state machine transitions (can't approve already approved, can't resubmit already pending, etc.).

## Acceptance criteria

- [ ] `GET /api/admin/grounds/pending` returns pending grounds sorted by oldest first
- [ ] `PATCH /api/admin/grounds/:id/verify` approves ground with timestamp and admin ID
- [ ] `PATCH /api/admin/grounds/:id/reject` rejects with reason, requires body.reason
- [ ] `POST /api/grounds/:id/resubmit` resets to pending (only from rejected state)
- [ ] All endpoints return 403 for unauthorized roles
- [ ] State machine enforced: can't approve approved, can't reject rejected, etc.
- [ ] Audit log entries created for all actions
- [ ] Tests pass for all 4 endpoints
