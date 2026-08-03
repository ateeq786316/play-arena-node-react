# Feature Specification: SaaS Subscription Analytics Dashboard

**Feature Branch**: `005-saas-subscription-analytics`  
**Created**: 2026-07-31  
**Status**: Draft  
**Input**: User description: "Reference docs/specs/003-saas-subs-analytics-crm/ and docs/vision/prd-phase4-rebuild.md to write a feature specification for the SaaS subscription analytics dashboard, including user stories, acceptance criteria, edge cases, and data requirements."

## Clarifications

### Session 2026-07-31

- Q: Subscription upgrade payment flow → A: Admin-confirmed manual payment (offline/cash/bank transfer). Upgrade creates `pending_payment` subscription + invoice; admin confirms receipt → `active`.
- Q: Platform analytics access level → A: Both Admin and Super Admin can view platform subscription analytics (read-only); plan mutations remain Super Admin only.
- Q: Data retention semantics on downgrade/expiry → A: Soft enforcement — data beyond the tier's retention window is not returned or displayed but preserved; upgrading restores access instantly (no physical purge).
- Q: Analytics data scope → A: Only approved (verified) grounds contribute data to analytics views; pending and rejected grounds are excluded.
- Q: Analytics snapshot aggregation cadence & freshness → A: Dashboard displays the last fully aggregated day with a clear "as of" timestamp; today's data appears after the daily snapshot completes (no on-demand computation for the current day).

## User Scenarios & Testing

### User Story 1 — View Subscription Status & Plan Usage (Priority: P1)

A ground owner wants to see their current subscription plan, usage against plan limits, and renewal date so they understand exactly what they're paying for and what will happen if they exceed or approach limits.

**Why this priority**: The dashboard is meaningless without subscription context — owners must first know which plan tier they're on because it determines which analytics features and data retention they receive.

**Independent Test**: Can be fully tested by creating a ground owner on the Free plan, adding one ground, and verifying the dashboard shows the Free plan, 1/1 ground usage, and the trial/renewal date. Delivers immediate subscription clarity.

**Acceptance Scenarios**:

1. **Given** a ground owner on the Free plan with one registered ground, **When** they open their subscription dashboard, **Then** they see their plan name, monthly price, renewal/expiry date, and usage bars for grounds, courts, and staff accounts
2. **Given** a ground owner with multiple grounds and a paid plan, **When** their usage reaches 100% of any plan limit, **Then** the dashboard shows a visible warning with an upgrade call-to-action
3. **Given** a ground owner whose plan is about to expire (within 7 days), **When** they open the dashboard, **Then** they see a prominent renewal reminder with the exact expiry date and renewal options
4. **Given** a ground owner on a free trial, **When** the trial has fewer than 3 days remaining, **Then** the dashboard shows a countdown and what happens after the trial ends (grounds freeze)

---

### User Story 2 — View Business Analytics (Priority: P1)

A ground owner wants to see revenue trends, booking counts, utilization rates, and customer metrics for their grounds so they can make data-driven business decisions.

**Why this priority**: This is the core value of the dashboard — it converts raw booking data into actionable business intelligence and is the primary reason owners subscribe to paid plans.

**Independent Test**: Can be tested by generating booking data for a ground, then opening the analytics view and confirming revenue totals, booking counts, utilization percentages, and customer metrics match the generated data.

**Acceptance Scenarios**:

1. **Given** a ground owner with bookings on their grounds, **When** they open the analytics view, **Then** they see revenue totals, booking counts, utilization rate, and customer metrics for the default period (last 7 days on Free, 30 days on Starter, 365 days on Professional)
2. **Given** an analytics view with data, **When** the owner views the utilization report, **Then** they see a per-court and per-day occupancy breakdown
3. **Given** a ground owner with customer booking history, **When** they view customer analytics, **Then** they see new vs returning customer split, booking frequency, and average spend
4. **Given** a ground owner with completed bookings, **When** they view booking trends, **Then** they see daily/weekly/monthly booking counts with peak hours and popular sports highlighted

---

### User Story 3 — Filter Analytics by Date Range & Export Reports (Priority: P2)

A ground owner wants to analyze business performance over a custom date range and download reports so they can share findings or review historical performance.

**Why this priority**: Filtering and export complete the analytics workflow — without them, owners can only view pre-defined periods and cannot use the data for planning or accounting.

**Independent Test**: Can be tested by selecting a custom date range and confirming all charts update to that period, then downloading the CSV and verifying the rows match the on-screen data.

**Acceptance Scenarios**:

1. **Given** an analytics view, **When** the owner selects a custom start and end date, **Then** all charts, KPIs, and tables update to reflect only bookings within that period
2. **Given** a date range is selected, **When** the owner clicks "Download Report", **Then** a CSV file downloads containing revenue, bookings, and utilization data for exactly that period
3. **Given** an owner on the Free plan (7-day retention), **When** they attempt to select a date range older than 7 days, **Then** the system shows an informational notice explaining the retention limit and suggesting an upgrade

---

### User Story 4 — Compare Plans & Upgrade from Dashboard (Priority: P2)

A ground owner wants to compare available plans and upgrade directly from the dashboard so they can unlock more analytics features and longer data retention without leaving the dashboard.

**Why this priority**: Conversion from the dashboard is the primary monetization driver — it surfaces upgrade opportunities at the moment of maximum engagement with the owner's own data.

**Independent Test**: Can be tested by viewing the plan comparison table from the dashboard, selecting a higher plan, confirming, and verifying the plan change takes effect and analytics retention extends.

**Acceptance Scenarios**:

1. **Given** a ground owner on the Free plan, **When** they click "Compare Plans" on the dashboard, **Then** they see all available plans with price, limits, analytics retention, and feature differences side by side
2. **Given** a ground owner selecting a new plan, **When** they confirm the upgrade, **Then** a subscription is created in `pending_payment` status with an invoice, and the plan activates once an admin confirms payment received
3. **Given** a ground owner on a paid plan considering downgrade, **When** they confirm the downgrade, **Then** they see a warning about losing analytics data older than the lower plan's retention period before confirming
4. **Given** a ground owner upgrading, **When** the number of grounds or courts exceeds the new plan's limits, **Then** the system blocks the upgrade and explains which limit is exceeded

---

### User Story 5 — Platform Subscription Analytics (Priority: P3)

An admin wants to see platform-wide subscription health — active subscribers by plan, monthly recurring revenue, and subscription status distribution — so they can monitor the business and identify churn risks.

**Why this priority**: Provides business visibility to the platform operator but depends on all owner-facing subscription features existing first.

**Independent Test**: Can be tested by having multiple owners on different plans and statuses, then opening the platform analytics view and confirming subscriber counts, revenue totals, and status distribution match the database state.

**Acceptance Scenarios**:

1. **Given** multiple owners subscribed to different plans, **When** an admin opens platform analytics, **Then** they see active subscriber counts per plan, monthly recurring revenue, and subscription status distribution
2. **Given** owners with upcoming expirations, **When** an admin views subscription analytics, **Then** they see a list of subscriptions expiring within 7 days and their status (active, past_due, suspended)
3. **Given** historical subscription data, **When** an admin views trends, **Then** they see new subscriptions and cancellations over the selected period

---

### Edge Cases

- What happens when an owner's subscription expires while they are viewing the dashboard? (Dashboard switches to a suspended state explaining the freeze; analytics views are locked or reduced to the free-tier retention)
- How does the system handle a downgrade when the owner has analytics data older than the new plan's retention? (Warn before confirming; historical data is not deleted but becomes inaccessible)
- What happens when an owner on the Free plan (7-day retention) tries to view older analytics? (Retention-limited notice with upgrade prompt, no error or broken charts)
- How does the dashboard behave for a ground owner with zero bookings? (All analytics views render with empty states and helpful guidance, not errors)
- What happens if analytics aggregation has not yet run for the current day? (Dashboard shows the most recent completed snapshot with a "data as of" timestamp)
- How does the system handle two owners sharing the same platform but different plans? (Each owner sees only their own grounds' analytics, scoped by subscription and ground ownership)
- What happens when a plan is deactivated (soft-deleted) while owners are subscribed? (Current subscribers keep the plan until renewal; the plan disappears from comparison tables)
- What happens if an owner's ground is approved after pending state? (Previously excluded analytics data becomes available from the approval date onward; no backfill of pre-approval data)

## Requirements

### Functional Requirements

#### Subscription Status & Usage
- **FR-001**: System MUST display the ground owner's current plan (name, price, interval) and subscription status (trial, active, past_due, suspended, expired)
- **FR-002**: System MUST show usage against plan limits (grounds, courts, staff accounts) as progress indicators with warnings at 100%
- **FR-003**: System MUST display the trial end date, renewal date, or expiry date appropriate to the owner's subscription state
- **FR-004**: System MUST notify owners of upcoming expiry (7, 3, 1 days) and trial countdown (3 days) within the dashboard
- **FR-005**: System MUST scale analytics data retention by plan tier (7 days Free, 30 days Starter, 365 days Professional)

#### Business Analytics
- **FR-006**: System MUST compute and display revenue totals (daily/weekly/monthly) per approved ground for the accessible retention period
- **FR-007**: System MUST display booking counts and booking trends with peak hours and popular sports
- **FR-008**: System MUST display utilization rate per court and per day as a heatmap-style breakdown
- **FR-009**: System MUST display customer analytics including new vs returning customers, booking frequency, and average spend
- **FR-010**: System MUST pre-compute daily analytics snapshots so dashboard queries return within acceptable response times for 12 months of data; the dashboard displays the last fully aggregated day with a clear "as of" timestamp until the current day's snapshot completes

#### Filtering & Export
- **FR-011**: System MUST allow selecting a custom date range that updates all dashboard visuals
- **FR-012**: System MUST support CSV report download for the selected date range
- **FR-013**: System MUST enforce the plan retention limit when selecting date ranges by filtering returned data to the current tier's window (soft enforcement — underlying data is preserved, not deleted) and communicate the limitation clearly
- **FR-014**: System MUST show empty states with guidance when no data exists for the selected period

#### Plan Comparison & Upgrade
- **FR-015**: System MUST display a plan comparison table accessible from the dashboard (price, limits, analytics retention, features)
- **FR-016**: System MUST allow upgrading and downgrading plans from the dashboard with confirmation
- **FR-016a**: System MUST create the new subscription in `pending_payment` status with an invoice on upgrade, and only activate the new plan after an admin confirms payment receipt
- **FR-017**: System MUST block plan changes when the owner's current usage exceeds the target plan's limits, explaining the blocking reason
- **FR-018**: System MUST warn owners about losing analytics access to data older than the lower plan's retention when downgrading

#### Platform Analytics
- **FR-019**: System MUST display platform-wide subscription metrics: active subscribers per plan, monthly recurring revenue, and status distribution
- **FR-020**: System MUST display a list of subscriptions expiring within 7 days with owner, plan, and status
- **FR-021**: System MUST display new subscription and cancellation trends over a selectable period
- **FR-022**: System MUST restrict platform analytics viewing to Admin and Super Admin roles (read-only), with plan mutations restricted to Super Admin only

### Key Entities

- **SubscriptionPlan**: A tier definition (Free/Starter/Professional) with price, interval, limits (max grounds, courts, staff), commission rate, analytics retention days, and feature flags
- **GroundOwnerSubscription**: Links an owner to their current plan; tracks status (trial, active, past_due, suspended, expired), billing period start/end, and trial metadata
- **AnalyticsSnapshot**: Pre-computed daily metrics per ground (revenue, bookings, utilization rate, customer counts) used for fast dashboard queries
- **DailyAggregation**: Rolled-up daily totals per ground enabling date-range queries without scanning raw bookings
- **Invoice**: A billing record for subscription payments, referenced from the dashboard's billing history
- **PlatformSetting**: Configuration values such as trial duration and variance thresholds (read by the dashboard for display)

## Success Criteria

### Measurable Outcomes

- **SC-001**: A ground owner can view their subscription status, plan usage, and renewal date within 3 seconds of opening the dashboard
- **SC-002**: The analytics view renders all charts and KPIs within 5 seconds for a ground with 12 months of data
- **SC-003**: 95% of ground owners can interpret their utilization rate and revenue trend on first attempt without assistance
- **SC-004**: Owners can download a CSV report for any accessible date range in under 10 seconds
- **SC-005**: 90% of owners attempting an upgrade complete it from the dashboard without contacting support
- **SC-006**: Platform analytics shows correct subscriber counts, revenue, and status distribution matching the live data state
- **SC-007**: Plan retention limits are enforced correctly for 100% of date-range selections with no data leakage across plans
