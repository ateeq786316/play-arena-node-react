# 085 — Locale-Aware Formatting

**Type:** AFK | **Blocked by:** 083

## What to build

Make all date, time, number, and currency formatting locale-aware. Update the utility functions in `packages/shared/src/utils/index.ts`:

- `formatDate(date, locale)` — uses `Intl.DateTimeFormat` with the current locale (DD/MM/YYYY for en-PK, MM/DD/YYYY for en-US, Arabic format for ar, etc.)
- `formatTime(time, locale)` — 12h vs 24h based on locale
- `formatCurrency(amount, locale)` — uses `Intl.NumberFormat` with currency from the detected country (PKR for Pakistan, AED for UAE, GBP for UK, USD for US)
- `formatNumber(number, locale)` — locale-aware grouping separators (1,234.56 vs 1.234,56)
- `formatRelativeTime(date, locale)` — "5m ago" in the appropriate language ("5 منٹ پہلے" for Urdu)

These utilities should read the current locale from the cookie or a context provider. Update all pages to use these locale-aware utilities instead of hardcoded formats.

## Acceptance criteria

- [ ] formatDate returns locale-appropriate date format
- [ ] formatTime returns 12h or 24h based on locale
- [ ] formatCurrency shows correct currency symbol per country
- [ ] formatNumber uses locale grouping separators
- [ ] formatRelativeTime translates to locale language
- [ ] All pages use locale-aware utilities
