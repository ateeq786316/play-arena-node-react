# 034 — Map View

**Type:** AFK | **Blocked by:** 033

## What to build

Add a map view toggle to the search page. A button switches between Grid view and Map view. **Map view** renders a full-screen interactive map (use Leaflet — free, no API key, or Mapbox free tier). Plot ground locations as pins using lat/lng data. Each pin shows a marker with the sport icon. Click pin → popup with: ground name, primary image (thumbnail), sport badges, price range, rating, [View Details] link. Map centered on the selected city/region. If user shares location, center on their position. **Responsive**: map takes full viewport height on mobile, fixed height section on desktop.

## Acceptance criteria

- [ ] Map/Grid toggle button on search page
- [ ] Map renders with Leaflet (or Mapbox)
- [ ] Ground pins plotted from lat/lng data
- [ ] Pin click shows popup with ground info
- [ ] Popup has link to ground detail
- [ ] Map centers on selected city or user location
- [ ] Responsive: full height on mobile, fixed on desktop
