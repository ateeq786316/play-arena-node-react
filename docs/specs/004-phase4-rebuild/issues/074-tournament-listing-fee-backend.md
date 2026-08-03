# 074 — Tournament Listing Fee Backend

**Type:** AFK | **Blocked by:** 007

## What to build

Add tournament listing fee logic. Add `listingStatus` enum to Tournament model: `draft`, `pending_payment`, `listed`, `cancelled`. Add `listingFee` and `paymentConfirmedAt` fields. Create endpoints:

- `PATCH /api/admin/tournaments/:id/confirm-payment` — admin confirms payment, sets status to `listed`
- `GET /api/admin/tournaments/pending-payment` — list tournaments awaiting payment confirmation

Modify tournament creation: after creation, status is `draft`. Creator can submit for listing → status becomes `pending_payment`. Tournament is only visible in public browse if `listingStatus: "listed"`. Creator can see their own draft/pending tournaments. Admin sees all. Default listing fee from PlatformSettings. Write tests.

## Acceptance criteria

- [ ] Tournament.listingStatus enum added
- [ ] Submit for listing → pending_payment
- [ ] Admin confirms payment → listed
- [ ] Only listed tournaments visible to public
- [ ] Admin pending-payment queue endpoint
- [ ] Tests pass for all transitions
