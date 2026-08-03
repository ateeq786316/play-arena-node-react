# Feature Specification: SaaS Monetization & Business Tools

**Feature Branch**: `003-saas-subs-analytics-crm`
**Created**: 2026-07-30
**Status**: Draft
**Input**: User description: "SaaS subscription billing, analytics dashboards, CRM broadcasts, dynamic pricing engine, dispute resolution, and geolocation search for ground owners"

## User Scenarios & Testing

### User Story 1 — Subscribe to a Plan (Priority: P1)

A ground owner wants to upgrade from free to a paid plan so they can manage multiple grounds, access analytics, and use CRM features.

**Why this priority**: Unlocks revenue and is the foundation all other SaaS features depend on.

**Independent Test**: Can be fully tested by creating a ground owner account, viewing available plans, upgrading to Starter plan, and seeing plan features enabled.

**Acceptance Scenarios**:

1. **Given** a registered ground owner with free plan, **When** they visit subscription page, **Then** they see 3-4 plan options with price, features, limits (max grounds, courts, bookings)
2. **Given** a ground owner viewing plans, **When** they select a paid plan and confirm, **Then** their plan changes immediately and new limits apply
3. **Given** a subscribed ground owner, **When** their billing period ends, **Then** their plan auto-renews or downgrades to free based on payment outcome
4. **Given** a ground owner on a paid plan, **When** they cancel their subscription, **Then** plan remains active until period end then reverts to free

---

### User Story 2 — View Business Analytics (Priority: P1)

A ground owner wants to see revenue trends, booking patterns, and utilization rates so they can make informed business decisions.

**Why this priority**: Provides immediate value to ground owners and differentiates from basic listing services.

**Independent Test**: Can be tested by generating booking data, then viewing the analytics dashboard to confirm charts show correct revenue, utilization, and booking counts.

**Acceptance Scenarios**:

1. **Given** a ground owner with bookings, **When** they open analytics dashboard, **Then** they see revenue chart (daily/weekly/monthly), booking count, utilization heatmap, and customer metrics
2. **Given** an analytics dashboard, **When** user selects a date range, **Then** all charts update to show data for that period
3. **Given** a ground owner, **When** they click "Download Report", **Then** a CSV file downloads with the selected period's data

---

### User Story 3 — Send Broadcast Messages to Customers (Priority: P2)

A ground owner wants to send promotional messages or booking reminders to all customers who have booked at their ground.

**Why this priority**: Enables direct customer engagement and marketing, increasing repeat bookings.

**Independent Test**: Can be tested by creating a broadcast message, selecting audience filters, sending it, and seeing delivery status.

**Acceptance Scenarios**:

1. **Given** a ground owner, **When** they create a broadcast with message text and optional schedule, **Then** the message is queued for delivery
2. **Given** a sent broadcast, **When** customers receive it, **Then** delivery status is tracked and shown in broadcast analytics
3. **Given** a ground owner, **When** they set communication preferences, **Then** customers can opt out of specific message types

---

### User Story 4 — Set Dynamic Pricing Rules (Priority: P2)

A ground owner wants to automatically adjust court prices based on day of week, time of day, and holidays to maximize revenue during peak hours.

**Why this priority**: Increases revenue without manual price changes; competitive advantage.

**Independent Test**: Can be tested by creating a pricing rule (e.g., weekends +20%), then previewing the price for a weekend slot to confirm multiplier is applied.

**Acceptance Scenarios**:

1. **Given** a ground owner, **When** they create a pricing rule with day-of-week, time range, and multiplier, **Then** the rule is saved and applied to future price calculations
2. **Given** active pricing rules, **When** a customer views court prices for a specific date/time, **Then** the displayed price reflects all applicable rules
3. **Given** pricing rules exist, **When** multiple rules apply to the same slot, **Then** rules are resolved by priority order

---

### User Story 5 — Resolve Booking Disputes (Priority: P2)

A ground owner and customer want a fair process to resolve booking conflicts, no-show penalties, and damage claims.

**Why this priority**: Reduces support burden and builds trust through transparent dispute handling.

**Independent Test**: Can be tested by filing a dispute for a booking, adding evidence, and having an admin resolve it with a decision.

**Acceptance Scenarios**:

1. **Given** a completed booking, **When** either party files a dispute, **Then** dispute is created with reason, evidence upload, and reference to the booking
2. **Given** a filed dispute, **When** admin reviews and resolves it, **Then** both parties are notified of the decision and any applicable penalty/refund is applied
3. **Given** a no-show booking (player didn't arrive within 30min of start), **When** staff confirms no-show, **Then** penalty is applied automatically after a grace period

---

### User Story 6 — Find Grounds Near a Location (Priority: P3)

A player wants to search for grounds near their current location so they can find convenient places to play.

**Why this priority**: Core UX improvement but depends on existing ground data having coordinates.

**Independent Test**: Can be tested by searching with latitude/longitude coordinates and radius, then verifying results are within that radius.

**Acceptance Scenarios**:

1. **Given** grounds with location coordinates, **When** a user searches with lat/lng and radius, **Then** results show grounds within that radius sorted by distance
2. **Given** search results, **When** user filters by sport, **Then** only grounds offering that sport are shown

---

### Edge Cases

- What happens when a plan upgrade exceeds existing ground/court limits? (Should prompt owner to downsize or block upgrade)
- How does the system handle payment failure on renewal? (Grace period with warnings, then automatic downgrade to free)
- What happens when dynamic pricing rules overlap? (Priority-based resolution with clear documentation)
- How does the system handle disputes where neither party responds? (Auto-escalation to admin after timeout)
- What if a ground has no coordinates for nearby search? (Excluded from geo results; prompt owner to add location)

## Requirements

### Functional Requirements

#### Subscriptions
- **FR-001**: System MUST allow admins to define subscription plans (name, price, interval, limits, features)
- **FR-002**: System MUST allow ground owners to view available plans and their current plan
- **FR-003**: System MUST allow ground owners to upgrade, downgrade, or cancel their subscription
- **FR-004**: System MUST enforce plan limits (max grounds, courts, bookings per month) and block actions exceeding them
- **FR-005**: System MUST track commission rate per plan and apply it to booking revenue calculations

#### Analytics
- **FR-006**: System MUST compute and display daily/weekly/monthly revenue totals per ground
- **FR-007**: System MUST show a utilization heatmap (court x time-of-week slot occupancy)
- **FR-008**: System MUST track customer booking frequency and new vs returning customer ratio
- **FR-009**: System MUST allow downloading reports as CSV for a selected date range

#### CRM
- **FR-010**: System MUST allow ground owners to create broadcast messages with optional scheduling
- **FR-011**: System MUST track broadcast delivery status (sent, delivered, failed)
- **FR-012**: System MUST respect customer communication preferences (opt-out per type)
- **FR-013**: System MUST allow predefined message templates

#### Dynamic Pricing
- **FR-014**: System MUST allow pricing rules with day-of-week, time range, multiplier, and priority
- **FR-015**: System MUST support holiday date overrides that supersede regular rules
- **FR-016**: System MUST allow coupon codes with discount percentage, max uses, and expiry date
- **FR-017**: System MUST calculate and display effective price with all rules applied before booking

#### Disputes
- **FR-018**: System MUST allow customers and ground owners to file disputes linked to a booking
- **FR-019**: System MUST support evidence attachment (images, text description) to disputes
- **FR-020**: System MUST allow admins to review disputes and issue a resolution (refund partial/full, penalty, dismiss)
- **FR-021**: System MUST auto-detect no-shows after booking start time + grace period

#### Geolocation
- **FR-022**: System MUST allow searching grounds by latitude, longitude, and radius
- **FR-023**: System MUST allow filtering geo-search results by sport type

### Key Entities

- **SubscriptionPlan**: A tier definition (Free/Starter/Professional) with price, interval, limits, and feature flags
- **GroundOwnerSubscription**: Links a ground owner to their current plan, tracks billing period and status
- **Invoice**: A billing record for a subscription payment
- **AnalyticsSnapshot**: Pre-computed daily metrics per ground (revenue, bookings, utilization rate)
- **BroadcastMessage**: A promotional or informational message sent to ground customers
- **CommunicationLog**: Records individual delivery status per customer for a broadcast
- **PricingRule**: A time-based price multiplier rule for a ground
- **HolidayPricing**: Date-specific price override
- **Coupon**: A discount code with usage limits and expiry
- **Dispute**: A booking conflict record with evidence, status, and resolution
- **DamageClaim**: A staff-submitted damage report linked to a booking
- **NoShowPenalty**: An automated penalty applied for missed bookings

## Success Criteria

### Measurable Outcomes

- **SC-001**: Ground owners can complete plan upgrade from selection to confirmation in under 3 minutes
- **SC-002**: Analytics dashboard loads and displays all charts within 5 seconds for a ground with 6 months of data
- **SC-003**: Dynamic pricing rules are reflected in booking prices within 1 minute of creation/update
- **SC-004**: Broadcast messages reach intended recipients within 5 minutes of sending
- **SC-005**: Disputes filed online receive an admin response within 48 hours
- **SC-006**: Geolocation searches return results within 2 seconds for a 50km radius
- **SC-007**: Ground owners on paid plans see a measurable increase in booking revenue after using dynamic pricing
