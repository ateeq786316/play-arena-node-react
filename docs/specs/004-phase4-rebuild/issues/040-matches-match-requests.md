# 040 — Matches & Match Requests

**Type:** AFK | **Blocked by:** 009

## What to build

Build match management pages. **My Matches** at `/matches`: tabs for Upcoming/Live/Completed. Match cards: opponent team name, sport, ground (if set), date/time, status badge, score (if completed). **Match Detail** at `/matches/[id]`: teams with logos, scores, ground info, timeline (scheduled → in_progress → completed), player stats per team, ratings.

**Send Challenge** at `/matches/challenge`: search teams by name/sport → select opponent → set proposed date, time, ground (optional), message → send challenge request. **Match Requests** section: incoming requests list with [Accept] [Reject] buttons + optional message. Outgoing requests list with status (pending/accepted/rejected/cancelled/expired) and [Cancel] if pending.

**Score Entry**: after match, both captains enter scores. If both enter → average. If one enters → that score wins. If neither → "Unknown". Each captain sees the other's score entry status (entered/pending).

## Acceptance criteria

- [ ] My Matches with upcoming/live/completed tabs
- [ ] Match detail with teams, scores, timeline
- [ ] Send challenge flow with team search
- [ ] Accept/reject incoming match requests
- [ ] Score entry per captain with conflict resolution (average)
- [ ] Loading, error, empty states per section
