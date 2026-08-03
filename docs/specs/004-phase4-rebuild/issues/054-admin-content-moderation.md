# 054 — Admin Content Moderation

**Type:** AFK | **Blocked by:** 009

## What to build

Build **Admin Content Moderation** at `/admin/moderation`. **Tabs**: Flagged Grounds / Flagged Teams. **Flagged Grounds** tab: DataTable of grounds reported for inappropriate names, descriptions, or images. Ground Name, Owner, Reason (inappropriate name/nudity/spam/etc.), Reported By, Date. Actions: [View], [Approve (dismiss flag)], [Edit & Approve] (edit the content then dismiss), [Suspend Ground]. **Flagged Teams** tab: same pattern for team names and logos. Actions: [Approve], [Edit], [Disband Team]. Empty state: "No flagged content" with illustration.

## Acceptance criteria

- [ ] Flagged Grounds and Flagged Teams tabs
- [ ] Grounds table with report reason and reporter info
- [ ] Approve, Edit & Approve, Suspend actions
- [ ] Teams table with same pattern
- [ ] Empty state when no flagged content
