# 077 — Email via Resend

**Type:** AFK | **Blocked by:** 076

## What to build

Integrate Resend as the email provider. Install `resend` npm package. Create a `src/config/resend.js` module with the Resend client (API key from env `RESEND_API_KEY`). Create an `emailService.js` that sends emails for critical notification events: ground verified, ground rejected (with reason), subscription expiring (7d/3d/1d), subscription suspended, welcome email, staff account created, payment reminder. Modify the nodemailer setup to use Resend as the transport (or replace it). Email templates: use React Email or simple HTML templates with PlayArena branding (logo, Emerald color scheme, footer with unsubscribe). Write integration test (mock Resend API).

## Acceptance criteria

- [ ] Resend client configured from env var
- [ ] Email service sends for all critical events
- [ ] Branded email template (logo, colors, footer)
- [ ] Free tier respected (100/day)
- [ ] Integration test with mocked Resend API
