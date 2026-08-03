# 078 — Unread Count Badge

**Type:** AFK | **Blocked by:** 076

## What to build

Add real-time unread notification count to the topbar bell icon. Create `GET /api/notifications/unread-count` endpoint that returns `{ count: N }`. On the frontend, the `AuthProvider` (or a separate `NotificationProvider`) fetches the unread count on page load and listens via Socket.IO for new notification events (event: `new_notification`). On receiving one, increment the count. The bell icon in the topbar shows the count as a red badge with number (or red dot if 0). When user opens the notification dropdown or list, mark as read (decrement count). The `useUiStore` already has `notificationUnreadCount` — wire it up.

## Acceptance criteria

- [ ] Unread count endpoint returns correct count
- [ ] Bell icon shows count badge
- [ ] Real-time increment via Socket.IO
- [ ] Count decrements on notification read
- [ ] Zero count hides the badge (or shows dot)
