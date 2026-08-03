# Matchmaking Module — API Contracts

**Base path**: `/api/matches`

---

## GET `/requests/sent/:teamId`
- **Auth**: JWT (team member)
- **Response 200**: `{ challenges: MatchRequest[] }`

## GET `/requests/received/:teamId`
- **Auth**: JWT (team member)
- **Response 200**: `{ challenges: MatchRequest[] }`

## POST `/requests/:teamId`
- **Auth**: JWT (captain/co-captain)
- **Body**: `{ opponentTeamId, groundId?, proposedDate?, message?, expiresAt? }`
- **Response 201**: `{ message: "Challenge sent", challenge: MatchRequest }`

## PATCH `/requests/:id/accept`
- **Auth**: JWT (opponent captain/co-captain)
- **Response 200**: `{ message: "Challenge accepted", match: TeamMatch }`

## PATCH `/requests/:id/reject`
- **Auth**: JWT (opponent captain/co-captain)
- **Response 200**: `{ message: "Challenge rejected" }`

## PATCH `/requests/:id/cancel`
- **Auth**: JWT (challenger captain/co-captain)
- **Response 200**: `{ message: "Challenge cancelled" }`

## GET `/:teamId`
- **Auth**: JWT (team member)
- **Response 200**: `{ matches: TeamMatch[] }`

## GET `/detail/:id`
- **Auth**: JWT (team member from either team)
- **Response 200**: `{ match: TeamMatch }`

## PATCH `/:id/score`
- **Auth**: JWT (team member from either team)
- **Body**: `{ scoreChallenger: int, scoreOpponent: int }`
- **Response 200**: `{ message: "Score submitted", match: TeamMatch }`

## PATCH `/:id/start`
- **Auth**: JWT (team member from either team)
- **Response 200**: `{ message: "Match started", match: TeamMatch }`

## PATCH `/:id/cancel`
- **Auth**: JWT (team member from either team)
- **Response 200**: `{ message: "Match cancelled" }`

---

## Key Types
```typescript
enum MatchRequestStatus { pending, accepted, rejected, cancelled, expired }
enum MatchStatus { scheduled, in_progress, completed, cancelled, score_pending }

type MatchRequest = {
  id: string;
  challengerTeamId: string;
  opponentTeamId: string;
  groundId: string | null;
  proposedDate: string | null;  // ISO date
  status: MatchRequestStatus;
  message: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type TeamMatch = {
  id: string;
  matchRequestId: string | null;
  challengerTeamId: string;
  opponentTeamId: string;
  groundId: string | null;
  scheduledDate: string | null;
  status: MatchStatus;
  scoreChallenger: number | null;
  scoreOpponent: number | null;
  scoreSubmittedBy: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
```
