# 083 — Internationalization Setup

**Type:** AFK | **Blocked by:** 002

## What to build

Install and configure `next-intl` for internationalization. Create the message file structure: `messages/en.json`, `messages/ur.json`, `messages/ar.json`. Create a `i18n/request.ts` config file that loads the appropriate messages based on detected locale (from cookie, then browser, then default 'en'). Create a `<LocaleProvider>` that wraps the app and provides the `useTranslations()` hook. Translate all UI strings in the component library (Button text, Input labels, Card headers, etc.) into English (complete), Urdu (complete), Arabic (complete). Add 3 placeholder translation files for future languages (empty). Create a locale switcher component that sets a cookie and reloads the page. Auto-detect browser locale on first visit.

## Acceptance criteria

- [ ] next-intl configured with en/ur/ar locales
- [ ] Translation files created for all 3 languages
- [ ] Component library strings translated
- [ ] Locale switcher in settings page
- [ ] Auto-detect browser locale on first visit
- [ ] Selected locale persisted in cookie
