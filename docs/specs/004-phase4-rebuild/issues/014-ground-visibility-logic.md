# 014 — Ground Visibility Logic

**Type:** AFK | **Blocked by:** 012

## What to build

Modify the public ground listing and search endpoints (`GET /api/grounds`, `GET /api/grounds/featured`, `GET /api/grounds/search`) to only return grounds with `verificationStatus: "approved"`. The owner's private endpoint (`GET /api/grounds/my`) continues to return all their grounds regardless of status. Ground detail (`GET /api/grounds/:id`) allows access to: anyone if status is `approved`, owner only if not approved (show 404 or access denied for others). Update `GroundService` and `GroundRepo` accordingly. Write tests for visibility rules across all roles.

## Acceptance criteria

- [ ] Public search/listing only returns approved grounds
- [ ] Owner can see all their grounds (pending/approved/rejected) in My Grounds
- [ ] Ground detail page accessible to public only if approved
- [ ] Non-approved ground returns 404 or access denied for non-owner
- [ ] Tests verify visibility for Player, Owner, Admin, anonymous user
