# Team Module — API Contracts

**Base path**: `/api/teams`

---

## GET `/sports`
- **Auth**: Public
- **Response 200**: `{ categories: SportCategory[] }`

## GET `/`
- **Auth**: Public
- **Query**: `sport?: string, cityId?: string`
- **Response 200**: `{ teams: Team[] }`

## GET `/my`
- **Auth**: JWT
- **Response 200**: `{ teams: Team[] }`

## GET `/:id`
- **Auth**: JWT
- **Response 200**: `{ team: Team }`

## POST `/`
- **Auth**: JWT (auto-sets captainId = req.userId)
- **Body**: `{ name, sport, cityId?, logo?, description? }`
- **Response 201**: `{ message: "Team created", team: Team }`

## PATCH `/:id`
- **Auth**: JWT (captain only)
- **Body**: Partial Team fields
- **Response 200**: `{ message: "Team updated", team: Team }`

## DELETE `/:id`
- **Auth**: JWT (captain only)
- **Response 200**: `{ message: "Team deleted" }`

## GET `/:id/members`
- **Auth**: JWT (team member)
- **Response 200**: `{ members: TeamMember[] }`

## PATCH `/:id/members/:uid`
- **Auth**: JWT (captain only)
- **Body**: `{ role: "captain"|"co_captain"|"player" }`
- **Response 200**: `{ message: "Role updated", result }`

## DELETE `/:id/members/:uid`
- **Auth**: JWT (captain only)
- **Response 200**: `{ message: "Member removed" }`

## DELETE `/:id/members/me`
- **Auth**: JWT (member)
- **Response 200**: `{ message: "Left team" }`

## PATCH `/:id/transfer-captaincy/:uid`
- **Auth**: JWT (current captain)
- **Response 200**: `{ message?, team? }`

## POST `/:id/invite`
- **Auth**: JWT (captain/co-captain)
- **Body**: `{ userId: string }`
- **Response 201**: `{ message: "Invite sent", invite: TeamInvite }`

## POST `/:id/join-request`
- **Auth**: JWT
- **Response 201**: `{ message: "Join request sent", request: JoinRequest }`

## GET `/:id/join-requests`
- **Auth**: JWT (captain/co-captain)
- **Response 200**: `{ requests: JoinRequest[] }`

## POST `/:id/join-requests/:uid/accept`
- **Auth**: JWT (captain/co-captain)
- **Response 200**: `{ message?, member? }`

## POST `/:id/join-requests/:uid/reject`
- **Auth**: JWT (captain/co-captain)
- **Response 200**: `{ message: "Request rejected", result? }`

## GET `/:id/stats`
- **Auth**: JWT (team member)
- **Response 200**: `{ stats }`

## GET `/:id/rating-history`
- **Auth**: JWT (team member)
- **Response 200**: `{ history: TeamRatingHistory[] }`

## POST `/join/:id`
- **Auth**: JWT (accept invite by id)
- **Response 200**: `{ message?, member? }`

## DELETE `/join/:id`
- **Auth**: JWT (reject invite by id)
- **Response 200**: `{ message: "Invite rejected" }`

---

## Key Types
```typescript
type Team = {
  id: string;
  name: string;
  sport: string;
  cityId: string | null;
  logo: string | null;
  description: string | null;
  elo: number;            // default 1200
  captainId: string;
  createdAt: string;
  updatedAt: string;
  members?: TeamMember[];
};

type TeamMember = {
  id: string;
  teamId: string;
  userId: string;
  role: "captain" | "co_captain" | "player";
  joinedAt: string;
  user?: User;
};

enum TeamRole { captain, co_captain, player }
enum InviteStatus { pending, accepted, rejected, expired }
enum JoinRequestStatus { pending, accepted, rejected }
```
