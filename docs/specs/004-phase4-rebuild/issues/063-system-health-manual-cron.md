# 063 — System Health + Manual Cron

**Type:** AFK | **Blocked by:** 009

## What to build

Build **System Health** page at `/admin/system`. **Status Cards**: API Server (Up/Down, uptime, memory usage), Database (Connected/Disconnected, connection count, last query time), Socket.IO (Active connections count, rooms count), File Storage (Cloudinary — connected/error). **Error Log** section: last 50 server errors (500 responses), showing timestamp, route, error message, stack trace (expandable). **Cron Jobs** section: table of all cron jobs with Name, Schedule, Last Run, Next Run, Status (Success/Failed/Not Run), [Run Now] button (triggers job immediately, shows loading). **Backup** section: last backup timestamp, [Run Backup Now] button, [Download Last Backup] link.

## Acceptance criteria

- [ ] System status cards with live data
- [ ] Error log with expandable stack traces
- [ ] Cron job table with run status and manual trigger
- [ ] Backup section with run/download
- [ ] Loading, error states
