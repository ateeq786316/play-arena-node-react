# 043 — Ratings & Reviews

**Type:** AFK | **Blocked by:** 009

## What to build

Build ratings and reviews for matches and grounds. **Match Rating**: after a match is completed, show rating prompt on match detail page. Form: Skill Rating (1-5 stars), Sportsmanship (1-5), Punctuality (1-5), Review Text (optional, max 500 chars). Submit → rating saved, badge "Rated" shown.

**Ground Review**: after booking is completed, show review prompt. Form: Court Quality (1-5), Cleanliness (1-5), Facilities (1-5), Staff Behavior (1-5), Review Text (optional). Submit → review appears on ground detail page.

**My Reviews** at `/profile/reviews`: list of my match ratings and ground reviews. Each card shows rating date, target (match/ground), scores, text.

## Acceptance criteria

- [ ] Match rating form (4 categories, stars, optional text)
- [ ] Ground review form (4 categories, stars, optional text)
- [ ] Rating prompt shown after match/booking completion
- [ ] "Rated" badge prevents duplicate ratings
- [ ] My Reviews page with history
- [ ] Loading, error states
