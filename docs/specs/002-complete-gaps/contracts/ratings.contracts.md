# Rating Module — API Contracts

**Base path**: `/api/ratings`

---

## GET `/leaderboard`
- **Auth**: Public
- **Response 200**: `{ teams: Team[] }` — ordered by ELO descending

## GET `/leaderboard/:sportId`
- **Auth**: Public
- **Response 200**: `{ teams: Team[] }` — sport-filtered leaderboard

## GET `/players/:id/stats`
- **Auth**: Public
- **Response 200**: `{ stats: PlayerStat }`

## POST `/matches/:id/rating`
- **Auth**: JWT (participant in match)
- **Body**: `{ skillRating: 1-5, sportsmanshipRating: 1-5, punctualityRating: 1-5, reviewText?: string }`
- **Response 201**: `{ message: "Rating submitted", rating: MatchRating }`

## POST `/matches/:id/player-stats`
- **Auth**: JWT (participant in match)
- **Body**: `{ goals, assists, yellowCards, redCards, motm }`
- **Response 200**: `{ result: PlayerMatchStat }`

---

## Key Types
```typescript
type PlayerStat = {
  id: string;
  userId: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  goalsScored: number;
  goalsConceded: number;
  createdAt: string;
  updatedAt: string;
};

type MatchRating = {
  id: string;
  matchId: string;
  reviewerId: string;
  skillRating: number;        // 1-5
  sportsmanshipRating: number; // 1-5
  punctualityRating: number;   // 1-5
  reviewText: string | null;
  createdAt: string;
};

type PlayerMatchStat = {
  id: string;
  matchId: string;
  playerId: string;
  teamId: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  motm: boolean;
};
```
