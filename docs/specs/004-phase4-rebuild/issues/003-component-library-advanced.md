# 003 — Component Library: Advanced

**Type:** AFK | **Blocked by:** 002

## What to build

Build the advanced reusable UI components. **Toast system** with `useToast()` hook + `<Toaster />` component, slide-in from top-right (250ms), auto-dismiss with progress bar, success/error/warning/info variants. **EmptyState** component with illustration slot, headline, description, primary CTA button. **ErrorBoundary** component wrapping each page with fallback UI and retry button. **DataTable** component with sticky header, sortable columns, filter row, search, pagination, row hover, row selection, bulk actions. **Pagination** component with page numbers, prev/next, page size selector. **Tabs** component with horizontal tab bar, active indicator, content panel. **DropdownMenu** component with trigger, items, separators, keyboard navigation. **ConfirmDialog** component built on Modal with title, message, confirm/cancel buttons.

## Acceptance criteria

- [ ] Toast shows with slide animation, auto-dismisses, stacks multiple toasts
- [ ] EmptyState renders illustration + headline + description + CTA
- [ ] ErrorBoundary catches errors, shows fallback with retry
- [ ] DataTable renders rows with sort, filter, search, pagination, hover highlight
- [ ] Pagination shows page numbers, prev/next, handles edge cases (first/last page)
- [ ] Tabs switch content panels with active indicator animation
- [ ] DropdownMenu opens on click, navigates with keyboard
- [ ] ConfirmDialog shows modal with confirm/cancel, returns promise
