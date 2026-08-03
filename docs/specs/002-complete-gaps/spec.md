# Feature Specification: Platform Gap Closure — Missing Modules & SaaS Features

**Feature Branch**: `002-complete-gaps`  
**Created**: 2026-07-30  
**Status**: Draft  
**Input**: Full workspace observation audit (2122+ lines across 100+ files)

## User Scenarios & Testing

### User Story 1 — Player Receives Real-Time Notifications (Priority: P1)

A player creates a booking, and the system sends real-time notifications for every status change — booking confirmed, approved, rejected, or cancelled — both in-app via WebSocket and as persisted records.

**Why this priority**: Notifications are cross-cutting across ALL modules. Without them, users have no feedback loop for bookings, matches, teams, or payments. Every other feature depends on this communication channel.

**Independent Test**: A player creates a booking and immediately receives a notification (WebSocket event) AND a persisted notification record queryable via API. The notification gateway authenticates via JWT and delivers to the correct user room.

**Acceptance Scenarios**:
1. **Given** an authenticated player, **When** they create a booking, **Then** the system emits a `notification.created` event and the player receives a WebSocket notification in their `user:{userId}` room with title, body, and booking reference
2. **Given** a ground staff member, **When** they approve a booking, **Then** the booking player receives a "Booking Approved" notification via WebSocket and the notification is persisted with status `queued`
3. **Given** a user with 5+ unread notifications, **When** they call `GET /notifications/unread-count`, **Then** the response returns `{ count: 5 }`
4. **Given** a user marks a notification as read, **When** they view their notification list, **Then** that notification no longer appears as unread

---

### User Story 2 — Player Submits Peer Review and Views Leaderboard (Priority: P2)

After a completed match, the team captain submits a peer review (skill, sportsmanship, punctuality) and views the global leaderboard ranked by ELO rating.

**Why this priority**: The rating system is the core competitive feedback loop that drives user engagement, team formation, and match quality. Without it, there is no incentive for competitive play.

**Independent Test**: A captain of a completed match submits a 5-star peer review and sees the team's updated ranking on the leaderboard within seconds.

**Acceptance Scenarios**:
1. **Given** a completed match, **When** the captain submits peer ratings (skill: 4, sportsmanship: 5, punctuality: 3) with optional review text, **Then** the rating is persisted and the `RatingSubmittedEvent` is emitted
2. **Given** two users have rated each other, **When** either views the match detail, **Then** both ratings are visible
3. **Given** a user views the leaderboard, **When** they filter by sport category, **Then** the response shows teams ranked by ELO descending with W/L/D record, paginated

---

### User Story 3 — Super Admin Manages Platform and Views Audit Logs (Priority: P2)

A super admin accesses the admin panel to manage users, moderate grounds, view platform-wide finance analytics, and inspect audit logs.

**Why this priority**: Without admin tools, the platform cannot operate at scale — no user moderation, ground verification, or financial oversight. Required for production operations.

**Independent Test**: A super admin logs in, views a paginated user list with search, verifies a ground, and confirms the action appears in the audit log.

**Acceptance Scenarios**:
1. **Given** a super admin, **When** they call `GET /admin/users` with pagination params, **Then** the response returns paginated user list with id, name, email, role, status, join date, and booking count
2. **Given** a super admin verifies a ground, **When** they call `PATCH /admin/grounds/:id/verify`, **Then** the ground's `isVerified` flag is set to true and an audit log entry is created
3. **Given** a super admin, **When** they call `GET /admin/audit-logs` with optional filters (action, entityType, dateRange), **Then** the response returns paginated audit log entries with timestamp, action, entityType, entityId, performer, IP address

---

### User Story 4 — Ground Owner Uploads Images with Validation (Priority: P3)

A ground owner uploads images for their venue with proper file type and size validation, and the uploaded images are stored securely with folder-based organization.

**Why this priority**: Ground images are essential for user discovery and booking decisions. Without uploads, ground listings lack visual content, reducing conversion. The health endpoint is a trivial but necessary operations tool.

**Independent Test**: An owner uploads a 3MB JPEG ground image and receives back a URL pointing to the stored S3 object.

**Acceptance Scenarios**:
1. **Given** an authenticated ground owner, **When** they upload a valid JPEG image under 5MB to `/upload/ground-image`, **Then** the file is stored in the appropriate folder and the response returns the S3 object URL
2. **Given** any user, **When** they try to upload a 15MB file, **Then** the system rejects the upload with a `VALIDATION_ERROR` and a clear file-size-exceeded message
3. **Given** any user, **When** they try to upload an `.exe` file to the avatar endpoint, **Then** the system rejects with MIME type validation error
4. **Given** any user, **When** they call `GET /health`, **Then** the response returns `{ status: "ok", services: { database: { status: "up", latencyMs: <number> } } }`

---

### User Story 5 — Subscription & Billing Lifecycle (Priority: P3)

A ground owner subscribes to a paid plan, receives invoices, and the system enforces feature limits based on their tier.

**Why this priority**: Subscription monetization is the business model. Without it, the platform cannot generate revenue. However, it depends on all other modules being complete first.

**Independent Test**: A ground owner selects the Professional plan, completes payment, and immediately gains access to unlimited ground listings. Their previous Free-tier grounds remain active under the new tier.

**Acceptance Scenarios**:
1. **Given** a ground owner on the Free tier with 1 ground, **When** they upgrade to Professional, **Then** their subscription status changes to `active` with immediate effect and prorated billing
2. **Given** a past-due subscription for 14+ days, **When** any user searches for that owner's grounds, **Then** the grounds are excluded from search results (suspended)
3. **Given** a Professional subscriber with 3 grounds, **When** they try to create a 4th ground, **Then** the system blocks creation with a tier-limit-exceeded message

---

### User Story 6 — Geolocation-Based Ground Discovery (Priority: P3)

A user searches for grounds near their current location and sees results sorted by distance with map markers and directions.

**Why this priority**: Geolocation search is a key differentiator and expected UX pattern for location-based discovery. It enhances the core ground browsing experience.

**Independent Test**: A user enters their latitude/longitude and a 10km radius, and the system returns all verified grounds within that radius sorted by distance with calculated travel time.

**Acceptance Scenarios**:
1. **Given** a user at coordinates (24.8607, 67.0011), **When** they search with 5km radius, **Then** the response includes grounds within 5km sorted by nearest-first with distance in km and estimated travel time
2. **Given** a ground detail page, **When** the user clicks "Get Directions", **Then** a Google Maps directions URL is generated with the ground's coordinates as destination

---

### Edge Cases

- What happens when a user creates a booking and the notification service is down? Notifications should be queued via Bull and retried with exponential backoff, max 3 retries before moving to `dead_letter` status
- How does the leaderboard handle teams with zero matches? Show ELO at baseline (1200), rank them at the bottom of their ELO cohort
- What happens when an admin deletes a user with associated bookings, teams, and grounds? Soft-delete cascading — user marked inactive, grounds transfer to super admin, bookings become orphaned with admin reference
- How does the system handle concurrent upload requests to S3 when AWS credentials are temporarily unavailable? Uploads should fail gracefully with a retryable error message and log the failure for monitoring
- How does the subscription system handle a payment gateway timeout during upgrade? The payment should be recorded as `pending` and retried; subscription status remains on current plan until payment confirmation
- How does geolocation search handle areas with no grounds within the specified radius? Return an empty results array with a user-friendly message ("No grounds found within 10km. Try expanding your search radius.")
- How does the audit log handle extremely high-volume actions (e.g., 10,000 automated rating decay operations)? Batch audit log writes in transactions and consider TTL-based archival for older entries

## Requirements

### Functional Requirements

- **FR-001**: System MUST deliver real-time notifications to users via WebSocket for booking status changes, match events, team events, and payment confirmations
- **FR-002**: System MUST persist all notifications in the database with fields: title, body, type, metadata (JSON), userId, status (queued/sent/failed/dead_letter), retryCount, readAt
- **FR-003**: Users MUST be able to query their notifications (paginated), mark individual or all notifications as read, and soft-delete notifications
- **FR-004**: System MUST support unread notification count query and WebSocket-based real-time delivery via a `/notifications` Socket.IO namespace
- **FR-005**: System MUST allow team captains to submit peer ratings (skill 1-5, sportsmanship 1-5, punctuality 1-5) with optional review text after match completion
- **FR-006**: System MUST upsert ratings so only the most recent rating per match per rater is retained
- **FR-007**: System MUST emit `RatingSubmittedEvent` when a peer review is submitted
- **FR-008**: System MUST maintain aggregate player stats (matchesPlayed, wins, goalsScored, assists, manOfMatch, ratingAverage) per user per sport, updated on match completion
- **FR-009**: System MUST provide a global leaderboard sorted by ELO rating descending, filterable by sport category, with pagination and top-3 highlighting
- **FR-010**: System MUST require authentication for ALL admin endpoints with `super_admin` role enforcement
- **FR-011**: System MUST provide paginated, searchable user management (list, detail, role change, status toggle) for super admins
- **FR-012**: System MUST allow super admins to verify grounds (set `isVerified = true`) and suspend grounds (set `isActive = false`)
- **FR-013**: System MUST provide platform-wide finance analytics (totalRevenue, online/offline split, bookingCount) for super admins
- **FR-014**: System MUST maintain an append-only audit log for all sensitive actions (booking status changes, payment recording, ground verification/suspension, user role changes)
- **FR-015**: System MUST support CRUD operations on reference data (regions, cities, sport categories, payment methods) restricted to super_admin role
- **FR-016**: System MUST allow authenticated users to upload files to S3 with per-endpoint MIME type and file size validation
- **FR-017**: System MUST support 6 upload endpoints with specific constraints: booking-proof (10MB, jpeg/png/webp/pdf), ground-image (5MB, jpeg/png/webp), team-logo (5MB, jpeg/png/webp), tournament-poster (5MB, jpeg/png/webp), avatar (5MB, jpeg/png/webp), general
- **FR-018**: System MUST expose a public health endpoint at `GET /health` that performs a database connectivity check and returns status with latency
- **FR-019**: System MUST provide a tiered subscription system with Free/Starter/Professional/Enterprise plans, each with defined feature limits and commission rates
- **FR-020**: System MUST enforce subscription feature gating at the backend level — ground creation, court limits, analytics access, CRM tools, and dynamic pricing features are restricted per plan
- **FR-021**: System MUST generate invoices at the start of each billing cycle and support payment lifecycle (pending, paid, overdue, cancelled, refunded)
- **FR-022**: System MUST support automated subscription lifecycle: active → past_due (payment failed) → suspended (14 days) → cancelled (30 days), with notification emails at each stage
- **FR-023**: System MUST provide a geolocation-based ground search endpoint accepting latitude, longitude, radius (km), and optional sport/city filters, returning results sorted by distance
- **FR-024**: System MUST calculate and return estimated distance and travel time for each search result
- **FR-025**: System MUST generate Google Maps/Waze directions URLs from ground detail pages

### Key Entities

- **Notification**: Represents a user-facing alert triggered by system events. Contains userId, title, body, type, metadata (JSON), status (queued/sent/failed/dead_letter), retryCount, readAt. Linked to User. Soft-deletable via deletedAt.
- **NotificationPreference**: Per-user toggle for each notification type and channel. User can opt in/out of specific notification categories (booking, match, team, promotional, payment).
- **MatchRating**: Peer review record for a completed match. Contains matchId, raterId, ratedTeamId, skillRating, sportsmanshipRating, punctualityRating, reviewText. One rating per rater per match (upserted).
- **PlayerStat**: Aggregate statistics per user per sport. Contains matchesPlayed, wins, goalsScored, assists, manOfMatch, ratingAverage. Computed from PlayerMatchStat records on match completion.
- **LeaderboardEntry**: Derived view of teams sorted by ELO rating descending. Contains team name, sport, ELO, wins/losses/draws. Top 3 highlighted.
- **AuditLog**: Append-only record of sensitive system actions. Contains action, entityType, entityId, performedById, ipAddress, groundId, metadata (JSON). Never updated or deleted.
- **UploadedFile**: Metadata record for uploaded files. Contains userId, fileType, originalName, mimeType, size, s3Key, s3Url, folderType. Generated on successful S3 upload.
- **HealthCheck**: Not a persisted entity — runtime diagnostic. Captures database connectivity status and latency in milliseconds.
- **SubscriptionPlan**: Tier definition. Contains planId, name, price (Decimal 12,2), interval (monthly/yearly), maxGrounds, maxCourtsPerGround, maxBookingsPerMonth, commissionRate (Decimal 5,4), features (JSON), isActive, sortOrder.
- **GroundOwnerSubscription**: Per-owner subscription record. Contains subscriptionId, groundOwnerId, planId, status (active/past_due/suspended/cancelled/expired), currentPeriodStart, currentPeriodEnd, cancelledAt.
- **Invoice**: Billing record generated per subscription cycle. Contains invoiceId, subscriptionId, groundOwnerId, invoiceNumber (unique), amount, status (pending/paid/overdue/cancelled/refunded), periodStart, periodEnd.
- **PricingRule**: Dynamic pricing rule for time-based multipliers. Contains ruleId, groundId, courtId (optional), sportCategoryId (optional), dayOfWeek, startTime, endTime, priceMultiplier (Decimal 3,2), isActive, priority.
- **Coupon**: Discount coupon for bookings. Contains couponId, groundId (optional), code (unique), type (percentage/fixed_amount), value, usageLimit, perUserLimit, validFrom, validUntil, applicableSportIds.
- **Dispute**: Moderation record for conflicts. Contains disputeId, disputeType (booking/payment/match/damage/no_show/other), referenceType, referenceId, filedById, description, supportingImageUrls (JSON), status (submitted/under_review/resolved/rejected/escalated).

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users receive notifications within 500ms of the triggering event under normal load (WebSocket connected, no network issues)
- **SC-002**: Notification delivery achieves 99.5% success rate (notifications that reach `sent` status without entering `dead_letter`)
- **SC-003**: Users can view their notification history with pagination supporting at least 10,000 notifications per user without performance degradation
- **SC-004**: Peer ratings are submitted and reflected in aggregate stats within 2 seconds of submission
- **SC-005**: The leaderboard loads and renders within 1 second for up to 10,000 teams
- **SC-006**: Admin user management pages support search across 100,000+ users with results returned within 2 seconds
- **SC-007**: File uploads for ground images (up to 5MB) complete within 5 seconds under standard network conditions
- **SC-008**: The health endpoint responds within 100ms with accurate database status
- **SC-009**: Subscription feature gating prevents 100% of unauthorized actions (ground creation beyond tier limit, analytics access without Professional+ tier)
- **SC-010**: Geolocation searches within a 50km radius return results within 3 seconds for up to 1,000 grounds
- **SC-011**: Invoice generation for a billing cycle completes within 5 minutes for up to 10,000 concurrent renewals
- **SC-012**: Dispute resolution (super admin action) takes effect within 1 second and correctly updates all related records (refund, penalty, etc.)
