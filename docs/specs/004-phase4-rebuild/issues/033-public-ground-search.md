# 033 — Public Ground Search

**Type:** AFK | **Blocked by:** 002, 014

## What to build

Build the public ground search page accessible at `/grounds` (no auth required). **Search bar** at top with search icon, placeholder "Search grounds by name or city...". **Filter bar** below: Sport (dropdown/multi-select), City (dropdown, cascaded from country), Date (date picker), Price Range (min-max inputs), Minimum Rating (star selector), Amenities (multi-select checkboxes: Floodlights, Parking, AC, Indoor, Equipment Rental), Open Now (toggle). **Results grid**: 3-column on desktop, 2 on tablet, 1 on mobile. Each card shows: primary image (or placeholder), ground name, address, sport badges, price range, rating stars, "Open Now" badge if applicable. Click card → navigate to `/grounds/[id]`. **Sort dropdown**: Featured, Nearest, Rating, Price Low-High, Price High-Low. **Pagination** at bottom. **Empty state**: "No grounds found" with illustration + "Try adjusting your filters". **Loading state**: 6 skeleton cards in grid.

## Acceptance criteria

- [ ] Search bar with text input and search icon
- [ ] Filter bar with all filter types working
- [ ] Results grid with responsive columns
- [ ] Ground cards show image, name, address, sports, price, rating
- [ ] Sort dropdown changes results order
- [ ] Pagination works
- [ ] Empty state with illustration when no results
- [ ] Loading skeleton grid
- [ ] Public (no auth required)
