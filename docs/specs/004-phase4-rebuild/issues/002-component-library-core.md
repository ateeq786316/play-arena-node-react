# 002 — Component Library: Core

**Type:** AFK | **Blocked by:** 001

## What to build

Build the core reusable UI components for the PlayArena design system in `packages/web/src/components/ui/`. Each component must follow the design spec: Button (Primary/Emerald, Secondary/white-bordered, Ghost/transparent, Danger/red — 48px mobile/52px desktop, 14px radius), Input (52px height, 14px radius, emerald focus ring, label + icon support, error state), Card (20px radius, soft shadow, 24-32px padding), Badge (status colors: pending/amber, approved/green, completed/blue, cancelled/red, review/purple), Avatar (image with fallback initials), Skeleton (shimmer loading animation), Modal (24px radius, backdrop blur, ESC/click-outside close, scale-in animation).

## Acceptance criteria

- [ ] Button renders all 4 variants with correct colors, sizes, border radius
- [ ] Input renders with label, icon slot, error state (red border + message), success state (green)
- [ ] Card renders with correct shadow, radius, padding
- [ ] Badge renders all 6 status colors correctly
- [ ] Avatar renders image or fallback initials
- [ ] Skeleton renders with shimmer animation
- [ ] Modal opens with backdrop blur + scale animation, closes via ESC and click-outside
