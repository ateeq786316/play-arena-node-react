# 016 — Owner Verification Status UI

**Type:** AFK | **Blocked by:** 013

## What to build

Add verification status display components to the Owner's ground views. In **My Grounds** list: each ground card shows a Badge — `pending` (Amber "Pending"), `approved` (Green "Verified"), `rejected` (Red "Rejected - tap for reason"). In **Ground Detail** page: header shows the same badge prominently. If `rejected`, show a Callout/Card with the rejection reason from `verificationNote` and a [Resubmit] button. Resubmit triggers `POST /api/grounds/:id/resubmit` and shows a loading state, then reverts to pending badge. If `pending`, show "You'll be notified when this ground is reviewed" with estimated time.

## Acceptance criteria

- [ ] My Grounds cards show verification badge with correct colors
- [ ] Ground Detail header shows verification badge
- [ ] Rejected state shows rejection reason + resubmit button
- [ ] Resubmit flow works with loading state
- [ ] Pending state shows informational message
