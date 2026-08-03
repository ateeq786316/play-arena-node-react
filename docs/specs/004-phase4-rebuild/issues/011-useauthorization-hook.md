# 011 — useAuthorization Hook

**Type:** AFK | **Blocked by:** 006

## What to build

Create `packages/web/src/hooks/use-authorization.ts` with a `can(user, action, resource)` permission function and a React hook `useAuthorization()`. Define a permission matrix:

```typescript
const PERMISSIONS: Record<UserRole, Record<string, string[]>> = {
  player: {
    grounds: ["view", "book"],
    teams: ["create", "join", "leave"],
    matches: ["play", "challenge"],
    tournaments: ["register"],
    // ...
  },
  owner: {
    grounds: ["create", "edit", "delete", "view", "manage"],
    staff: ["invite", "revoke"],
    finance: ["view"],
    // ...
  },
  // etc.
}
```

The hook exposes `can(action, resource)` and `canAny(actions, resource)` so components can conditionally render buttons and links. Also create a `<Can action="create" resource="grounds">` component that renders children only if authorized.

## Acceptance criteria

- [ ] `useAuthorization()` hook returns `can()` and `canAny()` functions
- [ ] Permission matrix covers all resources for all 6 roles
- [ ] `<Can>` component conditionally renders children
- [ ] Integrated into pages to hide unauthorized actions (e.g., "Create Ground" hidden from Players)
