# 044 — Team Chat

**Type:** AFK | **Blocked by:** 009

## What to build

Build team chat at `/chat` and `/chat/[teamId]`. **Chat List** (sidebar on desktop, list on mobile): shows all teams I'm a member of, each with team name, last message preview, unread count badge, timestamp. **Chat View** for selected team: message bubbles (right = mine, left = others), sender name + avatar on each message, timestamp, date separators. **Message Input**: text input + send button, Enter to send. Messages delivered via Socket.IO in real-time. On page load, fetch last 50 messages via REST. Auto-scroll to bottom on new message. **Empty state** in chat view: "Start the conversation!" with team name and member list. **Empty chat list**: "No teams yet — join or create a team to start chatting." Loading: skeleton list. Error: retry.

## Acceptance criteria

- [ ] Chat list with unread badges and last message previews
- [ ] Chat view with message bubbles, sender info, timestamps
- [ ] Socket.IO real-time message delivery
- [ ] REST fetch of last 50 messages on load
- [ ] Auto-scroll to bottom on new message
- [ ] Message input with send on Enter
- [ ] Loading, error, empty states
