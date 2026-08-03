# 059 — Platform Settings

**Type:** AFK | **Blocked by:** 009

## What to build

Build **Platform Settings** at `/admin/settings`. Organized in cards by category:

**General**: Default Currency (PKR, locked), Timezone (Asia/Karachi, locked), Maintenance Mode (toggle with warning).

**Security**: Rate Limit Window (minutes), Rate Limit Max Requests, OTP Expiry (minutes), Max File Upload (MB).

**Bookings**: Default Auto-Cancel Unpaid After (minutes), Booking Reminder Hours Before, Default Min Booking Duration, Default Max Booking Duration, Default Advance Booking Days.

**Trial**: Trial Enabled (toggle), Default Trial Duration (days), text "Override per-owner in User Detail".

**Tournament**: Default Listing Fee (PKR), Free Tournaments Allowed (toggle).

**Commission**: Default Commission Rate (%).

Each setting has a label, description, and input. Changes save individually with loading spinner and success toast. Only Super Admin can access.

## Acceptance criteria

- [ ] All settings displayed in categorized cards
- [ ] Settings load from PlatformSetting model
- [ ] Individual save per setting with toast
- [ ] Loading skeletons, error with retry
- [ ] Only Super Admin accessible
