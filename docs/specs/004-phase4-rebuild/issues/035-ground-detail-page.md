# 035 — Ground Detail Page

**Type:** AFK | **Blocked by:** 016

## What to build

Build the public ground detail page at `/grounds/[id]`. **Hero Section**: image gallery (swipeable on mobile, thumbnail strip on desktop) with lightbox on click. **Info Section**: ground name, address with maps link, contact phone (tap to call), WhatsApp link, verified badge if approved. **Sport Tabs** (one per sport offered): shows courts for that sport. **Court Card**: court name, base price, price/hour, deposit, max players, amenities badges, [Book] button. **Availability Calendar**: date picker → shows grid of courts × time slots for selected date, green = available, gray = booked, past = striped. Tap available slot → "Book Now" flow (redirects to login if not authenticated). **Reviews Section**: average rating display, review cards with reviewer name, date, ratings (4 categories), text. **Amenities Bar**: all amenities as icon tags. **Actions**: [Save Ground] bookmark, [Share] via WhatsApp/link, [Call], [Directions] Google Maps link.

## Acceptance criteria

- [ ] Image gallery with lightbox
- [ ] Ground info with contact actions
- [ ] Sport tabs filter courts
- [ ] Court cards with pricing and amenities
- [ ] Availability calendar with interactive slot selection
- [ ] Reviews section with average rating
- [ ] Amenities bar
- [ ] Save and Share actions
- [ ] Loading, error, 404 states
