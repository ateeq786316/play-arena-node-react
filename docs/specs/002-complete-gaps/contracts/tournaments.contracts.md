# Tournament Module — API Contracts

**Base path**: `/api/tournaments`

---

## POST `/`
- **Auth**: JWT
- **Body**: `{ name, sport, format, groundId?, maxTeams?, minTeams?, registrationStarts?, registrationEnds?, startDate?, endDate?, description?, rules? }`
- **Response 201**: `{ message: "Tournament created", tournament: Tournament }`

## GET `/`
- **Auth**: Public
- **Query**: `sport?: string, status?: string, format?: string`
- **Response 200**: `{ tournaments: Tournament[] }`

## GET `/my`
- **Auth**: JWT
- **Response 200**: `{ tournaments: Tournament[] }`

## GET `/:id`
- **Auth**: Public
- **Response 200**: `{ tournament: Tournament }`

## PATCH `/:id`
- **Auth**: JWT (owner only)
- **Body**: Partial Tournament fields
- **Response 200**: `{ message: "Tournament updated", tournament: Tournament }`

## DELETE `/:id`
- **Auth**: JWT (owner only)
- **Response 200**: `{ message: "Tournament deleted" }`

## POST `/:id/register`
- **Auth**: JWT (captain/co-captain)
- **Body**: `{ teamId: string }`
- **Response 201**: `{ message: "Team registered", result: TournamentTeam }`

## POST `/:id/withdraw`
- **Auth**: JWT (captain/co-captain)
- **Body**: `{ teamId: string }`
- **Response 200**: `{ result }`

## GET `/:id/bracket`
- **Auth**: Public
- **Response 200**: `TournamentMatch[]` (flat array, organized by round on frontend)

## GET `/:id/standings`
- **Auth**: Public
- **Response 200**: `{ standings: TournamentTeam[] }`

## POST `/:id/matches/:matchId/result`
- **Auth**: JWT (tournament owner)
- **Body**: `{ winnerId: string, score1?: int, score2?: int }`
- **Response 200**: `{ message: "Result recorded", result }`

## POST `/:id/generate-bracket`
- **Auth**: JWT (tournament owner)
- **Response 200**: `{ message?, bracket? }` or `TournamentMatch[]`

---

## Key Types
```typescript
enum TournamentFormat { knockout, round_robin, group_knockout }
enum TournamentStatus { upcoming, registration_open, registration_closed, ongoing, completed, cancelled }
enum TournamentMatchStatus { scheduled, in_progress, completed, cancelled }

type Tournament = {
  id: string;
  name: string;
  sport: string;
  format: TournamentFormat;
  status: TournamentStatus;
  groundId: string | null;
  maxTeams: number;
  minTeams: number;
  registrationStarts: string | null;
  registrationEnds: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  rules: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

type TournamentTeam = {
  id: string;
  tournamentId: string;
  teamId: string;
  seed: number | null;
  group: string | null;
  points: number;
  played: number;
  won: number;
  lost: number;
  drawn: number;
  goalsFor: number;
  goalsAgainst: number;
};

type TournamentMatch = {
  id: string;
  tournamentId: string;
  round: number;
  matchIndex: number;
  team1Id: string | null;
  team2Id: string | null;
  winnerId: string | null;
  score1: number | null;
  score2: number | null;
  status: TournamentMatchStatus;
  scheduledDate: string | null;
  groundId: string | null;
  courtId: string | null;
  playedAt: string | null;
};
```
