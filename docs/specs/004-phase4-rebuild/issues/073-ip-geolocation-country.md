# 073 — IP Geolocation + Country Default

**Type:** AFK | **Blocked by:** 071

## What to build

On first visit, detect the user's country via IP. Use Cloudflare `CF-IPCountry` header if behind Cloudflare, or use a free geoip lookup (e.g., `ipapi.co` or `ipinfo.io`) as fallback. Store the detected country in a cookie. On subsequent visits, use the cookie (or re-detect if expired). The detected country sets a default filter on the search page. Show a country selector in the topbar (flag icon + dropdown). When user switches country, update the cookie and refresh search results for that country. Ensure the `Country` model exists (or use `Region` as country-level) with `code`, `name`, `currency`, `timezone`, `phoneCode`. Seed initial countries.

## Acceptance criteria

- [ ] IP detection on first visit (via Cloudflare header or geoip)
- [ ] Detected country stored in cookie
- [ ] Country selector in topbar with flag + name
- [ ] Changing country updates search results
- [ ] Search filtered to selected country
- [ ] Country model seeded with initial data (PK, AE, UK, US, etc.)
