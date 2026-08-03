# 008 — Account Separation (Signup)

**Type:** AFK | **Blocked by:** 006

## What to build

Modify the signup endpoint (`POST /api/user/register`) to accept an optional `role` field (`"player"` or `"owner"`). If not provided, default to `"player"`. If `"owner"`, create the user with `role: "owner"`. The existing email uniqueness constraint stays (two accounts can't share the same email — different email per account is required). Return the user with their role in the response. Update the frontend signup page to add a role selector toggle (Player / Owner) before the registration form.

## Acceptance criteria

- [ ] Signup endpoint accepts `role` field
- [ ] Player signup creates `role: "player"` user
- [ ] Owner signup creates `role: "owner"` user
- [ ] Frontend signup page has role selector toggle
- [ ] Existing behavior preserved (no breaking changes)
