# 032 — Activity Log + QR Code

**Type:** AFK | **Blocked by:** 010

## What to build

Build activity log at `/grounds/:id/activity`. Chronological feed (newest first) of everything that happened at this ground: bookings created/cancelled/completed, staff added/removed, courts edited, schedule changes, settings changed (old value → new value), cash sessions opened/closed, pricing rules modified, images uploaded/deleted. Each entry shows: timestamp (relative + absolute on hover), actor name + role badge, action description. Filter by: date range, actor, action type.

Build QR Code page at `/grounds/:id/qr` (as tab in Settings or standalone). Auto-generated QR code encoding `https://playarena.com/grounds/{id}`. Show QR as large PNG. Download buttons: [Download PNG] [Download SVG]. Print-friendly version with ground name + QR + "Scan to book" text.

## Acceptance criteria

- [ ] Activity log feed with paginated entries
- [ ] Each entry shows timestamp, actor, action description
- [ ] Filter by date range, actor, action type
- [ ] QR code renders correctly
- [ ] Download buttons for PNG and SVG
- [ ] Print-friendly layout
- [ ] Loading, error, empty states
