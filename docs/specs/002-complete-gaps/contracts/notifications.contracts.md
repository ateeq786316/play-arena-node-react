# Notification Module — API Contracts

**Base path**: `/api/notifications`

---

## GET `/`
- **Auth**: JWT
- **Query**: `page?: number (default 1), limit?: number (default 20, max 50)`
- **Response 200**: `{ notifications: Notification[], pagination?: { page, limit, total, totalPages? } }`

## GET `/unread-count`
- **Auth**: JWT
- **Response 200**: `{ count: number }`

## PATCH `/read-all`
- **Auth**: JWT
- **Response 200**: `{ message: "All notifications marked as read" }`

## PATCH `/:id/read`
- **Auth**: JWT
- **Response 200**: `{ message: "Marked as read" }`

## DELETE `/:id`
- **Auth**: JWT (soft delete)
- **Response 200**: `{ message: "Notification deleted" }`

---

## Key Types
```typescript
type Notification = {
  id: string;
  userId: string;
  type: string;          // "booking_confirmed", "challenge_received", etc.
  title: string;
  message: string | null;
  data: any | null;      // JSON — contextual payload
  readAt: string | null; // null = unread
  deletedAt: string | null;
  createdAt: string;
};
```
