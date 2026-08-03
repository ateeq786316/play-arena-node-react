# 017 — Verification Notifications

**Type:** AFK | **Blocked by:** 013

## What to build

When a ground is verified or rejected, send notifications to the ground owner:
- **In-app notification** via existing Socket.IO `/notifications` namespace: type `ground_verified` or `ground_rejected`, title "Ground Verified" or "Ground Rejected", message includes ground name and (if rejected) the rejection reason
- **Email** via nodemailer: send an email to the owner's email with the same information

The notification service should be called by the AdminService after verify/reject actions complete. The frontend notification bell should show these notifications.

## Acceptance criteria

- [ ] Owner receives in-app notification when ground is verified
- [ ] Owner receives in-app notification when ground is rejected (with reason)
- [ ] Email sent to owner for both verify and reject events
- [ ] Notification bell shows unread count for these notifications
