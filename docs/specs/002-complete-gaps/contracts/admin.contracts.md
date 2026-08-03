# Admin Module — API Contracts

**Base path**: `/api/admin`

All routes require JWT auth + admin role (`User.role === "admin"`).

---

## GET `/users`
- **Auth**: JWT (admin)
- **Query**: `search?, role?, isVerified?, page?, limit?`
- **Response 200**: `{ users: User[], pagination? }`

## GET `/users/:id`
- **Auth**: JWT (admin)
- **Response 200**: `{ user: User }` (includes bookings, grounds, teams relations)

## GET `/grounds`
- **Auth**: JWT (admin)
- **Query**: `search?, isVerified?, isActive?, page?, limit?`
- **Response 200**: `{ grounds: Ground[], pagination? }`

## PATCH `/grounds/:id/verify`
- **Auth**: JWT (admin)
- **Response 200**: `{ message: "Ground verified", ground: Ground }`

## PATCH `/grounds/:id/suspend`
- **Auth**: JWT (admin)
- **Response 200**: `{ message: "Ground suspended", ground: Ground }`

## GET `/teams`
- **Auth**: JWT (admin)
- **Query**: `search?, sport?, page?, limit?`
- **Response 200**: `{ teams: Team[], pagination? }`

## GET `/finance`
- **Auth**: JWT (admin)
- **Response 200**: `{ finance }` — platform-wide financial overview

## GET `/audit-logs`
- **Auth**: JWT (admin)
- **Query**: `entity?, entityId?, userId?, action?, page?, limit?`
- **Response 200**: `{ logs: AuditLog[], pagination? }`

## Regions CRUD (`/regions`)
- **GET** `/regions` — list
- **POST** `/regions` — `{ name, code }`
- **GET** `/regions/:action/:id` — action = "edit" | "delete" | "toggle"

## Cities CRUD (`/cities`)
- **GET** `/cities` — list
- **POST** `/cities` — `{ name, regionId, displayOrder? }`
- **GET** `/cities/:action/:id` — action = "edit" | "delete" | "toggle"

## Sports CRUD (`/sports`)
- **GET** `/sports` — list
- **POST** `/sports` — `{ name, slug, icon? }`
- **GET** `/sports/:action/:id` — action = "edit" | "delete" | "toggle"

## Payment Methods CRUD (`/payment-methods`)
- **GET** `/payment-methods` — list (admin)
- **POST** `/payment-methods` — `{ name, slug, displayOrder? }`
- **GET** `/payment-methods/:action/:id` — action = "edit" | "delete" | "toggle"

---

## Key Types
```typescript
type AuditLog = {
  id: string;
  userId: string | null;
  action: string;    // "verify_ground", "suspend_ground", "delete_user" etc.
  entity: string;    // "ground", "user", "team"
  entityId: string | null;
  metadata: any | null;  // JSON — contextual data
  createdAt: string;
};

type SportCategory = {
  id: string;
  name: string;       // "Football", "Cricket", "Badminton"
  slug: string;       // "football", "cricket", "badminton"
  icon: string | null; // URL or icon name
  isActive: boolean;
};
```
