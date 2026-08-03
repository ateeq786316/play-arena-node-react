# PlayArena — Complete Screen & Page Specification

> Generated: 2026-07-24
> Source: project-scope.md (1,405-line comprehensive specification)
> Format: Every screen listed as a discrete item under its platform heading.
> Total screens: 145 (all listed under both Mobile and Web where applicable)

---

## 1. Mobile Screens (React Native — 145 screens)

> The mobile app uses bottom tab navigation with 5 core tabs: Home, Bookings, Teams, More, Notifications. Role-based tabs replace the default set (e.g., Owner sees Grounds tab, Staff sees Ops tab, Admin sees Admin tab).

### 1.1 Auth & Onboarding (7 screens)
- **Splash Screen** — App launch with logo animation, auto-check stored session token, redirect to Home or Login.
- **Onboarding Intro** — First-time user carousel (3 slides: Discover Grounds, Play Matches, Manage Teams) with "Get Started" CTA.
- **Login Screen** — Email + password fields, "Forgot Password?" link, "Sign Up" CTA, social login placeholder.
- **Signup Screen** — Email, phone (+92 placeholder), password, confirm password fields. Links to Terms & Privacy.
- **Verify OTP Screen** — 6-digit code input (auto-advance on digit entry), resend timer (60s), email read from signup param.
- **Forgot Password Screen** — Single email field, success message "If email exists, instructions sent."
- **Reset Password Screen** — Email, OTP (6-digit), new password, confirm password fields.

### 1.2 Home & Ground Discovery (8 screens)
- **Home Screen** — Search bar with "Near Me" geolocation button, featured grounds horizontal scroll, sport category quick filters (Futsal/Basketball/Cricket/Badminton), recent bookings section.
- **Search Results Screen** — Filtered ground list (list view), sort by distance/rating/price, filter drawer (sport/city/price range/rating).
- **Map View Screen** — Full-screen Leaflet map with ground markers, cluster markers for dense areas, user location blue dot, marker popups with ground name + distance + price + "View" link, viewport-triggered re-search.
- **Ground Detail Screen** — Image gallery (swipeable), ground name, address, distance from user, rating, amenities tags, court list with prices, "Book Now" FAB, "Get Directions" button, reviews section, staff/owner info.
- **Court Selection Screen** — List of courts within a ground with sport type, max players, base price, "Select" button per court.
- **Booking Slot Picker Screen** — Date picker (calendar view, min=today), time slot grid (60-min slots, green=available, gray=booked, user's selection highlighted), slot price shown per slot.
- **Booking Summary Screen** — Review booking details: ground, court, date, time, total amount, deposit amount, cancellation policy. "Confirm Booking" CTA. Coupon code input with "Apply" button.
- **Booking Confirmation Screen** — Success animation, booking reference number, ground name + address, date + time, amount paid/deposit due, "Add to Calendar" button, "View Booking" button.

### 1.3 My Bookings (4 screens)
- **My Bookings Screen** — Tabbed view: Upcoming (pending/approved) | Past (completed/cancelled) | All. Each booking card shows ground image, name, court, date, time, amount, status badge. Swipe to cancel (if eligible).
- **Booking Detail Screen** — Full booking info: ground name, court, date, time slot, status timeline (created → approved → completed), payment breakdown, cancellation button (if eligible), "Get Directions" button, rate ground button (after visit).
- **Booking History Screen** — Chronological list of all past bookings with filters (date range, status, sport). Search by ground name.
- **Booking Cancellation Screen** — Confirmation dialog showing refund amount (based on cancellationPolicy), reason selector (change of plans/weather/found alternative), confirm cancel button.

### 1.4 Teams (10 screens)
- **My Teams Screen** — Grid of user's teams with team name, sport icon, ELO rating badge, W/L/D record, member count. "Create Team" FAB.
- **Team Detail Screen** — Team name, sport category, ELO rating + trend arrow, W/L/D stats, member avatar row (tap to expand), "Challenge Team" button, "Invite Members" button, "Leave Team" button (if not captain). Tabs: Roster | Matches | Stats.
- **Create Team Screen** — Team name input, sport category picker (dropdown from API), "Create Team" button.
- **Edit Team Screen** — Edit team name, sport category (pre-populated).
- **Team Roster Screen** — Full member list with avatar, name, role badge (captain/co-captain/player), jersey number. Captain sees "Transfer Captaincy" action per member. Swipe to remove member (captain only).
- **Invite Member Screen** — Email input, optional message, "Send Invite" button. Success shows invited user with pending badge.
- **Team Join Requests Screen** — List of pending join requests with applicant name, avatar, date, message. "Accept" / "Reject" buttons per request.
- **Team Invitations Screen** — List of received team invitations with team name, sport, inviter name. "Accept" / "Reject" buttons.
- **Create Join Request Screen** — Team search/select, optional message to captain, "Send Request" button.
- **Transfer Captaincy Screen** — Select new captain from member list, confirmation dialog.

### 1.5 Matchmaking (7 screens)
- **My Matches Screen** — Tabbed: Upcoming | Completed | Cancelled. Match cards show Team A vs Team B, date, time, court, score (if completed), status badge.
- **Match Detail Screen** — Match info: teams, date, time, court, ground, score display, status. "Enter Score" button (if scheduled + user is captain), "Cancel Match" button (if not completed). Score entry fields (team score, opponent score). After completion: rate button.
- **Create Challenge Screen** — Opponent team search/select, proposed date/time picker, court selection (optional), "Send Challenge" button.
- **Score Entry Screen** — Two number inputs (your score, opponent score), submit button. Shows current pending score if already submitted by other team.
- **Match Requests Sent Screen** — List of sent challenges with recipient team name, date, status. "Cancel" button on pending items.
- **Match Requests Received Screen** — List of received challenges with sender team name, date, sport. "Accept" / "Reject" buttons.
- **Match Score Dispute Screen** — File dispute form with reason selector (score mismatch/other), description text area, screenshot upload. Submit button.

### 1.6 Tournaments (7 screens)
- **Tournaments List Screen** — Grid of tournaments with poster image (or gradient fallback), name, status badge, start date, team count/max, format badge. "Create Tournament" FAB (owner/admin).
- **Tournament Detail Screen** — Tournament name, format, dates, prize pool, entry fee, registered teams count, status. Tabs: Bracket | Standings | Teams. "Register Team" button (captain, if registration open).
- **Create Tournament Screen** — Name, format selector (knockout/round_robin/group_knockout), max teams, start/end dates, registration deadline, entry fee, prize pool, description, sport category.
- **Edit Tournament Screen** — Pre-populated create form for editing.
- **Tournament Bracket Screen** — Visual bracket tree (knockout) or round-robin schedule grid. Rounds shown as columns, matches as nodes. Tap match to see detail or enter result.
- **Tournament Standings Screen** — Ranked table: rank, team name, MP, W, L, D, points, goal difference. Top 3 highlighted.
- **Tournament Registration Screen** — Select team from user's teams, confirm entry fee, "Register" button.

### 1.7 Leaderboards & Ratings (5 screens)
- **Global Leaderboard Screen** — Tabbed: Teams | Players. Team tab: ranked list (ELO descending), team name, W/L/D, top 3 with gold/silver/bronze icons. Player tab: ranked by rating average. Sport filter dropdown.
- **Sport Leaderboard Screen** — Sport-filtered version of global leaderboard.
- **Player Public Profile Screen** — Avatar, display name, role, city. Stats: matches played, wins, goals, assists, MoM awards, rating average. Recent matches list. Teams list.
- **Peer Review Screen** — Post-match rating form: skill (1-5 stars), sportsmanship (1-5 stars), punctuality (1-5 stars), optional review text. Submit button. Only available to captains of completed matches.
- **Player Stats Screen** — Detailed per-sport stats: matches played, wins, goals scored, assists, man of match count, average rating per sport. Charts for trend over time.

### 1.8 Chat (3 screens)
- **Chat Rooms List Screen** — List of ground chat rooms user is a member of. Each shows ground name, last message preview, timestamp, unread count badge. Pull to refresh.
- **Chat Room Screen** — Message list (bubbles, sent vs received styling), text input bar with send button, typing indicators, auto-scroll to bottom. Message timestamps. Pull to refresh for history.
- **New Chat Screen** — Search/select a ground to join chat (if GroundAccess or ChatParticipant exists).

### 1.9 Notifications (2 screens)
- **Notifications List Screen** — Chronological list with title, body, timestamp. Unread items have green left border + dot. Swipe to mark read. "Mark All Read" button in header.
- **Notification Settings Screen** — Toggle on/off per notification type: booking updates, match updates, team updates, promotional, payment confirmations.

### 1.10 Finance & Cash (Owner/Staff — 7 screens)
- **Finance Dashboard Screen** — Summary cards: total revenue (period filter), cash sessions count, pending payouts. Revenue chart (last 30 days). Quick actions: "Open Cash Session", "Record Payment".
- **Cash Session Open Screen** — Select ground (if multi-venue), enter opening cash amount, confirm open button.
- **Cash Session Close Screen** — Enter closing cash amount, system calculates variance and expected cash, confirmation dialog with variance warning if > threshold.
- **Cash Session History Screen** — List of past sessions with open time, close time, opening/closing cash, variance, status badge.
- **Record Payment Screen** — Search/select booking, enter amount, select payment method (Cash/JazzCash/Easypaisa/Bank Transfer/Card), enter idempotency reference, confirm button.
- **Financial Reports Screen** — Date range picker, report type selector (daily summary, payment method breakdown, sport breakdown), "Generate Report" button, download CSV/share button.
- **Ground Finance Summary Screen** — Per-ground breakdown: total revenue, online vs offline split, booking count, average booking value, top payment methods.

### 1.11 Ground Management (Owner — 12 screens)
- **My Grounds Screen** — Grid of owned grounds with image, name, city, verification badge, court count, status. "Add Ground" FAB.
- **Ground Management Dashboard Screen** — Single ground overview: quick stats (today's bookings, revenue today, open cash session status), action cards (Manage Courts, Schedules, Staff, Settings, Images, Payment Methods).
- **Create Ground Screen** — Name, address, city (dropdown), region, contact phone, description, coordinates (auto-detect or manual), "Create" button.
- **Edit Ground Screen** — Pre-populated form (name, address, city, description, phone, coordinates). "Save Changes" button.
- **Court Management Screen** — List of courts with name, sport, base price, max players, active/inactive toggle. "Add Court" button.
- **Create/Edit Court Screen** — Court name, sport category, base price, price per hour, deposit amount, max players, amenities (multi-select).
- **Schedule Management Screen** — Weekly grid showing open/close times per day. Tap day to edit. "Add Schedule" per day.
- **Ground Settings Screen** — Toggles: allow online booking, allow walk-in, require deposit. Sliders: deposit percentage, advance booking days, min/max booking duration. Cancellation policy selector.
- **Staff Management Screen** — List of staff with name, role badge (manager/staff), status. "Invite Staff" button. Swipe to remove.
- **Invite Staff Screen** — Phone number input, role selector (manager/staff), "Send Invite" button.
- **Ground Images Screen** — Grid of uploaded images with drag-to-reorder, primary image badge. "Add Image" button (camera/gallery picker). Tap to delete.
- **Ground Payment Methods Screen** — List of all payment methods with enable/disable toggle per method. Ordered by global → region → ground hierarchy.

### 1.12 Operations (Staff — 5 screens)
- **Operations Dashboard Screen** — Today's date, booking count for today, revenue collected today, open cash session indicator. Quick actions: "Walk-in Booking", "Open Cash Session".
- **Walk-in Booking Screen** — Player name, player phone, court selector, date (default today), time slot picker, amount display. "Create Walk-in" button (auto-approves and marks paid).
- **Today's Bookings Screen** — Chronological list of today's bookings with player name, court, time, amount, status. Tap for detail. "Approve" / "Reject" buttons on pending bookings.
- **Booking Approval Screen** — Booking detail view for staff: player info, court, time, amount, deposit status. "Approve" (green) and "Reject" (red) with reason input for rejection.
- **Quick Court Status Screen** — Visual grid of all courts with current status (available/in-use/booked-next). Quick toggle for "in-use" status.

### 1.13 Subscriptions & Billing (Owner — 6 screens)
- **Subscription Plans Screen** — Tier comparison cards (Free / Starter / Professional / Enterprise) with feature list, price/month, commission rate. Current plan highlighted. "Upgrade" / "Downgrade" button.
- **My Subscription Screen** — Current plan detail, status (active/past_due/suspended/cancelled), renewal date, billing history link. "Cancel Subscription" button (with confirmation flow).
- **Upgrade/Downgrade Screen** — Target plan selector, feature comparison, price difference, prorated amount shown, confirm button.
- **Billing History Screen** — Chronological invoice list with invoice number, period, amount, status (paid/overdue/cancelled). Tap invoice for detail.
- **Invoice Detail Screen** — Invoice number, billing period, plan name, amount, status, payment method, paid date. Download PDF button.
- **Payment Method Management Screen** — Saved payment methods list, "Add Payment Method" button (card details, JazzCash account).

### 1.14 Analytics (Owner — 6 screens)
- **Analytics Dashboard Screen** — Summary cards: revenue MTD, booking count MTD, commission earned, top sport. Select ground dropdown. Date range selector. Quick links to detailed analytics.
- **Revenue Analytics Screen** — Line chart (revenue over time), bar chart (revenue by payment method), pie chart (revenue by sport). Period filter.
- **Utilization Heatmap Screen** — 7×24 grid (day × hour) showing booking density as color intensity. Tap cell for detail (court name, booking count). Sport filter.
- **Booking Analytics Screen** — Bar charts: bookings per day, walk-in vs online ratio, cancellation rate trend. Average booking lead time. Top booked courts.
- **Customer Analytics Screen** — Charts: new vs returning customers per month, repeat booking rate, top 10 players by booking count, inactive player count.
- **Revenue Forecast Screen** — Projected revenue line (next 30 days based on 7-day moving average), confidence interval shading. Compare to actual.

### 1.15 Dynamic Pricing (Owner — 5 screens)
- **Pricing Rules Screen** — List of active pricing rules with day, time range, multiplier. "Add Rule" FAB. Weekend surge toggle at top.
- **Create/Edit Pricing Rule Screen** — Day selector (specific day or "All Days"), start time, end time, price multiplier (slider 0.5× – 3.0×). Save button.
- **Holiday Pricing Screen** — List of holiday pricing overrides with name, date, multiplier. "Add Holiday" button. Swipe to delete.
- **Coupon Management Screen** — List of active/expired coupons with code, discount, usage count/limit, valid dates. "Create Coupon" FAB.
- **Create/Edit Coupon Screen** — Code input (auto-generate option), type selector (percentage/fixed), value, min booking amount, max discount, usage limit, per-user limit, valid from/to, applicable sports (multi-select). Save button.

### 1.16 CRM & Communications (Owner — 5 screens)
- **Broadcast Messages Screen** — List of sent broadcasts with subject, audience count, sent date, delivery stats. "New Broadcast" FAB. Shows remaining monthly quota.
- **Create Broadcast Screen** — Subject input, body text area, optional CTA (label + URL), audience filter (booking recency, sport preference, frequency). Preview button. "Send" button with quota check.
- **Broadcast Analytics Screen** — Per-broadcast detail: sent count, delivered count, click count, delivery rate chart.
- **Communication Templates Screen** — List of pre-approved templates for SMS/WhatsApp/Email. Tap to preview. "Create Template" (super-admin).
- **Re-engagement Campaigns Screen** — List of automated campaigns (inactive players, inactive teams, subscription expiring). Enable/disable toggle per campaign.

### 1.17 Disputes & Refunds (5 screens)
- **My Disputes Screen** — List of filed disputes with type, reference, status, date. Tap for detail.
- **File Dispute Screen** — Dispute type selector (booking/payment/match/damage/no_show), reference selector (booking/match ID), description text area, image upload (multiple). Submit button.
- **Dispute Detail Screen** — Full dispute info: type, reference, status, description, images, timeline (submitted → under_review → resolved). Resolution notes (if resolved). Escalation countdown timer (if under_review).
- **Damage Claim Screen** (Staff) — Select booking, enter description, upload photos, enter estimated repair cost. Submit button.
- **Damage Claim Detail Screen** — Claim status, booking reference, photos, estimated cost, withheld amount. Resolution info if resolved.

### 1.18 Admin (Super Admin — 14 screens)
- **Admin Dashboard Screen** — Platform-wide metrics: total users, total grounds, total bookings, total revenue, commission earned, active subscriptions count, past_due alerts. Quick links to all admin sections.
- **User Management Screen** — Searchable, paginated user list. Tap for detail. Filter by role/status. Columns: avatar, name, email, role, status, join date, booking count.
- **User Detail Screen (Admin)** — User profile + admin controls: account status, subscription info (if ground owner), no-show count, booking history, grounds owned. "Toggle Active" button, "Change Role" dropdown.
- **Ground Moderation Screen** — All grounds list with verification status, suspension status, owner info. "Verify" / "Suspend" buttons. Filter by status.
- **Ground Detail Screen (Admin)** — Ground info + admin controls: verification toggle, suspension toggle, owner info, booking stats, court list.
- **Platform Finance Screen** — Revenue charts, subscription revenue vs commission split, top grounds by revenue, MTD/YTD summaries. Date range filter.
- **Commission Reports Screen** — Commission earned per ground, per owner, per period. Download CSV.
- **Subscription Management Screen (Admin)** — All subscriptions list with owner, plan, status, renewal date. Filter by status. Tap for detail. "Cancel" / "Reactivate" subscription.
- **Audit Logs Screen** — Searchable, paginated audit log with filters: action type, entity type, date range, userId. Log entries show action, entity, performer, IP, timestamp.
- **Dispute Moderation Queue Screen** — All disputes sorted by escalation level (escalated first), then creation date. Status badges. Tap to moderate.
- **Dispute Moderation Screen (Admin)** — Full dispute detail with evidence, two-party statements. Resolution actions: full refund, partial refund, no refund, penalty waived. Notes input. "Resolve" / "Reject" / "Request More Info" buttons.
- **Manage Regions Screen** — CRUD list: region name, code, cities count, display order. Add/Edit/Delete.
- **Manage Cities Screen** — CRUD list: city name, region, display order. Add/Edit/Delete.
- **Manage Sports Screen** — CRUD list: sport name, icon, min/max players, match duration. Add/Edit/Delete.
- **Manage Payment Methods Screen** — CRUD list: method name, type, category, icon, global enable/disable, display order. Add/Edit/Delete.

### 1.19 Profile & Settings (8 screens)
- **My Profile Screen** — Avatar (tap to change), display name, email (read-only), phone (read-only), role badge, city, join date. "Edit Profile" button. Player stats section.
- **Edit Profile Screen** — Change display name, avatar upload (camera/gallery picker), city selector. "Save" button.
- **Account Settings Screen** — Change password (current + new + confirm), delete account (with confirmation flow and reason).
- **Communication Preferences Screen** — Toggles: email notifications, SMS notifications, WhatsApp notifications, push notifications. Opt-in/opt-out per channel.
- **Notification Preferences Screen** — Toggle per event type: booking updates, match updates, team invites, promotional, payment confirmations.
- **Privacy Settings Screen** — Profile visibility (public/private), show on leaderboard toggle, data download request button.
- **Help & Support Screen** — FAQ sections, contact support form (subject + message), "Report Bug" button.
- **About Screen** — App version, terms of service link, privacy policy link, licenses.

---

## 2. Web Screens (Next.js 15 — 145 screens)

> The web app uses a sidebar navigation (collapsible 240px → 60px) with role-based nav items. The sidebar contains: logo, primary nav links, user section at bottom with avatar + name + role + logout.

### 2.1 Auth & Onboarding (6 screens)
- **Login Page** — `/login` — Centered card layout, email + password fields, "Forgot Password?" link, "Sign Up" CTA, branded header with logo + "Book. Play. Compete." tagline. Supports ?redirect= param for post-login redirect.
- **Signup Page** — `/signup` — Centered card, email + phone + password + confirm password. Validated with shared Zod schema. Redirects to `/verify-otp?email=` on success.
- **Verify OTP Page** — `/verify-otp` — 6-digit input, email auto-filled from query param, auto-login on verify, redirects to `/home`.
- **Forgot Password Page** — `/forgot-password` — Single email field, always shows success message, two-state UI (form → "Check Your Email").
- **Reset Password Page** — `/reset-password` — Email + OTP + new password + confirm. Redirects to `/login` on success.
- **Onboarding Wizard** — `/onboarding` — Multi-step setup for new users: select sport interests, allow location, notification permission prompt. Skippable.

### 2.2 Home & Ground Discovery (7 screens)
- **Home Page** — `/home` — Hero section with search bar + "Near Me" button, featured grounds grid (3-column responsive), sport category quick-filter chips, loading skeletons (3 skeleton cards with animate-pulse), empty state "No grounds found" with clear search button.
- **Search Results Page** — `/search?q=&city=&sport=` — Filtered results grid, sort dropdown (distance/rating/price), filter sidebar (city, sport, price range, rating), paginated results. Ground cards show image, name, city, price range, rating, verification badge.
- **Map View Page** — `/map` — Full-width Leaflet map occupying most of viewport, search overlay on top-left, result list overlay on right (collapsible), syncs with map viewport. Full-screen mode toggle.
- **Ground Detail Page** — `/home/ground/[id]` — Image gallery (2-column), ground info section (name, address, city, description, amenities tags), court listing sidebar with prices and "Book" buttons, "Get Directions" button, location map thumbnail, review section.
- **Court Booking Page** — `/home/ground/[id]/court/[courtId]/book` — Date picker (native input, min=today), available time slot grid (60-min slots, booked slots disabled/grayed), booking summary card (slide-up animation on slot select), coupon code input with "Apply", "Confirm Booking" button. Post-booking redirects to `/bookings`.
- **Booking Confirmation Page** — `/booking/confirmed/[id]` — Success animation, booking details card, "View My Bookings" CTA, "Book Another" CTA.
- **Ground Compare Page** — `/compare?ids=id1,id2,id3` — Side-by-side comparison of up to 3 grounds: pricing table, amenities comparison, ratings, availability view.

### 2.3 Bookings (3 screens)
- **My Bookings Page** — `/bookings` — Tabbed view (Upcoming | Past | All), booking cards with court name, ground name, date, time, amount, status badge. Loading: 3 skeleton cards. Empty: CalendarCheck icon + "Browse Grounds" CTA. Each card links to detail.
- **Booking Detail Page** — `/bookings/[id]` — Full booking info, status timeline, payment breakdown, action buttons (cancel if eligible, rate ground if completed). No-show flag if applicable.
- **Booking Admin Page (Staff)** — `/grounds/[id]/bookings` — Staff view of all bookings for a ground with filtering by date, status, court. Bulk approve/reject actions.

### 2.4 Teams (10 screens)
- **My Teams Page** — `/teams` — Grid of user's teams with name, ELO rating, W/L/D, member avatars (stacked, overflow count). "Create Team" button. Loading: 2 skeleton cards. Empty: "Create Your First Team" CTA.
- **Team Detail Page** — `/teams/[id]` — Team info header (name, sport, ELO, record), member grid, action buttons (Invite Members, Challenge Team, Leave Team). Tabs: Roster | Matches | Stats | Rating History.
- **Create Team Page** — `/teams/create` — Name input, sport category dropdown. Post-creation redirects to `/teams/[id]`.
- **Edit Team Page** — `/teams/[id]/edit` — Pre-populated name + sport fields. Save button.
- **Team Roster Page** — `/teams/[id]/members` — Full member table with avatar, name, role, jersey number, actions column (captain-only: change role, transfer captaincy, remove).
- **Invite Member Page** — `/teams/[id]/invite` — Email input + optional message. "Send Invite" button. Post-invite clears field + shows success toast.
- **Join Requests Page** — `/teams/[id]/join-requests` — Table of pending join requests with applicant info, message, Accept/Reject buttons.
- **Team Invitations Page** — `/invitations` — List of received team invitations with team card, inviter info, Accept/Reject buttons.
- **Team Settings Page** — `/teams/[id]/settings` — Team deletion with confirmation, captaincy transfer panel, team visibility toggle.
- **Team Stats Page** — `/teams/[id]/stats` — Detailed stats: ELO trend chart, match history table, per-sport breakdown, rating history timeline.

### 2.5 Matchmaking (7 screens)
- **My Matches Page** — `/matches` — Tabbed: Upcoming | Completed | Cancelled. Match cards (Team A vs Team B, date, court, score, status). Links to sent/received challenges sidebar.
- **Match Detail Page** — `/matches/[id]` — Scoreboard display, date/time/court/ground info. Score entry inputs (shown when scheduled, 2 number fields), cancel button, rate button (post-completion). Status badge.
- **Create Challenge Page** — `/matches/create` — Opponent team search/select, proposed date/time picker, sport category, court selection. Accepts ?teamId= query param for pre-fill. "Send Challenge" button.
- **Score Entry Page** — `/matches/[id]/score` — Two number input fields (your team score, opponent score), submit button. Shows confirmation if both scores match. Dispute option if mismatch.
- **Match Requests Sent Page** — `/matches/requests/sent` — List of sent challenges with recipient team, date, status, Cancel button on pending.
- **Match Requests Received Page** — `/matches/requests/received` — List of received challenges with sender team, date, Accept/Reject buttons.
- **Match Dispute Page** — `/matches/[id]/dispute` — Dispute form with type selector, description, screenshot upload.

### 2.6 Tournaments (8 screens)
- **Tournaments List Page** — `/tournaments` — Grid of tournament cards (poster image or gradient fallback, name, status badge, start date, team count/max, format). "Create Tournament" button (owner/admin). Loading: 3 skeleton cards.
- **Tournament Detail Page** — `/tournaments/[id]` — Tournament info header (name, format, dates, prize pool, entry fee, teams registered). Tabs: Bracket | Standings | Teams. "Register Team" button (if registration open). Bracket tab shows visual bracket tree or round-robin table.
- **Create Tournament Page** — `/tournaments/create` — Form: name, sport category, format selector, max teams, start/end dates, registration deadline, entry fee, prize pool, description. "Create" button.
- **Edit Tournament Page** — `/tournaments/[id]/edit` — Pre-populated create form. "Save Changes" button.
- **Tournament Bracket Page** — `/tournaments/[id]/bracket` — Full-screen bracket visualization. Knockout: round columns with match nodes. Round-robin: standings table. Tap match for detail/score entry.
- **Tournament Standings Page** — `/tournaments/[id]/standings` — Ranked table: rank, team, MP, W, L, D, points. Top 3 podium highlight. Paginated.
- **Tournament Registration Page** — `/tournaments/[id]/register` — Select team from user's teams dropdown, confirm entry fee, "Register" button.
- **Tournament Match Entry Page** — `/tournaments/[id]/matches/[matchId]/result` — Score inputs for both teams, winner selector, "Submit Result" button.

### 2.7 Leaderboards & Ratings (5 screens)
- **Global Leaderboard Page** — `/leaderboard` — Tabbed: Teams | Players. Team tab: ranked cards with ELO, W/L/D. Top 3 gold/silver/bronze highlight. Sport filter dropdown. Paginated.
- **Sport Leaderboard Page** — `/leaderboard/[sportId]` — Filtered leaderboard for specific sport.
- **Player Public Profile Page** — `/players/[id]` — Avatar, name, role, city. Stats cards: matches played, wins, goals, assists, MoM, rating average. Recent matches table. Teams list.
- **Match Rating Page** — `/matches/[id]/rate` — Three 5-star rating inputs (skill, sportsmanship, punctuality), review text area, "Submit Rating" button. Captains only.
- **Player Stats Page** — `/players/[id]/stats` — Per-sport stats breakdown, trend charts over time, per-match stat history table.

### 2.8 Chat (4 screens)
- **Chat Rooms Page** — `/chat` — Sidebar: list of joined ground chats with ground name, last message preview, unread count badge. Main area: selected chat room. Dual-pane layout.
- **Chat Room Page** — `/chat/[id]` — Message list (scrollable, auto-scroll to bottom), text input with send button, typing indicators, message timestamps, cursor-based pagination (load more on scroll to top).
- **Join Chat Page** — `/chat/join` — Ground ID input or ground selector. "Join Chat" button. Validates GroundAccess or ChatParticipant.
- **Chat Settings Page** — `/chat/[id]/settings` — Leave chat button, mute notifications toggle, member list.

### 2.9 Notifications (3 screens)
- **Notifications Page** — `/notifications` — Chronological list with title, body, timestamp, unread indicators (green left border + dot). "Mark All Read" button. Refresh button. Tab filter: All | Unread.
- **Notification Preferences Page** — `/notifications/preferences` — Toggle table per notification type. Per-channel toggles (in-app, email, push).
- **Notification History Page** — `/notifications/history` — Full archive with date range filter, search by title/body.

### 2.10 Finance & Cash (Owner/Staff — 8 screens)
- **Finance Dashboard Page** — `/finance` — Summary stat cards (Cash Sessions, Total Revenue, Pending Payouts). Revenue chart (recharts line chart, 30 days). Ground selector dropdown. "Open New Session" button. Session history table.
- **Cash Session Open Page** — `/grounds/[id]/cash-session/open` — Opening cash amount input, ground selector. "Open Session" button. Validates no other open session exists.
- **Cash Session Close Page** — `/grounds/[id]/cash-session/close` — Enter closing cash amount. System displays: opening cash, expected cash (opening + cash payments), calculated variance. "Close Session" button with variance warning.
- **Cash Session History Page** — `/grounds/[id]/cash-sessions` — Table of all sessions with open time, close time, opening/closing cash, variance, status. Filter by date range.
- **Record Payment Page** — `/bookings/[id]/payment` — Booking info summary, amount input, payment method dropdown, idempotency key (auto-generated or manual). "Record Payment" button.
- **Financial Reports Page** — `/grounds/[id]/reports` — Report type selector (daily summary, payment method breakdown, sport breakdown), date range picker, "Generate" button. Results displayed as table + chart. Download CSV.
- **Ground Finance Summary Page** — `/grounds/[id]/finance` — Total revenue, online/offline split, booking count, avg booking value, payment method breakdown chart.
- **Commission Summary Page** — `/finance/commission` — Platform commission earned, per-ground commission breakdown, commission rate display, period filter.

### 2.11 Ground Management (Owner — 12 screens)
- **My Grounds Page** — `/grounds` — Grid of owned grounds with image, name, city, verification badge, court count, status. "Add Ground" button. Actions per ground: Edit, View, Delete.
- **Ground Management Dashboard Page** — `/grounds/[id]/manage` — Today's bookings count, revenue today, open cash session status. Action cards grid: Manage Courts, Schedules, Staff, Settings, Images, Payment Methods.
- **Create Ground Page** — `/grounds/create` — Form: name, city (default Karachi), address, contact phone, description, coordinates. "Create" button. Redirects to detail on success.
- **Edit Ground Page** — `/grounds/[id]/edit` — FULL edit form: name, city, address, description, phone, coordinates. Image reorder. Pre-populated with existing data. Save button.
- **Court Management Page** — `/grounds/[id]/courts` — List of courts with name, sport, base price, max players, active toggle. "Add Court" button. Edit/delete per court.
- **Create/Edit Court Page** — `/grounds/[id]/courts/create` or `/courts/[id]/edit` — Form with name, sport category, base price, price per hour, deposit, max players, amenities.
- **Schedule Management Page** — `/grounds/[id]/schedules` — Weekly calendar grid. Tap day to edit open/close time and slot duration. Remove day schedule option.
- **Ground Settings Page** — `/grounds/[id]/settings` — Toggles and sliders: online booking, walk-in booking, deposit requirement, deposit percentage, cancellation policy, advance booking days, min/max duration.
- **Staff Management Page** — `/grounds/[id]/staff` — Staff table with name, role, status, invite date. "Invite Staff" button. Remove action.
- **Invite Staff Page** — `/grounds/[id]/invite` — Phone number input, role selector (manager/staff). "Send Invite" button.
- **Ground Images Page** — `/grounds/[id]/images` — Image grid with drag-reorder, set primary, delete. Upload area for new images.
- **Ground Payment Methods Page** — `/grounds/[id]/payment-methods` — Toggle list of all payment methods with current state per method.

### 2.12 Operations (Staff — 5 screens)
- **Operations Dashboard Page** — `/ops` — Today's date, today's booking count, today's revenue (summed), walk-in booking button. Booking list: player name, court, time, amount, status.
- **Walk-in Booking Page** — `/ops/walkin` — Player name + phone, court dropdown, date (default today), time slot picker, amount display. "Create Walk-in Booking" button (auto-approve + auto-paid).
- **Today's Bookings Page** — `/ops/bookings` — Full list of today's bookings with status filters. Approve/reject action on pending items per row.
- **Booking Approval Page** — `/ops/bookings/[id]/review` — Full booking detail with player info, court, time, amount. "Approve" / "Reject" buttons. Rejection reason text area.
- **Court Status Dashboard Page** — `/ops/courts` — Visual status board showing all courts with current state (available/in-use/booked-next). Color-coded indicators.

### 2.13 Subscriptions & Billing (Owner — 7 screens)
- **Subscription Plans Page** — `/subscriptions/plans` — Pricing table: 4 tiers side-by-side with feature columns, price/month, commission rate. Current plan highlighted. "Upgrade" / "Downgrade" CTA per tier.
- **My Subscription Page** — `/subscriptions` — Current plan card with status badge, renewal date, features list. "Change Plan" button. "Cancel Subscription" button (with confirmation modal). Billing history link.
- **Change Plan Page** — `/subscriptions/change` — Plan comparison table, select target plan, shows prorated amount for mid-cycle changes, confirm button.
- **Billing History Page** — `/subscriptions/billing` — Invoice table: invoice number, period, amount, status, paid date. Tap for detail. Filter by status/date.
- **Invoice Detail Page** — `/subscriptions/billing/[id]` — Full invoice: number, period, plan, amount, status, payment method, paid date, breakdown. "Download PDF" button.
- **Payment Methods Page** — `/subscriptions/payment-methods` — Saved cards/wallets list. "Add Method" button. Set default method. Remove method.
- **Cancel Subscription Page** — `/subscriptions/cancel` — Confirmation flow: reason selector, confirmation checkbox, "Confirm Cancellation" button. Shows end-of-period date.

### 2.14 Analytics (Owner — 7 screens)
- **Analytics Dashboard Page** — `/analytics` — Metric cards row (Revenue MTD, Bookings MTD, Commission, Top Sport), chart row (revenue trend, booking trend), ground selector dropdown, date range filter. Quick links to detailed analytics.
- **Revenue Analytics Page** — `/analytics/revenue` — Full revenue section: line chart (daily revenue with previous period comparison), bar chart (revenue by payment method), pie chart (revenue by sport). All with date range filter.
- **Utilization Heatmap Page** — `/analytics/utilization` — 7×24 heatmap grid with color intensity, sport/court filter, date range. Tap cell for tooltip with booking count and court names.
- **Booking Analytics Page** — `/analytics/bookings` — Charts: daily bookings (bar), walk-in vs online ratio (pie), cancellation rate trend (line), average lead time (metric card), top courts by booking count (horizontal bar).
- **Customer Analytics Page** — `/analytics/customers` — Charts: new vs returning (stacked bar), repeat rate (metric), top players (table), inactive count (metric). Date range filter.
- **Revenue Forecast Page** — `/analytics/forecast` — Projected revenue line chart with confidence interval, next 30 days. Compare actual vs forecast table.
- **Download Reports Page** — `/analytics/reports` — Report generator: select ground, report type (revenue/bookings/utilization/customers), date range, format (CSV/PDF). "Generate & Download" button.

### 2.15 Dynamic Pricing (Owner — 6 screens)
- **Pricing Rules Page** — `/pricing/rules` — Table of active pricing rules: day, time range, multiplier, status toggle. Weekend surge master toggle at top. "Add Rule" button. "Holiday Pricing" link.
- **Create/Edit Pricing Rule Page** — `/pricing/rules/create` or `/pricing/rules/[id]/edit` — Day selector (multi-select or "All Days"), start/end time pickers, multiplier slider (0.5× – 3.0×), apply to specific court or all courts. Save button.
- **Holiday Pricing Page** — `/pricing/holidays` — List of holiday overrides with name, date, multiplier. "Add Holiday" button. Edit/delete per entry.
- **Coupon Management Page** — `/pricing/coupons` — Table: code, type, value, usage (used/limit), valid dates, status. "Create Coupon" button. Filter by status.
- **Create/Edit Coupon Page** — `/pricing/coupons/create` or `/pricing/coupons/[id]/edit` — Code (auto-generate or manual), type (percentage/fixed), value, min amount, max discount, usage/ per-user limits, valid from/to, applicable sports.
- **Price Preview Page** — `/pricing/preview` — Select court, date, time slot. System displays calculated price with applied rules (peak/off-peak/weekend/holiday/coupon). Debug view showing rule stack.

### 2.16 CRM & Communications (Owner — 6 screens)
- **Broadcast Messages Page** — `/crm/broadcasts` — Table of sent broadcasts: subject, audience count, sent date, delivery rate, click rate. Monthly quota indicator. "New Broadcast" button.
- **Create Broadcast Page** — `/crm/broadcasts/create` — Subject, body (rich text editor), CTA label + URL, audience filter panel (booking recency, sport preference, frequency). Preview panel. "Send" button with quota confirmation.
- **Broadcast Analytics Page** — `/crm/broadcasts/[id]` — Delivery stats: sent/delivered/failed/clicked counts, delivery timeline chart, audience breakdown.
- **Communication Templates Page** — `/crm/templates` — Table of pre-approved templates (SMS/WhatsApp/Email). "Create Template" (admin only). Preview/edit per template.
- **Re-engagement Campaigns Page** — `/crm/campaigns` — List of automated campaigns: name, trigger condition, audience, status (active/inactive). Toggle enable/disable. Edit trigger settings.
- **Communication Preferences Page** — `/crm/preferences` — Toggle grid per channel × event type. Per-ground override for owner-level preferences.

### 2.17 Disputes & Refunds (6 screens)
- **My Disputes Page** — `/disputes` — Table of filed disputes: type, reference, status, date. Actions: view detail, add evidence (if under_review). Filter by status/type.
- **File Dispute Page** — `/disputes/file` — Dispute type selector (booking/payment/match/damage/no_show), reference type selector, reference ID input/search, description text area, file upload (multiple images). "Submit" button.
- **Dispute Detail Page** — `/disputes/[id]` — Full dispute record: type, reference, status timeline, description, evidence images, assigned moderator. Escalation countdown timer. Resolution notes (if resolved).
- **Damage Claim Page (Staff)** — `/bookings/[id]/damage-claim` — Booking reference display, damage description, photo upload, estimated repair cost input. "Submit Claim" button.
- **Dispute Moderation Page (Admin)** — `/admin/disputes/[id]` — Two-panel view: dispute details + evidence on left, moderation actions on right. Resolution action selector, notes text area. "Resolve" / "Reject" / "Escalate" / "Request More Info" buttons.
- **Dispute Moderation Queue Page (Admin)** — `/admin/disputes` — Table of all disputes sorted by priority (escalated first, then by age). Filters: status, type, date range. Bulk assign to admin.

### 2.18 Admin (Super Admin — 15 screens)
- **Admin Dashboard Page** — `/admin` — Platform metrics cards: total users, grounds, bookings, revenue, commission. Quick action tiles: Manage Users, Moderate Grounds, View Finance, Audit Logs, Subscriptions. Tabs: Users (functional) | Grounds (coming soon) | Finance (coming soon) | Settings (coming soon).
- **User Management Page** — `/admin/users` — Searchable, paginated table: avatar, name, email, role badge, status, join date, booking count. Toggle active/inactive. Filter by role/status.
- **User Detail Page (Admin)** — `/admin/users/[id]` — Full user info + admin controls: role change dropdown, active toggle, no-show count, subscription info (if owner), booking history table, grounds owned list.
- **Ground Moderation Page** — `/admin/grounds` — Table of all grounds: name, owner, city, verification badge, status, court count, booking count. "Verify" / "Suspend" action buttons per row. Filter by verification/suspension status.
- **Ground Detail Page (Admin)** — `/admin/grounds/[id]` — Ground info + admin verification/suspension controls, owner contact info, booking stats, revenue stats, court list.
- **Platform Finance Page** — `/admin/finance` — Revenue charts (total, subscription, commission), top 10 grounds by revenue table, MTD/YTD summaries, payment method split chart. Date range filter.
- **Commission Reports Page** — `/admin/commission` — Per-ground commission table, per-owner aggregation, period filter. "Download CSV" button.
- **Subscription Management Page (Admin)** — `/admin/subscriptions` — Table: owner name, plan, status, renewal date, payment method. Filter by status. Actions: cancel, reactivate, change plan.
- **Subscription Plan Management Page (Admin)** — `/admin/subscriptions/plans` — CRUD for tier definitions: name, price, interval, features JSON, max limits, commission rate. Add/Edit/Delete plans.
- **Audit Logs Page** — `/admin/audit-logs` — Searchable log table: timestamp, action, entity type, entity ID, performer, IP address. Filters: action type, entity type, date range, user. Paginated.
- **Dispute Moderation Queue Page (Admin)** — `/admin/disputes` — Prioritized queue (escalated first, then oldest). Type/status filters. Tap to moderate.
- **Dispute Moderation Page (Admin)** — `/admin/disputes/[id]` — Full evidence review panel, resolution action selector, notes. Escalate/reject/resolve buttons.
- **Manage Regions Page** — `/admin/regions` — CRUD table: name, code, display order, city count. Add/Edit/Delete.
- **Manage Cities Page** — `/admin/cities` — CRUD table: name, region selector, display order. Add/Edit/Delete.
- **Manage Sports Page** — `/admin/sports` — CRUD table: name, icon, min/max players, match duration. Add/Edit/Delete.
- **Manage Payment Methods Page** — `/admin/payment-methods` — CRUD table: method name, type, category, icon, display order, global active toggle. Add/Edit/Delete.

### 2.19 Profile & Settings (7 screens)
- **My Profile Page** — `/profile` — Avatar (large), display name, role badge, email (read-only), phone (read-only), city. Editable: display name only. "Save" button. Player stats summary.
- **Edit Profile Page** — `/profile/edit` — Change display name, avatar upload, city selector. "Save" button.
- **Account Settings Page** — `/profile/settings` — Change password section (current + new + confirm), "Change Password" button. Danger zone: "Delete Account" with confirmation modal and reason input.
- **Communication Preferences Page** — `/profile/preferences` — Toggle table: per channel (email/SMS/WhatsApp/push) × per event type. Saved on toggle.
- **Notification Preferences Page** — `/profile/notifications` — Toggle per notification type (booking/match/team/promotional/payment). Per-channel override.
- **Privacy Settings Page** — `/profile/privacy` — Profile visibility toggle, leaderboard opt-out, data download request button, GDPR-style data deletion request.
- **Help & Support Page** — `/help` — FAQ accordion sections, "Contact Support" form (subject + message + priority), "Report Bug" button with screenshot upload. Links to Terms of Service and Privacy Policy.

### 2.20 Utility & Error Pages (5 screens)
- **404 Not Found Page** — Custom 404 with branded illustration, "Go Home" button.
- **500 Error Page** — Custom 500 with error reference code (correlation ID), "Try Again" and "Contact Support" buttons.
- **403 Forbidden Page** — Access denied page with role info, "Go Home" button.
- **Maintenance Page** — Scheduled maintenance banner with estimated completion time.
- **Loading/Splash Page** — Full-screen branded spinner shown while auth state is being determined (pulsing logo + "PLAYARENA").

---

## 3. Cross-Platform Screen Mapping

> Screens that exist on BOTH mobile and web with identical purpose (UI adaptation only).

| # | Screen Name | Mobile Route | Web Route |
|---|---|---|---|
| 1 | Splash / Initial Loading | Splash Screen | Loading Page |
| 2 | Login | /login | /login |
| 3 | Signup | /signup | /signup |
| 4 | Verify OTP | /verify-otp | /verify-otp |
| 5 | Forgot Password | /forgot-password | /forgot-password |
| 6 | Reset Password | /reset-password | /reset-password |
| 7 | Home / Discover | Home Tab → Home | /home |
| 8 | Search Results | Search → Results | /search |
| 9 | Map View | Map Tab or Inline | /map |
| 10 | Ground Detail | Ground → Detail | /home/ground/[id] |
| 11 | Court Booking | Ground → Court → Book | /home/ground/[id]/court/[courtId]/book |
| 12 | Booking Confirmation | Booking → Confirmed | /booking/confirmed/[id] |
| 13 | My Bookings | Bookings Tab | /bookings |
| 14 | Booking Detail | Bookings → [id] | /bookings/[id] |
| 15 | My Teams | Teams Tab | /teams |
| 16 | Team Detail | Teams → [id] | /teams/[id] |
| 17 | Create Team | Teams → Create | /teams/create |
| 18 | Team Roster | Teams → [id] → Roster | /teams/[id]/members |
| 19 | Invite Member | Teams → [id] → Invite | /teams/[id]/invite |
| 20 | Join Requests | Teams → [id] → Join Requests | /teams/[id]/join-requests |
| 21 | Team Invitations | Profile → Invitations | /invitations |
| 22 | My Matches | Matches Tab | /matches |
| 23 | Match Detail | Matches → [id] | /matches/[id] |
| 24 | Create Challenge | Matches → Create | /matches/create |
| 25 | Match Requests Sent | Matches → Sent | /matches/requests/sent |
| 26 | Match Requests Received | Matches → Received | /matches/requests/received |
| 27 | Tournaments List | Tournaments Tab | /tournaments |
| 28 | Tournament Detail | Tournaments → [id] | /tournaments/[id] |
| 29 | Create Tournament | Tournaments → Create | /tournaments/create |
| 30 | Tournament Bracket | Tournaments → [id] → Bracket | /tournaments/[id]/bracket |
| 31 | Tournament Standings | Tournaments → [id] → Standings | /tournaments/[id]/standings |
| 32 | Global Leaderboard | Leaderboard Tab | /leaderboard |
| 33 | Player Public Profile | Players → [id] | /players/[id] |
| 34 | Chat Rooms | Chat Tab / Inbox | /chat |
| 35 | Chat Room | Chat → [id] | /chat/[id] |
| 36 | Notifications List | Notifications Tab | /notifications |
| 37 | Finance Dashboard | Finance Tab (Owner) | /finance |
| 38 | Cash Session Open | Finance → Open Session | /grounds/[id]/cash-session/open |
| 39 | Cash Session Close | Finance → Close Session | /grounds/[id]/cash-session/close |
| 40 | Record Payment | Bookings → [id] → Pay | /bookings/[id]/payment |
| 41 | My Grounds | Grounds Tab (Owner) | /grounds |
| 42 | Ground Management Dashboard | Grounds → [id] → Manage | /grounds/[id]/manage |
| 43 | Create Ground | Grounds → Create | /grounds/create |
| 44 | Edit Ground | Grounds → [id] → Edit | /grounds/[id]/edit |
| 45 | Court Management | Grounds → [id] → Courts | /grounds/[id]/courts |
| 46 | Schedule Management | Grounds → [id] → Schedules | /grounds/[id]/schedules |
| 47 | Ground Settings | Grounds → [id] → Settings | /grounds/[id]/settings |
| 48 | Staff Management | Grounds → [id] → Staff | /grounds/[id]/staff |
| 49 | Operations Dashboard | Ops Tab (Staff) | /ops |
| 50 | Walk-in Booking | Ops → Walk-in | /ops/walkin |
| 51 | Today's Bookings (Staff) | Ops → Bookings | /ops/bookings |
| 52 | Subscription Plans | Profile → Subscription | /subscriptions/plans |
| 53 | My Subscription | Profile → Subscription | /subscriptions |
| 54 | Billing History | Subscription → Billing | /subscriptions/billing |
| 55 | Analytics Dashboard | Analytics Tab (Owner) | /analytics |
| 56 | Revenue Analytics | Analytics → Revenue | /analytics/revenue |
| 57 | Utilization Heatmap | Analytics → Utilization | /analytics/utilization |
| 58 | Pricing Rules | Pricing Tab (Owner) | /pricing/rules |
| 59 | Coupon Management | Pricing → Coupons | /pricing/coupons |
| 60 | Broadcast Messages | CRM Tab (Owner) | /crm/broadcasts |
| 61 | My Disputes | Profile → Disputes | /disputes |
| 62 | File Dispute | Disputes → File | /disputes/file |
| 63 | Admin Dashboard | Admin Tab | /admin |
| 64 | User Management (Admin) | Admin → Users | /admin/users |
| 65 | Ground Moderation (Admin) | Admin → Grounds | /admin/grounds |
| 66 | Platform Finance (Admin) | Admin → Finance | /admin/finance |
| 67 | Audit Logs (Admin) | Admin → Audit | /admin/audit-logs |
| 68 | Dispute Moderation (Admin) | Admin → Disputes | /admin/disputes |
| 69 | Manage Reference Data (Admin) | Admin → Settings | /admin/regions, /admin/cities, /admin/sports, /admin/payment-methods |
| 70 | My Profile | Profile Tab | /profile |
| 71 | Edit Profile | Profile → Edit | /profile/edit |
| 72 | Account Settings | Profile → Settings | /profile/settings |
| 73 | Notification Preferences | Profile → Notifications | /profile/notifications |
| 74 | Communication Preferences | Profile → Preferences | /profile/preferences |
| 75 | Help & Support | Profile → Help | /help |

---

## 4. Screen Summary by Role

> Screens visible per user role. Numbers reference the screen list above.

### 4.1 Player (50 screens)
Login, Signup, OTP, Forgot/Reset Password, Home, Search Results, Map View, Ground Detail, Court Booking, Booking Confirmation, My Bookings, Booking Detail, My Teams (list/detail/create), Team Roster, Team Invitations, My Matches (list/detail/create), Score Entry, Match Requests (sent/received), Tournaments (list/detail), Tournament Bracket, Tournament Standings, Tournament Registration, Global Leaderboard, Player Public Profile, Player Stats, Match Rating, Chat Rooms, Chat Room, Notifications List, Notification Preferences, Communication Preferences, My Profile, Edit Profile, Account Settings, Help & Support, File Dispute, My Disputes, Dispute Detail.

### 4.2 Ground Owner (80 screens)
All Player screens (50) PLUS: Finance Dashboard, Cash Session (open/close/history), Record Payment, Financial Reports, Ground Finance Summary, My Grounds (list/manage), Ground Management Dashboard, Create/Edit Ground, Court Management, Create/Edit Court, Schedule Management, Ground Settings, Staff Management, Invite Staff, Ground Images, Ground Payment Methods, Subscription Plans, My Subscription, Change Plan, Billing History, Invoice Detail, Payment Methods, Cancel Subscription, Analytics Dashboard, Revenue Analytics, Utilization Heatmap, Booking Analytics, Customer Analytics, Revenue Forecast, Download Reports, Pricing Rules, Create/Edit Pricing Rule, Holiday Pricing, Coupon Management, Create/Edit Coupon, Price Preview, Broadcast Messages, Create Broadcast, Broadcast Analytics, Re-engagement Campaigns.

### 4.3 Ground Staff (60 screens)
All Player screens (50) PLUS: Operations Dashboard, Walk-in Booking, Today's Bookings, Booking Approval, Court Status Dashboard, Record Payment, Cash Session (open/close/history), Damage Claim (file/detail).

### 4.4 Ground Manager (65 screens)
All Ground Staff screens (60) PLUS: Ground Finance Summary, Ground Settings, Staff Management, Invite Staff, Schedule Management, Ground Management Dashboard.

### 4.5 Super Admin (85 screens)
All Player screens (50, excluding team/match features) PLUS: Admin Dashboard, User Management (list/detail), Ground Moderation (list/detail), Platform Finance, Commission Reports, Subscription Management, Subscription Plan Management, Audit Logs, Dispute Moderation Queue, Dispute Moderation, Manage Regions, Manage Cities, Manage Sports, Manage Payment Methods, All Subscriptions screens, All CRM screens, All Analytics screens (read-only).