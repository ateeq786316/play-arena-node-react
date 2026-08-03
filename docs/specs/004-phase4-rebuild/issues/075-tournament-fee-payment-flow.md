# 075 — Tournament Fee Payment Flow

**Type:** AFK | **Blocked by:** 074

## What to build

Build the tournament fee payment UI. **Owner/Admin tournament creation** flow:
1. Create tournament form (name, sport, format, dates, etc.)
2. After creation → "Your tournament is in draft. Submit for listing?" → [Submit for Listing] button
3. Shows listing fee amount (from PlatformSettings) → "Fee: PKR X. Tell the admin your payment reference."
4. Tournament status changes to `pending_payment`

**Admin payment confirmation** at `/admin/tournaments/pending-payment`: DataTable of tournaments awaiting payment. Columns: Tournament Name, Creator, Fee Amount, Created Date. Row Actions: [Mark Paid] (ConfirmDialog → optional note → tournament becomes `listed`), [Reject] (with reason → status back to `draft`). Empty state: "All tournaments confirmed."

**Creator notification**: when payment confirmed, creator receives in-app notification "Your tournament is now listed!"

## Acceptance criteria

- [ ] Submit for listing button on tournament detail (creator view)
- [ ] Shows listing fee amount
- [ ] Admin payment confirmation table
- [ ] Mark paid / reject actions
- [ ] Notification sent on confirmation
- [ ] Loading, error, empty states
