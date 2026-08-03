# Socket.IO Event Contracts

## Setup
- **Library**: socket.io (server), socket.io-client (frontend)
- **Server**: Initialized in `src/socket/socket.js`
- **Auth**: JWT token passed as `auth.token` or `query.token` in handshake

---

## `/chat` Namespace

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `joinGround` | `groundId: string` | Join a ground's chat room. Server checks ground existence + user access to ground. |
| `leaveGround` | `groundId: string` | Leave a ground's chat room. |
| `sendMessage` | `{ groundId: string, content: string (max 2000) }` | Send a message to ground chat. |
| `typing` | `{ groundId: string, isTyping: boolean }` | Typing indicator broadcast. |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `newMessage` | `ChatMessage` (includes sender) | Broadcast to all in `ground:{id}` room |
| `typing` | `{ userId: string, isTyping: boolean }` | Broadcast to all in room except sender |
| `error` | `string` | Error message |

### Auth
Token verified in namespace middleware. `socket.userId` set on success.

---

## `/notifications` Namespace

### Server → Client Events (client listens)

| Event | Payload | Description |
|-------|---------|-------------|
| `newNotification` | `Notification` | Sent when a notification is created for this user |

### Room
Client automatically joins `user:{userId}` room on connection.

### Auth
Token verified in namespace middleware. `socket.userId` set on success.

---

## Frontend Connection Pattern
```typescript
import { io } from "socket.io-client";

// Chat namespace
const chatSocket = io(`${API_BASE_URL}/chat`, {
  auth: { token: getAccessToken() },
});

// Notification namespace
const notifSocket = io(`${API_BASE_URL}/notifications`, {
  auth: { token: getAccessToken() },
});
```
