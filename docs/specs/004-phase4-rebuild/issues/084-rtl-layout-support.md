# 084 — RTL Layout Support

**Type:** AFK | **Blocked by:** 083

## What to build

Add RTL (right-to-left) layout support for Urdu and Arabic locales. Use CSS logical properties (`margin-inline-start` instead of `margin-left`, `padding-inline-end` instead of `padding-right`, etc.) throughout the component library and page layouts. Flip the sidebar to the right side when RTL is active. Flip the topbar elements (bell icon goes left, user avatar goes left). Flip text alignment in most containers. Flip the map controls. Ensure input fields still work correctly with RTL text entry. Test all components in RTL mode. Add `dir="rtl"` attribute to `<html>` based on locale. Add Noto Naskh Arabic font for Arabic text and Noto Nastaliq Urdu for Urdu text as font fallbacks.

## Acceptance criteria

- [ ] RTL mode activated when locale is `ur` or `ar`
- [ ] Sidebar renders on the right in RTL mode
- [ ] Topbar elements mirrored in RTL
- [ ] All components use CSS logical properties
- [ ] Input text entry works correctly in RTL
- [ ] Urdu/Arabic fonts loaded
- [ ] All pages visually correct in RTL mode
