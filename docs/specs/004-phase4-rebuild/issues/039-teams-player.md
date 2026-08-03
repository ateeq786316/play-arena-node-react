# 039 — Teams (Player)

**Type:** AFK | **Blocked by:** 009

## What to build

Build team management pages for players. **My Teams** at `/teams`: list of teams the player belongs to (as card grid). Each card: team name, sport badge, member count, ELO rating, role badge (Captain/Vice-Captain/Player), [View] button. **Pending Invites** section (if captain): count badge, list of invites with [Accept] [Reject]. **Create Team** button → form at `/teams/create`: team name *, sport (dropdown) *, city, description, logo upload. Creator becomes Captain.

**Team Detail** at `/teams/[id]`: **Members tab** with DataTable (name, role badge, joined date, actions [Promote to Vice-Captain] [Remove] for Captain), **Stats tab** (match history, ELO trend, win/loss/draw), **Join Requests tab** (if open join: list with [Accept] [Reject]), **Settings tab** (change name, sport, description, logo, open/close join requests, disband team). Leave Team button (if not captain). Captain can transfer captaincy.

## Acceptance criteria

- [ ] My Teams list with card grid
- [ ] Pending invites with accept/reject
- [ ] Create Team form with validation
- [ ] Team Detail with Members/Stats/Requests/Settings tabs
- [ ] Captain actions: promote, remove, transfer captaincy, disband
- [ ] Leave team (if not captain)
- [ ] Loading, error, empty states
