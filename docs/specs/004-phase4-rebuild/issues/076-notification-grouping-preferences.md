# 076 — Notification Grouping & Preferences

**Type:** AFK | **Blocked by:** 007

## What to build

Enhance the notification system. Add notification grouping: when multiple events of the same type occur for the same entity (e.g., 3 team members join), group them: "Ahmed, Ali, and 1 other joined your team" instead of 3 separate notifications. Add `UserCommunicationPreference` read/write endpoints (model already exists). Add `PATCH /api/user/preferences` to save notification channel preferences per category (in-app only / email too / quiet hours). Add `GET /api/user/preferences` to load them. Add quiet hours support: suppress in-app notifications during specified hours (store start/end time, compare on send). Write tests.

## Acceptance criteria

- [ ] Grouped notifications for similar events
- [ ] Notification preference CRUD endpoints
- [ ] Preferences saved per user per category
- [ ] Quiet hours suppress notifications
- [ ] Tests pass
