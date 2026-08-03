# 069 — Player Complaint Form

**Type:** AFK | **Blocked by:** 068

## What to build

Build the complaint form for players. Accessible from booking detail page (Booking Actions menu → [File Complaint]) and from `/complaints/new`. **Form**: Category dropdown (Refund, Fight/Conflict, Staff Behavior, Facilities Issue, Double Booking, Payment Issue, Damage, No-Show, Other), Description textarea (required, max 2000 chars), Evidence upload (multiple images, via Cloudinary), Related Booking (optional: search and select a booking), [Submit] button with loading state. On success: "Complaint filed. Reference #PA-XXX. Admin will review within 48 hours." toast. Show confirmation with complaint ID. **My Complaints** list at `/complaints`: table of filed complaints, each row shows: ID, Category badge, Status badge, Date, Actions [View]. Empty state: "No complaints filed."

## Acceptance criteria

- [ ] Complaint form with category, description, evidence upload
- [ ] Related booking selector (optional)
- [ ] Submit with loading and success confirmation
- [ ] My Complaints list with status badges
- [ ] Loading, error, empty states
