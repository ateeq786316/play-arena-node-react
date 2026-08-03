# 004 — Animation Infrastructure

**Type:** AFK | **Blocked by:** 001

## What to build

Install and configure `framer-motion`. Create animation constants file with durations (fast: 150ms, normal: 250ms, slow: 350ms, max: 500ms) and easings (default CSS ease, smooth `[0.4, 0, 0.2, 1]`, spring `{ stiffness: 300, damping: 30 }`). Build **PageTransition** wrapper that fades content on route change (250ms fade for desktop, 250ms slide for mobile). Build **AnimatedCounter** component that counts up from 0 to target number on mount (500ms, used for KPIs). Build **ProgressBar** with animated fill (350ms). Add `motion.div` wrappers to Button (whileHover scale 1.02 + shadow lift), Card (whileHover subtle shadow increase), Modal (initial scale 0.9 → animate scale 1). Add `layoutId` for shared element transitions between list and detail views.

## Acceptance criteria

- [ ] framer-motion installed and configured
- [ ] Animation constants file with durations and easings
- [ ] PageTransition wraps dashboard layout with fade on route change
- [ ] AnimatedCounter counts up from 0 to target on mount
- [ ] ProgressBar animates fill width on mount
- [ ] Buttons scale 1.02 + shadow lift on hover
- [ ] Cards subtly elevate on hover
- [ ] Modal scales in from 0.9
