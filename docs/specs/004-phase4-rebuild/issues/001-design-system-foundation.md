# 001 — Design System Foundation

**Type:** AFK | **Blocked by:** None

## What to build

Set up the PlayArena design tokens as CSS custom properties in `globals.css`. Configure Tailwind v4 with the custom color palette (Emerald #10B981 primary, Indigo #6366F1 secondary, Amber #F59E0B accent). Import Bebas Neue and DM Sans via `next/font`. Define spacing scale (4px grid), border radius tokens (14px inputs/buttons, 20px cards, 24px modals), shadow tokens (card `0 8px 24px rgba(15,23,42,0.08)`, modal `0 20px 60px rgba(15,23,42,0.15)`), status colors (success/warning/danger/info/pending). Create the dark sidebar shell (240px expanded, 64px collapsed) with logo area and dark background.

## Acceptance criteria

- [ ] Emerald/Indigo/Amber palette available as Tailwind classes (`bg-emerald-500`, etc.)
- [ ] Bebas Neue loaded for headings, DM Sans for body
- [ ] All spacing/radius/shadow tokens available as CSS classes
- [ ] Dark sidebar renders with correct width states, brand logo, nav slot
- [ ] `globals.css` has all CSS custom properties defined
