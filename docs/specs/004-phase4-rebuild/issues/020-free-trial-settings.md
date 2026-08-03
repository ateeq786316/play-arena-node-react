# 020 — Free Trial Settings

**Type:** AFK | **Blocked by:** 007

## What to build

Create a `PlatformSetting` model in Prisma (key-value: `key String @id`, `value String`). Seed with: `trial_enabled = "true"`, `trial_duration_days = "14"`. Create Super Admin endpoints:

- `GET /api/admin/settings` — list all settings
- `PATCH /api/admin/settings` — update one or more settings
- `PATCH /api/admin/users/:id/trial` — override trial length for a specific owner

Create a frontend page at `/admin/settings` with a card-based layout showing each setting as labeled inputs. Trial settings section: duration (number input), enabled (toggle). Per-owner override accessible from User Detail page. Write tests for settings CRUD and per-owner override.

## Acceptance criteria

- [ ] PlatformSetting model with key-value schema
- [ ] Seed script creates trial_enabled and trial_duration_days
- [ ] GET/PATCH endpoints for settings, Super Admin only
- [ ] Per-owner trial override endpoint
- [ ] Frontend settings page with trial config cards
- [ ] Settings page shows loading, error, empty states
- [ ] Tests pass
