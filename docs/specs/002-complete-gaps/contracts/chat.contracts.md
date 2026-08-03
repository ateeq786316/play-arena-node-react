# Chat Module — API Contracts

**Base path**: `/api/chat`

---

## GET `/unread`
- **Auth**: JWT
- **Response 200**: `{ unreadCounts: [{ groundId: string, count: number }] }`

## GET `/:id/messages`
- **Auth**: JWT (ground participant)
- **Query**: `cursor?: string` (cursor pagination — last message id)
- **Response 200**: `{ messages: ChatMessage[], nextCursor?: string }`

## POST `/:id/messages`
- **Auth**: JWT (ground participant)
- **Body**: `{ content: string (max 2000 chars) }`
- **Response 201**: `{ message: "Message sent", data: ChatMessage }`

## POST `/:id/read`
- **Auth**: JWT (ground participant)
- **Body**: —
- **Response 200**: `{ message?: string }`

---

## Key Types
```typescript
type ChatMessage = {
  id: string;
  groundId: string;
  senderId: string;
  content: string;       // max 2000 chars
  deletedAt: string | null;
  createdAt: string;
  sender?: User;
};
```
