# 041 — Tournaments (Player)

**Type:** AFK | **Blocked by:** 009

## What to build

Build tournament pages for players. **Tournaments Browse** at `/tournaments`: list of upcoming/ongoing/completed tournaments. Card: name, sport, format badge, registration dates, team count vs max, entry fee (if any), [View] [Register Team] buttons.

**Tournament Detail** at `/tournaments/[id]`: info header, teams registered table, **Bracket View** (visual bracket tree for knockout, or group table for round robin). **Register Team** flow: select one of my teams → confirm registration → if entry fee, show payment instructions. **My Tournaments** tab: tournaments I've registered for, with status and bracket progress.

## Acceptance criteria

- [ ] Browse tournaments with filters (sport, status, date)
- [ ] Tournament detail with bracket view
- [ ] Register team flow with team selector
- [ ] Entry fee handling (show fee, payment instructions)
- [ ] My Tournaments list
- [ ] Loading, error, empty states
