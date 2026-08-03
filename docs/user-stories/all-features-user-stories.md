# All Features User Stories

This document contains comprehensive user stories for every feature in the PlayArena platform.
Each feature is numbered and organized by module.

---

## Table of Contents

1. [Auth Module (US-A01 to US-A10)](#1-auth-module-us-a01-to-US-A10)
2. [Ground Module (US-G01 to US-G19)](#2-ground-module-US-G01-to-US-G19)
3. [Booking Module (US-B01 to US-B10)](#3-booking-module-US-B01-to-US-B10)
4. [Team Module (US-T01 to US-T20)](#4-team-module-US-T01-to-US-T20)
5. [Match Module (US-M01 to US-M10)](#5-match-module-US-M01-to-US-M10)
6. [Tournament Module (US-TO01 to US-TO11)](#6-tournament-module-US-TO01-to-US-TO11)
7. [Chat Module (US-CH01 to US-CH06)](#7-chat-module-US-CH01-to-US-CH06)
8. [Notification Module (US-N01 to US-N06)](#8-notification-module-US-N01-to-US-N06)
9. [Finance Module (US-F01 to US-F12)](#9-finance-module-US-F01-to-US-F12)
10. [CRM Module (US-CRM01 to US-CRM06)](#10-crm-module-US-CRM01-to-US-CRM06)
11. [Analytics Module (US-AN01 to US-AN06)](#11-analytics-module-US-AN01-to-US-AN06)
12. [Pricing Module (US-P01 to US-P10)](#12-pricing-module-US-P01-to-US-P10)
13. [Subscription Module (US-SUB01 to US-SUB12)](#13-subscription-module-US-SUB01-to-US-SUB12)
14. [Geo Module (US-GEO01 to US-GEO03)](#14-geo-module-US-GEO01-to-US-GEO03)
15. [Dispute Module (US-D01 to US-D08)](#15-dispute-module-US-D01-to-US-D08)
16. [Rating Module (US-R01 to US-R06)](#16-rating-module-US-R01-to-US-R06)
17. [Upload Module (US-U01 to US-U05)](#17-upload-module-US-U01-to-US-U05)
18. [Admin Module (US-ADM01 to US-ADM13)](#18-admin-module-US-ADM01-to-US-ADM13)
19. [Health Module (US-H01 to US-H02)](#19-health-module-US-H01-to-US-H02)

---

## 1. Auth Module (US-A01 to US-A10)

### US-A01: Player Registration
**As a** New User (Player)
**I want** to register for a PlayArena account using my phone number
**So that** I can book courts and manage my profile

**Acceptance Criteria:**
- User provides valid phone number
- System sends OTP via SMS
- User verifies OTP
- Account is created with \pending\ status until additional profile setup
- User receives confirmation email/SMS

**API:** POST \pi/auth/register\ (with validation rules)

### US-A02: OTP Verification
**As a** Registered User
**I want** to verify my phone number using an OTP code
**So that** my account is fully activated

**Acceptance Criteria:**
- OTP is 6-digit numeric code
- OTP expires after 10 minutes
- User can request new OTP if expired
- After successful verification, account status becomes \ctive
**API:** POST \pi/auth/verify-otp
### US-A03: Resend OTP
**As a** Registered User
**I want** to request a new OTP code if the previous one expires or is not received
**So that** I can complete my verification

**Acceptance Criteria:**
- User can request resend up to 3 times within 10 minutes
- Rate limiting prevents spam
- New OTP is sent to the registered phone number

**API:** POST \pi/auth/resend-otp
### US-A04: User Login
**As a** Registered User
**I want** to log in to my account using my phone number and password
**So that** I can access my account and use PlayArena features

**Acceptance Criteria:**
- User provides phone number and password
- System validates credentials
- Invalid credentials show clear error message
- Login is rate-limited to prevent brute force

**API:** POST \pi/auth/login\ (with validation rules)

### US-A05: Refresh Access Token
**As a** Authenticated User
**I want** my session to automatically refresh when my access token expires
**So that** I don't have to log in again frequently

**Acceptance Criteria:**
- Access token expires after 1 hour
- Refresh token valid for 7 days
- User automatically gets new access token on token expiry
- User is redirected to login if refresh token also expires

**API:** POST \pi/auth/refresh
### US-A06: Logout
**As a** Logged-in User
**I want** to log out of my account
**So that** my session is securely terminated

**Acceptance Criteria:**
- Refresh token is invalidated on logout
- User cannot perform authenticated actions after logout
- User is redirected to login page

**API:** POST \pi/auth/logout
### US-A07: Get User Profile
**As a** Authenticated User
**I want** to view my profile information
**So that** I can see and manage my account details

**Acceptance Criteria:**
- Shows name, phone number, email (if provided), role, and subscription status
- Only authenticated users can access their own profile

**API:** GET \pi/auth/profile
### US-A08: Update User Profile
**As a** Authenticated User
**I want** to update my profile information (name, avatar, preferences)
**So that** my profile stays current

**Acceptance Criteria:**
- User can update name, email, and avatar
- Changes are validated before save
- Avatar upload handled via upload module

**API:** PATCH \pi/auth/profile
### US-A09: Password Management
**As a** Authenticated User
**I want** to forgot/reset/update my password
**So that** I can maintain secure access to my account

**Acceptance Criteria:**
- Forgot password sends reset link to email
- Reset link expires after 24 hours
- Can update password from profile page
- Password must meet complexity requirements

**APIs:** POST \pi/auth/forgot-password\, GET \pi/auth/reset-password/:token\, POST \pi/auth/reset-password/confirm\, POST \pi/auth/update-password
### US-A10: Google OAuth Login
**As a** User
**I want** to log in using my Google account
**So that** I can use PlayArena without creating a separate account

**Acceptance Criteria:**
- User is redirected to Google OAuth consent screen
- After authentication, user is redirected back to PlayArena
- New Google users get auto-registered accounts

**APIs:** GET \pi/auth/google\, GET \pi/auth/google/callback
---

## 2. Ground Module (US-G01 to US-G19)

### US-G01: List All Grounds
**As a** Player or Visitor
**I want** to browse all available sports grounds on the platform
**So that** I can find a place to play

**Acceptance Criteria:**
- Grounds are displayed with name, location, sport type, and rating
- Pagination is supported for large result sets
- Search and filter options available by sport, location, amenities

**API:** GET \pi/grounds/
### US-G02: List Featured Grounds
**As a** Visitor
**I want** to see featured/popular grounds on the home page
**So that** I can quickly discover trending venues

**Acceptance Criteria:**
- Shows top-rated grounds with highest booking rates
- Maximum 12 featured grounds displayed
- Sorted by popularity and rating

**API:** GET \pi/grounds/featured
### US-G03: View Ground Details
**As a** Player
**I want** to view detailed information about a specific ground
**So that** I can decide if it suits my needs

**Acceptance Criteria:**
- Shows ground name, description, address, photos, amenities, courts, schedules, and pricing
- Displays ground rating and reviews
- Shows available facilities (parking, lighting, etc.)

**API:** GET \pi/grounds/:id
### US-G04: List My Grounds
**As a** Ground Owner
**I want** to see only the grounds I own/manage
**So that** I can easily access and manage my venues

**Acceptance Criteria:**
- Only grounds owned by the authenticated user are shown
- Requires authentication

**API:** GET \pi/grounds/my
### US-G05: Create a Ground
**As a** Ground Owner
**I want** to add a new sports ground to the platform
**So that** I can start accepting bookings

**Acceptance Criteria:**
- Must provide name, address, city, region, latitude, longitude, sport type, and description
- Ground is created in \pending\ verification status
- Owner receives confirmation

**API:** POST \pi/grounds/
### US-G06: Update Ground Details
**As a** Ground Owner
**I want** to edit my ground's information
**So that** I can keep details up-to-date

**Acceptance Criteria:**
- Only the ground owner can update the ground
- Requires authentication and ownership verification
- All fields can be updated except id and createdAt

**API:** PATCH \pi/grounds/:id
### US-G07: Delete a Ground
**As a** Ground Owner
**I want** to delete a ground I no longer manage
**So that** I can remove it from the platform

**Acceptance Criteria:**
- Only the ground owner can delete the ground
- Soft delete (ground is marked as deleted)
- Associated bookings and schedules are preserved

**API:** DELETE \pi/grounds/:id
### US-G08: List Courts for a Ground
**As a** Player or Ground Owner
**I want** to see all courts available at a specific ground
**So that** I can check court availability and book

**Acceptance Criteria:**
- Shows court name, type (e.g., court 1, court 2), and surface type
- Courts are associated with their parent ground

**API:** GET \pi/grounds/:groundId/courts
### US-G09: Create a Court
**As a** Ground Owner
**I want** to add courts to my ground
**So that** different sports can be played on the ground

**Acceptance Criteria:**
- Requires ground ownership
- Must specify court name, sport type, and any special attributes

**API:** POST \pi/grounds/:groundId/courts
### US-G10: Update a Court
**As a** Ground Owner
**I want** to edit court details
**So that** I can keep court information current

**Acceptance Criteria:**
- Only the ground owner can update courts
- Requires authentication and ownership

**API:** PATCH \pi/grounds/courts/:id
### US-G11: Delete a Court
**As a** Ground Owner
**I want** to remove a court that no longer exists
**So that** my ground listing is accurate

**Acceptance Criteria:**
- Only the ground owner can delete courts
- Future bookings for this court remain but cannot be modified

**API:** DELETE \pi/grounds/courts/:id
### US-G12: List Schedules for a Ground
**As a** Ground Owner or Player
**I want** to view the operating schedule for a ground
**So that** I know when the ground is open

**Acceptance Criteria:**
- Shows schedule for each day of the week
- Displays opening and closing times
- Shows if the ground is closed on specific days

**API:** GET \pi/grounds/:groundId/schedules
### US-G13: Upsert Schedule for a Day
**As a** Ground Owner
**I want** to set or update the operating schedule for specific days
**So that** players know when my ground is available

**Acceptance Criteria:**
- Can set different schedules for different days
- Schedule includes open time, close time, and isClosed flag
- Requires ground ownership

**API:** PUT \pi/grounds/:groundId/schedules/:dayOfWeek
### US-G14: Delete Schedule Entry
**As a** Ground Owner
**I want** to remove a schedule entry for a specific day
**So that** I can indicate the ground is not available on that day

**Acceptance Criteria:**
- Only the ground owner can delete schedules
- Ground is marked as closed for that day

**API:** DELETE \pi/grounds/:groundId/schedules/:dayOfWeek
### US-G15: Update Ground Settings
**As a** Ground Owner
**I want** to update operational settings for my ground
**So that** I can configure how bookings and payments work

**Acceptance Criteria:**
- Settings include auto-approval thresholds, advance booking limits, etc.
- Requires ground ownership

**API:** PATCH \pi/grounds/:groundId/settings
### US-G16: Add Image to Ground
**As a** Ground Owner
**I want** to upload and associate images with my ground
**So that** players can see photos of the venue

**Acceptance Criteria:**
- Multiple images can be added
- Requires ground ownership
- Images are processed and stored

**API:** POST \pi/grounds/:groundId/images
### US-G17: Remove Image from Ground
**As a** Ground Owner
**I want** to remove an image from my ground listing
**So that** I can keep the gallery fresh

**Acceptance Criteria:**
- Only the ground owner can remove images
- Image is deleted from storage

**API:** DELETE \pi/grounds/:groundId/images/:imageId
### US-G18: Invite Staff Member
**As a** Ground Owner
**I want** to invite staff members to help manage my ground
**So that** I can delegate management tasks

**Acceptance Criteria:**
- Owner provides invitee's phone number or email
- Invitee receives an invitation to create/join
- Staff member can view ground details and manage bookings

**API:** POST \pi/grounds/:groundId/invites
### US-G19: List Regions
**As a** User
**I want** to see available regions for filtering grounds
**So that** I can narrow down my search by geographic area

**Acceptance Criteria:**
- Returns a list of all active regions

**API:** GET \pi/grounds/regions
---

## 3. Booking Module (US-B01 to US-B10)

### US-B01: Get Available Slots for a Court
**As a** Player
**I want** to see available time slots for a specific court on a specific date
**So that** I can choose a time when the court is free

**Acceptance Criteria:**
- Player selects court and date
- System returns available slots (not already booked)
- Shows slot duration and any restrictions

**API:** GET \pi/bookings/courts/:courtId/slots\

### US-B02: Create a Booking
**As a** Player
**I want** to create a new booking for a court
**So that** I can reserve the court for my game

**Acceptance Criteria:**
- Must provide courtId, groundId, date, startTime, endTime, playerInfo
- System validates court availability
- Booking is created in \pending\ status
- Requires authentication

**API:** POST \pi/bookings/\

### US-B03: View My Bookings
**As a** Player
**I want** to see all bookings I have made
**So that** I can track my upcoming and past reservations

**Acceptance Criteria:**
- Shows bookings grouped by upcoming and past
- Each booking shows ground name, court, date, time, and status
- Can click through to see booking details

**API:** GET \pi/bookings/my\

### US-B04: View Booking Details
**As a** Player or Ground Owner
**I want** to view detailed information about a specific booking
**So that** I can see all relevant details

**Acceptance Criteria:**
- Shows full booking details: ground, court, players, time, status, payment info
- Only the booking owner or ground owner can view

**API:** GET \pi/bookings/:id\

### US-B05: Cancel a Booking
**As a** Player
**I want** to cancel a booking I made
**So that** I can free up the court for others if I can't make it

**Acceptance Criteria:**
- Can only cancel own bookings
- Cancellation window depends on ground policy (e.g., 2 hours before)
- Refund processed according to cancellation policy
- Ground owner notified of cancellation

**API:** PATCH \pi/bookings/:id/cancel\

### US-B06: Record Payment for Booking
**As a** Ground Owner
**I want** to record a payment for a completed booking
**So that** the financial records are accurate

**Acceptance Criteria:**
- Only ground owners can record payments for their bookings
- Payment method and amount are recorded
- Booking status updated accordingly

**API:** POST \pi/bookings/:id/payment\

### US-B07: View Booking Finance Details
**As a** Ground Owner
**I want** to see financial details for a specific booking
**So that** I can track revenue

**Acceptance Criteria:**
- Shows payment method, amount, commission, and owner payout
- Only ground owner can view

**API:** GET \pi/bookings/:id/finance\

### US-B08: Update Booking Status
**As a** Ground Owner
**I want** to update the status of a booking
**So that** I can manage reservations (confirm, reject, etc.)

**Acceptance Criteria:**
- Can update status to confirmed, rejected, completed, or cancelled
- Booking owner is notified of status change

**API:** PATCH \pi/bookings/:id/status\

### US-B09: Player Views Booking from Player Perspective
**As a** Player
**I want** to view a booking I made from my perspective
**So that** I can see my booking details at a glance

**Acceptance Criteria:**
- Shows court, ground, date, time, booking code, and status
- Shows payment method used

**API:** GET \pi/bookings/:id\ (authenticated as booking owner)

### US-B10: Ground Owner Views Booking from Owner Perspective
**As a** Ground Owner
**I want** to view a booking for my ground with owner-specific info
**So that** I can manage my bookings effectively

**Acceptance Criteria:**
- Shows customer info, booking details, payment breakdown, and commission
- Can update status and record payments

**API:** GET \pi/bookings/:id\ (authenticated as ground owner)

---

## 4. Team Module (US-T01 to US-T20)

### US-T01: List Sport Categories
**As a** User
**I want** to browse available sport categories when creating a team
**So that** I can select the correct sport type

**Acceptance Criteria:**
- Returns all active sport categories
- Each category shows id, name, and icon

**API:** GET \pi/teams/sports\

### US-T02: List All Teams
**As a** User
**I want** to browse all teams on the platform
**So that** I can find a team to challenge or join

**Acceptance Criteria:**
- Shows team name, sport, skill level, and members
- Searchable by sport and team name
- Pagination supported

**API:** GET \pi/teams/\

### US-T03: List My Teams
**As a** Player
**I want** to see teams I am a member of or own
**So that** I can manage my team participations

**Acceptance Criteria:**
- Shows teams where user is owner or member
- Indicates user's role (captain, member)

**API:** GET \pi/teams/my\

### US-T04: View Team Details
**As a** Player or Team Captain
**I want** to view detailed information about a specific team
**So that** I can see members, stats, and performance

**Acceptance Criteria:**
- Shows team name, sport, description, members, and rating history
- Members listed with roles (captain, player)
- Non-members can see public info only

**API:** GET \pi/teams/:id\

### US-T05: Create a Team
**As a** Player
**I want** to create a new team for a specific sport
**So that** I can participate in matches and tournaments

**Acceptance Criteria:**
- Must provide team name, sport category, and optional description
- Creator automatically becomes team captain
- Requires authentication

**API:** POST \pi/teams/\

### US-T06: Update Team Information
**As a** Team Captain
**I want** to edit my team's name and description
**So that** I can keep team information current

**Acceptance Criteria:**
- Only team captain can update team details

**API:** PATCH \pi/teams/:id\

### US-T07: Delete a Team
**As a** Team Captain
**I want** to delete my team if it's no longer needed
**So that** I can clean up my team list

**Acceptance Criteria:**
- Only team captain can delete the team
- Team must have no active bookings or matches

**API:** DELETE \pi/teams/:id\

### US-T08: View Team Members
**As a** Player or Team Captain
**I want** to see all members of a team
**So that** I can know who is on my team

**Acceptance Criteria:**
- Shows member name, role, and join date
- Captain can update member roles and remove members

**API:** GET \pi/teams/:id/members\

### US-T09: Update Member Role
**As a** Team Captain
**I want** to change a member's role within the team
**So that** I can delegate responsibilities

**Acceptance Criteria:**
- Only captain can change roles
- Role can be changed to captain or player

**API:** PATCH \pi/teams/:id/members/:uid\

### US-T10: Remove Member from Team
**As a** Team Captain
**I want** to remove a member from my team
**So that** I can manage team composition

**Acceptance Criteria:**
- Only captain can remove members
- Member receives notification

**API:** DELETE \pi/teams/:id/members/:uid\

### US-T11: Leave Team
**As a** Player
**I want** to leave a team I am a member of
**So that** I can switch teams or stop playing

**Acceptance Criteria:**
- Can only leave as a regular member (captain must transfer captaincy first)
- Team must have at least 1 member remaining

**API:** DELETE \pi/teams/:id/members/me\

### US-T12: Transfer Captaincy
**As a** Team Captain
**I want** to transfer captaincy to another team member
**So that** someone else can manage the team when I can't

**Acceptance Criteria:**
- Only current captain can transfer captaincy
- New captain must be a current team member

**API:** PATCH \pi/teams/:id/transfer-captaincy/:uid\

### US-T13: Invite Player to Team
**As a** Team Captain
**I want** to invite a player to join my team
**So that** I can build my team roster

**Acceptance Criteria:**
- Invited player receives notification
- Player can accept or decline invitation

**API:** POST \pi/teams/:id/invite\

### US-T14: Request to Join a Team
**As a** Player
**I want** to request to join a specific team
**So that** I can play with that team

**Acceptance Criteria:**
- Team captain receives join request
- Captain can accept or reject

**API:** POST \pi/teams/:id/join-request\

### US-T15: List Join Requests
**As a** Team Captain
**I want** to see all pending join requests for my team
**So that** I can decide who to accept

**Acceptance Criteria:**
- Only captain can see join requests
- Shows requesting player's info

**API:** GET \pi/teams/:id/join-requests\

### US-T16: Accept Join Request
**As a** Team Captain
**I want** to accept a join request from a player
**So that** they can join my team

**Acceptance Criteria:**
- Player is added to team members
- Player receives notification

**API:** POST \pi/teams/:id/join-requests/:uid/accept\

### US-T17: Reject Join Request
**As a** Team Captain
**I want** to reject a join request from a player
**So that** I can control team membership

**Acceptance Criteria:**
- Player receives notification of rejection
- No changes to team membership

**API:** POST \pi/teams/:id/join-requests/:uid/reject\

### US-T18: View Team Stats
**As a** Player
**I want** to see my team's statistics
**So that** I can track performance

**Acceptance Criteria:**
- Shows win/loss record, rating, and recent matches

**API:** GET \pi/teams/:id/stats\

### US-T19: Accept Team Invitation
**As a** Player
**I want** to accept a team invitation I received
**So that** I can join the team

**Acceptance Criteria:**
- Player must be authenticated
- Invitation must be valid and not expired

**API:** POST \pi/teams/join/:id\

### US-T20: Decline Team Invitation
**As a** Player
**I want** to decline a team invitation
**So that** the team is not added to my list

**Acceptance Criteria:**
- Invitation is marked as declined

**API:** DELETE \pi/teams/join/:id\

---

## 5. Match Module (US-M01 to US-M10)

### US-M01: View Sent Challenges
**As a** Team Captain
**I want** to see the match challenges I have sent to other teams
**So that** I can track my challenge status

**Acceptance Criteria:**
- Shows teamId parameter (the team I sent challenges from)
- Lists challenges with status (pending, accepted, rejected, cancelled)

**API:** GET \pi/matches/requests/sent/:teamId\

### US-M02: View Received Challenges
**As a** Team Captain
**I want** to see the match challenges I have received from other teams
**So that** I can decide which to accept

**Acceptance Criteria:**
- Shows challenges sent to my team
- Lists with status and requesting team info

**API:** GET \pi/matches/requests/received/:teamId\

### US-M03: Send Match Challenge
**As a** Team Captain
**I want** to challenge another team to a match
**So that** we can compete against each other

**Acceptance Criteria:**
- Must specify teamId of receiving team
- Requires authentication
- Challenge is sent with pending status

**API:** POST \pi/matches/requests/:teamId\

### US-M04: Accept Challenge
**As a** Team Captain
**I want** to accept a match challenge from another team
**So that** the match is confirmed

**Acceptance Criteria:**
- Only relevant team captain can accept
- Match status changes to accepted

**API:** PATCH \pi/matches/requests/:id/accept\

### US-M05: Reject Challenge
**As a** Team Captain
**I want** to reject a match challenge
**So that** I don't have to play that match

**Acceptance Criteria:**
- Match status changes to rejected

**API:** PATCH \pi/matches/requests/:id/reject\

### US-M06: Cancel Challenge
**As a** Team Captain
**I want** to cancel a challenge I sent
**So that** the other team doesn't have to respond

**Acceptance Criteria:**
- Only the sender can cancel
- Match status changes to cancelled

**API:** PATCH \pi/matches/requests/:id/cancel\

### US-M07: List Matches for Team
**As a** Player
**I want** to see all matches for a specific team
**So that** I can view the match history and schedule

**Acceptance Criteria:**
- Shows upcoming and past matches
- Includes opponent, date/time, and status

**API:** GET \pi/matches/:teamId\

### US-M08: View Match Details
**As a** Player or Team Captain
**I want** to see detailed information about a specific match
**So that** I can prepare and track the match

**Acceptance Criteria:**
- Shows teams, ground, court, date, time, status, and score

**API:** GET \pi/matches/detail/:id\

### US-M09: Submit Match Score
**As a** Team Captain or Player
**I want** to submit the score for a completed match
**So that** the result is recorded

**Acceptance Criteria:**
- Only teams involved in the match can submit scores
- Match status changes to completed after score submission

**API:** PATCH \pi/matches/:id/score\

### US-M10: Start/End Match
**As a** Team Captain
**I want** to mark a match as started or cancelled
**So that** the match lifecycle is properly tracked

**Acceptance Criteria:**
- Start is only possible for scheduled matches
- Cancel can be done by either team captain

**APIs:** PATCH \pi/matches/:id/start\, PATCH \pi/matches/:id/cancel\

---

## 6. Tournament Module (US-TO01 to US-TO11)

### US-TO01: Create Tournament
**As a** Tournament Organizer
**I want** to create a new tournament
**So that** teams can compete in a structured competition

**Acceptance Criteria:**
- Must provide name, description, sport, start/end dates, max teams, registration deadline
- Tournament is created in \draft\ or \upcoming\ status
- Requires authentication

**API:** POST \pi/tournaments/\

### US-TO02: List All Tournaments
**As a** User
**I want** to browse all tournaments
**So that** I can find one to register for

**Acceptance Criteria:**
- Shows upcoming, ongoing, and completed tournaments
- Searchable by sport and date range

**API:** GET \pi/tournaments/\

### US-TO03: List My Tournaments
**As a** User
**I want** to see tournaments I am organizing or my team is registered in
**So that** I can manage them

**Acceptance Criteria:**
- Shows both owned and registered tournaments
- Requires authentication

**API:** GET \pi/tournaments/my\

### US-TO04: View Tournament Details
**As a** User
**I want** to see details about a specific tournament
**So that** I can understand the format and register

**Acceptance Criteria:**
- Shows tournament info, registered teams, schedule, and bracket

**API:** GET \pi/tournaments/:id\

### US-TO05: Update Tournament
**As a** Tournament Organizer
**I want** to edit tournament details
**So that** I can make changes before it starts

**Acceptance Criteria:**
- Only organizer can update
- Cannot change details once tournament has started

**API:** PATCH \pi/tournaments/:id\

### US-TO06: Delete Tournament
**As a** Tournament Organizer
**I want** to delete a tournament I created
**So that** I can remove it if no longer needed

**Acceptance Criteria:**
- Only organizer can delete
- Tournament must not have started

**API:** DELETE \pi/tournaments/:id\

### US-TO07: Register Team for Tournament
**As a** Team Captain
**I want** to register my team for a tournament
**So that** we can compete

**Acceptance Criteria:**
- Tournament must be accepting registrations
- Team must meet eligibility criteria
- Registration deadline must not have passed

**API:** POST \pi/tournaments/:id/register\

### US-TO08: Withdraw from Tournament
**As a** Tournament Organizer or Team Captain
**I want** to withdraw a team from a tournament
**So that** the team is removed from competition

**Acceptance Criteria:**
- Can only withdraw before tournament starts or before match is played
- Team is removed from bracket

**API:** POST \pi/tournaments/:id/withdraw\

### US-TO09: Tournament Bracket and Standings
**As a** User
**I want** to view the tournament bracket and standings
**So that** I can see team progression

**Acceptance Criteria:**
- Bracket shows matchups and results
- Standings show team rankings

**APIs:** GET \pi/tournaments/:id/bracket\, GET \pi/tournaments/:id/standings\

### US-TO10: Enter Match Result in Tournament
**As a** Tournament Organizer or Authorized User
**I want** to enter match results for tournament games
**So that** the bracket and standings are updated

**Acceptance Criteria:**
- Result entry updates bracket progression
- Requires tournament authorization

**API:** POST \pi/tournaments/:id/matches/:matchId/result\

### US-TO11: Generate Tournament Bracket
**As a** Tournament Organizer
**I want** to auto-generate the tournament bracket
**So that** the competition structure is set

**Acceptance Criteria:**
- Bracket generation respects seeding and constraints
- Only available before tournament starts

**API:** POST \pi/tournaments/:id/generate-bracket\

---

## 7. Chat Module (US-CH01 to US-CH06)

### US-CH01: Get Unread Message Counts
**As a** User
**I want** to see how many unread messages I have across all conversations
**So that** I can quickly see new messages

**Acceptance Criteria:**
- Shows count per conversation and total
- Updates in real-time

**API:** GET \pi/chat/unread\

### US-CH02: View Messages in a Conversation
**As a** User
**I want** to see the message history for a conversation with another user
**So that** I can see previous messages

**Acceptance Criteria:**
- Messages sorted chronologically
- Shows sender info and timestamps
- Only participants can view conversation

**API:** GET \pi/chat/:id/messages\

### US-CH03: Send a Message
**As a** User
**I want** to send a message in a conversation
**So that** I can communicate with other users

**Acceptance Criteria:**
- Real-time delivery to recipient
- Requires authentication

**API:** POST \pi/chat/:id/messages\

### US-CH04: Mark Messages as Read
**As a** User
**I want** to mark all messages in a conversation as read
**So that** my unread count is accurate

**Acceptance Criteria:**
- All messages from the other participant are marked as read
- Updates unread count

**API:** POST \pi/chat/:id/read\

### US-CH05: Real-time Chat via Socket
**As a** User
**I want** chat messages to appear in real-time without page refresh
**So that** I have a responsive messaging experience

**Acceptance Criteria:**
- Messages appear instantly using WebSocket/socket.io
- Shows online presence of contacts
- Notifications for new messages

---

## 8. Notification Module (US-N01 to US-N06)

### US-N01: View Notifications
**As a** User
**I want** to see all my notifications
**So that** I can stay informed about important events

**Acceptance Criteria:**
- Shows notifications sorted by recency
- Unread notifications are highlighted
- Pagination supported

**API:** GET \pi/notifications/\

### US-N02: View Unread Count
**As a** User
**I want** to see how many unread notifications I have
**So that** I can quickly check for new alerts

**Acceptance Criteria:**
- Shows count of unread notifications
- Updates in real-time

**API:** GET \pi/notifications/unread-count\

### US-N03: Mark All Notifications as Read
**As a** User
**I want** to mark all my notifications as read at once
**So that** my notification list is clean

**Acceptance Criteria:**
- All unread notifications are marked as read
- Unread count updates

**API:** PATCH \pi/notifications/read-all\

### US-N04: Mark Single Notification as Read
**As a** User
**I want** to mark a single notification as read
**So that** I can manage notifications individually

**Acceptance Criteria:**
- Only the notification owner can mark as read

**API:** PATCH \pi/notifications/:id/read\

### US-N05: Delete Notification
**As a** User
**I want** to delete a notification I no longer need
**So that** my notification list stays relevant

**Acceptance Criteria:**
- Only the notification owner can delete
- Notification is soft-deleted

**API:** DELETE \pi/notifications/:id\

### US-N06: Real-time Notifications
**As a** User
**I want** to receive notifications in real-time
**So that** I can immediately know about important events

**Acceptance Criteria:**
- Notifications delivered via WebSocket/socket.io
- Browser shows notification if tab is not active

---

## 9. Finance Module (US-F01 to US-F12)

### US-F01: List Payment Methods
**As a** User
**I want** to see available payment methods on the platform
**So that** I can choose how to pay

**Acceptance Criteria:**
- Shows all active payment methods (cash, card, etc.)

**API:** GET \pi/finance/payment-methods\

### US-F02: Get Ground Payment Methods
**As a** Ground Owner
**I want** to see which payment methods are enabled for my ground
**So that** players know how they can pay

**Acceptance Criteria:**
- Shows payment methods and whether each is enabled
- Requires authentication

**API:** GET \pi/finance/payment-methods/ground/:id\

### US-F03: Toggle Ground Payment Method
**As a** Ground Owner
**I want** to enable or disable specific payment methods for my ground
**So that** I control what payment options my players can use

**Acceptance Criteria:**
- Can toggle methods on/off
- Requires ground ownership

**API:** PATCH \pi/finance/grounds/:id/payment-methods/:methodId\

### US-F04: View Ground Finance Overview
**As a** Ground Owner
**I want** to see financial summary for my ground
**So that** I can track revenue and payouts

**Acceptance Criteria:**
- Shows total revenue, commission, and net payout
- Filters by date range

**API:** GET \pi/finance/grounds/:id/finance\

### US-F05: Generate Ground Finance Report
**As a** Ground Owner
**I want** to generate a detailed financial report for my ground
**So that** I can reconcile my accounts

**Acceptance Criteria:**
- Shows all bookings, payments, and commissions for the period
- Exportable as CSV

**API:** GET \pi/finance/grounds/:id/reports\

### US-F06: Open Cash Session
**As a** Ground Owner
**I want** to open a cash payment session for the day
**So that** I can record cash payments

**Acceptance Criteria:**
- Opens session with starting cash amount
- Session remains open until explicitly closed
- Requires ground ownership

**API:** POST \pi/finance/grounds/:id/cash-session/open\

### US-F07: Close Cash Session
**As a** Ground Owner
**I want** to close a cash session and record ending amounts
**So that** I can reconcile daily cash takings

**Acceptance Criteria:**
- Shows total cash collected during session
- Ending amount may differ from expected (recorded as variance)

**API:** POST \pi/finance/grounds/:id/cash-session/:sessionId/close\

### US-F08: List Cash Sessions
**As a** Ground Owner
**I want** to see all cash sessions for my ground
**So that** I can review historical cash handling

**Acceptance Criteria:**
- Shows session open/close times, starting/ending amounts, variance

**API:** GET \pi/finance/grounds/:id/cash-sessions\

### US-F09: Admin Finance Overview
**As a** Platform Admin
**I want** to see financial summary across all grounds
**So that** I can monitor platform revenue

**Acceptance Criteria:**
- Shows total platform revenue, commissions, and payouts
- Requires admin role

**API:** GET \pi/finance/admin/finance\

### US-F10: Ground Owner Views Booking Finance
**As a** Ground Owner
**I want** to see payment and finance details for a specific booking
**So that** I know what was paid and what I will earn

**Acceptance Criteria:**
- Shows payment method, amount, and owner payout

**API:** GET \pi/bookings/:id/finance\ (existing endpoint, used in different context)

### US-F11: Record Payment for Booking
**As a** Ground Owner
**I want** to record a payment made for a booking
**So that** the financial records are accurate

**Acceptance Criteria:**
- Can record payment method and amount
- Booking status updates accordingly

**API:** POST \pi/bookings/:id/payment\ (existing endpoint)

### US-F12: Financial Reporting for Admin Dashboard
**As a** Platform Admin
**I want** to generate financial reports for any time period
**So that** I can provide insights to stakeholders

**Acceptance Criteria:**
- Reports include revenue, bookings, churn, and LTV metrics
- Exportable in CSV format

**API:** GET \pi/analytics/platform/summary\ (platform analytics)

---

## 10. CRM Module (US-CRM01 to US-CRM06)

### US-CRM01: View Notification Preferences
**As a** User
**I want** to view and manage my notification preferences
**So that** I control what alerts I receive

**Acceptance Criteria:**
- Shows current preferences for email, SMS, push notifications
- Toggle on/off for different notification types

**API:** GET \pi/crm/preferences\

### US-CRM02: Update Notification Preferences
**As a** User
**I want** to update my notification preferences
**So that** I receive only the notifications I want

**Acceptance Criteria:**
- Changes are saved immediately
- Requires authentication

**API:** PATCH \pi/crm/preferences\

### US-CRM03: View Broadcasts for Ground
**As a** Player
**I want** to see announcements/broadcasts from a specific ground
**So that** I stay informed about ground updates

**Acceptance Criteria:**
- Shows active broadcasts for the ground
- Filterable by date range

**API:** GET \pi/crm/ground/:groundId\

### US-CRM04: Create Broadcast Message
**As a** Ground Owner
**I want** to create a broadcast message for my ground
**So that** I can announce updates to my players

**Acceptance Criteria:**
- Must specify title, content, and target audience
- Can schedule for future delivery

**API:** POST \pi/crm/broadcast\

### US-CRM05: View Broadcast Details
**As a** Ground Owner or Player
**I want** to see details of a specific broadcast
**So that** I can read the full announcement

**Acceptance Criteria:**
- Shows full message, creation date, and status

**API:** GET \pi/crm/broadcast/:id\

### US-CRM06: Send Broadcast to Audience
**As a** Ground Owner
**I want** to send a broadcast message to my customers
**So that** they receive important announcements

**Acceptance Criteria:**
- Sends via selected channels (email, SMS, push)
- Tracks delivery status

**API:** POST \pi/crm/broadcast/:id/send\

---

## 11. Analytics Module (US-AN01 to US-AN06)

### US-AN01: View Ground Dashboard Analytics
**As a** Ground Owner
**I want** to see analytics dashboard for my ground
**So that** I can track performance metrics

**Acceptance Criteria:**
- Shows bookings, revenue, and occupancy rates
- Requires analytics subscription plan
- Date range filter available

**API:** GET \pi/analytics/:groundId/dashboard\

### US-AN02: View Heatmap Analytics
**As a** Ground Owner
**I want** to see a heatmap showing busy/crowded times for my ground
**So that** I can optimize pricing and scheduling

**Acceptance Criteria:**
- Shows hourly/daily occupancy patterns
- Color-coded by popularity

**API:** GET \pi/analytics/:groundId/heatmap\

### US-AN03: Generate Analytics Report
**As a** Ground Owner or Admin
**I want** to generate and download analytics reports
**So that** I can share them with stakeholders

**Acceptance Criteria:**
- Report includes bookings, revenue, and customer data
- Exportable as CSV
- Requires analytics subscription

**API:** GET \pi/analytics/:groundId/report\

### US-AN04: View Platform Summary
**As a** Platform Admin
**I want** to see platform-wide metrics summary
**So that** I can monitor overall performance

**Acceptance Criteria:**
- Shows total users, grounds, bookings, and revenue
- Requires admin role

**API:** GET \pi/analytics/platform/summary\

### US-AN05: View Platform Expiring Subscriptions
**As a** Platform Admin
**I want** to see which subscriptions are expiring soon
**So that** I can send renewal reminders

**Acceptance Criteria:**
- Filterable by days until expiry
- Shows user, plan, and expiry date

**API:** GET \pi/analytics/platform/expiring\

### US-AN06: View Platform Trends
**As a** Platform Admin
**I want** to see platform usage and revenue trends over time
**So that** I can identify growth patterns

**Acceptance Criteria:**
- Shows trends by day, week, or month
- Metrics include bookings, revenue, and new users

**API:** GET \pi/analytics/platform/trends\

---

## 12. Pricing Module (US-P01 to US-P10)

### US-P01: Get Price Preview
**As a** Player
**I want** to get a price estimate for booking a court before confirming
**So that** I know the cost upfront

**Acceptance Criteria:**
- Provides base price, multiplier, discounts, and final price
- Shows pricing source (peak hours, weekday, etc.)
- Returns PricePreview object directly (no wrapper)

**API:** GET \pi/pricing/preview\

### US-P02: Validate Coupon Code
**As a** Player
**I want** to validate a coupon code before booking
**So that** I know if my discount is applied

**Acceptance Criteria:**
- Returns valid/invalid, discount amount, and final price
- Returns CouponValidation object directly

**API:** POST \pi/pricing/coupon/validate\

### US-P03: View Ground Pricing Rules
**As a** Ground Owner
**I want** to see the pricing rules I have set for my ground
**So that** I can manage pricing strategy

**Acceptance Criteria:**
- Shows time-based and day-based rules
- Requires ground ownership

**API:** GET \pi/pricing/ground/:groundId/rules\

### US-P04: Create Pricing Rule
**As a** Ground Owner
**I want** to create a new pricing rule for my ground
**So that** I can implement dynamic pricing

**Acceptance Criteria:**
- Rule can be time-based (peak/off-peak) or day-based
- Must specify price multiplier and conditions

**API:** POST \pi/pricing/rules\

### US-P05: Update Pricing Rule
**As a** Ground Owner
**I want** to edit an existing pricing rule
**So that** I can adjust pricing as needed

**Acceptance Criteria:**
- Only rule owner can update

**API:** PATCH \pi/pricing/rules/:id\

### US-P06: Delete Pricing Rule
**As a** Ground Owner
**I want** to remove a pricing rule that is no longer needed
**So that** I can keep my pricing simple

**API:** DELETE \pi/pricing/rules/:id\

### US-P07: Create Holiday Exception
**As a** Ground Owner
**I want** to set special pricing for holidays
**So that** I can charge appropriately on public holidays

**API:** POST \pi/pricing/holidays\

### US-P08: Delete Holiday Exception
**As a** Ground Owner
**I want** to remove a holiday exception
**So that** normal pricing applies again

**API:** DELETE \pi/pricing/holidays/:id\

### US-P09: View Available Coupons
**As a** Ground Owner
**I want** to see all coupons I have created for my ground
**So that** I can manage discounts

**API:** GET \pi/pricing/ground/:groundId/coupons\

### US-P10: Create Coupon
**As a** Ground Owner
**I want** to create a discount coupon for my customers
**So that** I can offer promotions

**Acceptance Criteria:**
- Must specify discount type (fixed or percentage) and amount
- Can set expiry date and usage limits

**API:** POST \pi/pricing/coupons\

---

## 13. Subscription Module (US-SUB01 to US-SUB12)

### US-SUB01: View Subscription Plans
**As a** User
**I want** to browse available subscription plans
**So that** I can choose the right one for my needs

**Acceptance Criteria:**
- Shows plan name, features, price, and billing cycle
- Highlights differences between plans

**API:** GET \pi/subscriptions/plans\

### US-SUB02: View My Subscription
**As a** User
**I want** to see my current subscription status
**So that** I know what plan I am on and when it expires

**Acceptance Criteria:**
- Shows current plan, status, and expiry date
- Requires authentication

**API:** GET \pi/subscriptions/my\

### US-SUB03: Upgrade Subscription
**As a** User
**I want** to upgrade to a higher-tier subscription plan
**So that** I get access to more features

**Acceptance Criteria:**
- Creates pending_payment status
- User gets immediate access to new plan features
- Invoice created and must be paid
- Requires admin confirmation for payment

**API:** POST \pi/subscriptions/upgrade\

### US-SUB04: Downgrade Subscription
**As a** User
**I want** to downgrade to a lower-tier subscription plan
**So that** I pay less if I don\'t use premium features

**Acceptance Criteria:**
- Downgrade is immediate
- User loses access to higher-tier features immediately
- No refund for unused portion of current billing period

**API:** POST \pi/subscriptions/downgrade\

### US-SUB05: Cancel Subscription
**As a** User
**I want** to cancel my subscription
**So that** I stop future charges

**Acceptance Criteria:**
- Subscription remains active until end of current billing period
- User gets notification of cancellation
- Can be reactivated before period ends

**API:** POST \pi/subscriptions/cancel\

### US-SUB06: View My Invoices
**As a** User
**I want** to see my billing history and invoices
**So that** I can track my payments

**Acceptance Criteria:**
- Shows invoice date, amount, status, and plan

**API:** GET \pi/subscriptions/invoices\

### US-SUB07: Confirm Payment for Subscription (Admin)
**As a** Platform Admin
**I want** to confirm a payment that was made for a subscription upgrade
**So that** the user\'s subscription is fully activated

**Acceptance Criteria:**
- Changes subscription from \pending_payment\ to \ctive\
- Requires admin role

**API:** POST \pi/subscriptions/:id/confirm-payment\

### US-SUB08: List Expiring Subscriptions (Admin)
**As a** Platform Admin
**I want** to see which subscriptions are expiring soon
**So that** I can initiate renewal outreach

**Acceptance Criteria:**
- Filterable by days until expiry
- Shows user, plan, and expiry date

**API:** GET \pi/subscriptions/expiring\

### US-SUB09: Pending Payment Banner
**As a** User
**I want** to see a banner when my subscription is in pending_payment status
**So that** I know my payment needs to be confirmed

**Acceptance Criteria:**
- Banner appears on dashboard when status is pending_payment
- Shows plan name and amount due

### US-SUB10: Retention Warning on Downgrade
**As a** User
**I want** to see a warning when I downgrade my subscription
**So that** I understand what features I will lose

**Acceptance Criteria:**
- Modal shows feature comparison before confirming
- Must confirm to proceed with downgrade

### US-SUB11: Plan Comparison Table
**As a** User
**I want** to compare subscription plans side by side
**So that** I can make an informed decision

**Acceptance Criteria:**
- Shows feature availability for each plan
- Highlights current plan
- Clear CTA for each plan

### US-SUB12: Admin Subscription Dashboard
**As a** Platform Admin
**I want** to see a dashboard of all subscriptions across the platform
**So that** I can monitor SaaS metrics

**Acceptance Criteria:**
- Shows ARR, MRR, churn rate, LTV, and customer count
- Filterable by date range and plan

**API:** GET \pi/analytics/platform/summary\ (platform analytics)

---

## 14. Geo Module (US-GEO01 to US-GEO03)

### US-GEO01: Search Nearby Grounds
**As a** Player
**I want** to find sports grounds near my current location
**So that** I can quickly book a nearby court

**Acceptance Criteria:**
- Uses browser geolocation API
- Returns grounds with distance and court info
- Pagination supported

**API:** GET \pi/geo/nearby\

### US-GEO02: View Nearby Grounds on Map
**As a** Player
**I want** to see nearby grounds displayed on an interactive map
**So that** I can visually identify the closest options

**Acceptance Criteria:**
- Uses Leaflet map component (dynamic import, SSR disabled)
- Shows markers for each ground with distance
- Clicking a marker shows ground details

**API:** GET \pi/geo/nearby\ (same endpoint, map visualization on frontend)

### US-GEO03: Clear Nearby Search
**As a** Player
**I want** to clear my nearby search and return to featured grounds
**So that** I can browse other options

**Acceptance Criteria:**
- Button clears search results and restores featured grounds

---

## 15. Dispute Module (US-D01 to US-D08)

### US-D01: View My Disputes
**As a** User
**I want** to see all disputes I have filed or been involved in
**So that** I can track their progress

**Acceptance Criteria:**
- Shows disputes the user has filed
- Lists status, date filed, and related booking

**API:** GET \pi/disputes/my\

### US-D02: View All Disputes (Admin)
**As a** Platform Admin
**I want** to see all disputes on the platform
**So that** I can moderate and resolve them

**Acceptance Criteria:**
- Filterable by status (pending, under_review, resolved, dismissed)
- Requires admin role

**API:** GET \pi/disputes/all\

### US-D03: File a Dispute
**As a** Player
**I want** to file a dispute for a booking I believe was handled incorrectly
**So that** I can resolve issues with charges or cancellations

**Acceptance Criteria:**
- Must provide related booking ID, reason, and description
- Can upload evidence (photos, receipts)
- Dispute starts in \pending\ status

**API:** POST \pi/disputes/file\

### US-D04: File Damage Claim
**As a** Ground Owner
**I want** to file a damage claim for a booking where the court was damaged
**So that** I can charge the responsible party

**Acceptance Criteria:**
- Must provide booking ID, description, and evidence
- Requires ground ownership verification

**API:** POST \pi/disputes/damage-claim\

### US-D05: View Dispute Details
**As a** User or Admin
**I want** to see full details of a specific dispute
**So that** I can understand the issue and resolution

**Acceptance Criteria:**
- Shows all evidence, status, resolution, and parties involved
- Only relevant parties can view

**API:** GET \pi/disputes/:id\

### US-D06: Resolve Dispute (Admin)
**As a** Platform Admin
**I want** to resolve a dispute with a decision
**So that** the issue is settled

**Acceptance Criteria:**
- Can resolve as: resolved, no_show_penalty, or dismissed
- Creates penalty if no_show_penalty is selected

**API:** PATCH \pi/disputes/:id/resolve\

### US-D07: New Dispute Form
**As a** User
**I want** to create a new dispute using a form
**So that** I can report issues easily

**Acceptance Criteria:**
- Form includes booking selection, reason, description, and file upload
- React anti-pattern fixed: uses useEffect instead of direct setState in effect body

**Frontend Route:** /disputes/new

### US-D08: Dispute Detail Page
**As a** User or Admin
**I want** to see dispute details with resolution options
**So that** I can review and resolve the dispute

**Acceptance Criteria:**
- Shows status badge, reason, description, filed date, booking ID
- Evidence list with file previews
- Resolution form with action buttons (for admins): resolved, no_show_penalty, dismissed
- Status badge colors: blue (pending), amber (under_review), green (resolved), gray (dismissed)

**Frontend Route:** /disputes/[id]

---

## 16. Rating Module (US-R01 to US-R06)

### US-R01: View Leaderboard
**As a** User
**I want** to see the top-rated players or teams on the platform
**So that** I can track competitive rankings

**Acceptance Criteria:**
- Shows ranked players or teams with ratings
- Can filter by sport category

**API:** GET \pi/ratings/leaderboard\, GET \pi/ratings/leaderboard/:sportId\

### US-R02: View Player Stats
**As a** User
**I want** to see detailed stats for a specific player
**So that** I can evaluate their performance

**Acceptance Criteria:**
- Shows win/loss record, rating, and match history

**API:** GET \pi/ratings/players/:id/stats\

### US-R03: Submit Match Rating
**As a** Player
**I want** to submit my rating for a completed match
**So that** the result contributes to player rankings

**Acceptance Criteria:**
- Only players in the match can submit ratings
- Rating reflects match outcome

**API:** POST \pi/ratings/matches/:id/rating\

### US-R04: Record Player Stats
**As a** Player or Captain
**I want** to record individual player stats for a match
**So that** performance data is tracked

**Acceptance Criteria:**
- Only participants or team captains can record stats

**API:** POST \pi/ratings/matches/:id/player-stats\

### US-R05: Team Rating History
**As a** User
**I want** to see how a team's rating has changed over time
**So that** I can track improvement or decline

**Acceptance Criteria:**
- Shows rating changes with dates and match results

**API:** GET \pi/teams/:id/rating-history\ (in team module)

### US-R06: Match Result Recording
**As a** Player
**I want** to submit match scores which automatically trigger rating updates
**So that** player and team ratings stay current

**Acceptance Criteria:**
- Rating is updated based on match result and opponent strength

---

## 17. Upload Module (US-U01 to US-U05)

### US-U01: Upload User Avatar
**As a** User
**I want** to upload a profile picture
**So that** I can have a recognizable avatar

**Acceptance Criteria:**
- Supports common image formats (JPG, PNG, WebP)
- Max file size 10MB
- Image is resized and optimized

**API:** POST \pi/uploads/avatar\

### US-U02: Upload Tournament Poster
**As a** Tournament Organizer
**I want** to upload a poster image for my tournament
**So that** the tournament looks professional

**Acceptance Criteria:**
- Requires ground access (organizer must own a ground)
- Image is processed and stored

**API:** POST \pi/uploads/tournament-poster\

### US-U03: Upload Ground Image
**As a** Ground Owner
**I want** to upload images of my ground and courts
**So that** players can see the venue

**Acceptance Criteria:**
- Multiple images can be uploaded
- Requires ground ownership

**API:** POST \pi/uploads/ground-image/:groundId\

### US-U04: Upload Booking Proof
**As a** Ground Owner
**I want** to upload proof of payment or delivery for a booking
**So that** financial records are complete

**Acceptance Criteria:**
- Must specify groundId for access control

**API:** POST \pi/uploads/booking-proof/:groundId\

### US-U05: Generic File Upload
**As a** User
**I want** to upload files for various purposes
**So that** I can attach documents to my records

**Acceptance Criteria:**
- File type is specified via URL param: \:type\
- Requires authentication
- Max file size 10MB

**API:** POST \pi/uploads/:type\

> **Note:** Route ordering fix applied - /:type catch-all route is placed AFTER specific routes (avatar, tournament-poster, ground-image, booking-proof) to prevent shadowing.

---

## 18. Admin Module (US-ADM01 to US-ADM13)

### US-ADM01: List All Users
**As a** Platform Admin
**I want** to see all users on the platform
**So that** I can manage accounts

**Acceptance Criteria:**
- Shows user name, email, phone, role, and registration date
- Filterable by role and search by name/email
- Requires admin role

**API:** GET \pi/admin/users\

### US-ADM02: View User Details
**As a** Platform Admin
**I want** to see detailed information about a specific user
**So that** I can investigate issues

**Acceptance Criteria:**
- Shows all user data including bookings, teams, and subscriptions

**API:** GET \pi/admin/users/:id\

### US-ADM03: List All Grounds
**As a** Platform Admin
**I want** to see all grounds on the platform
**So that** I can manage and verify venues

**Acceptance Criteria:**
- Shows ground name, owner, location, status, verification status

**API:** GET \pi/admin/grounds\

### US-ADM04: Verify Ground
**As a** Platform Admin
**I want** to verify a ground listing
**So that** it can be published and bookable

**Acceptance Criteria:**
- Changes ground status from \pending\ to \erified\
- Owner is notified of verification

**API:** PATCH \pi/admin/grounds/:id/verify\

### US-ADM05: Suspend Ground
**As a** Platform Admin
**I want** to suspend a ground that violates terms
**So that** unfair practices are stopped

**Acceptance Criteria:**
- Ground is hidden from public until unsuspended
- Owner is notified

**API:** PATCH \pi/admin/grounds/:id/suspend\

### US-ADM06: List All Teams
**As a** Platform Admin
**I want** to see all teams on the platform
**So that** I can monitor team activity

**Acceptance Criteria:**
- Shows team name, sport, member count, and creation date

**API:** GET \pi/admin/teams\

### US-ADM07: View Platform Finance (Admin)
**As a** Platform Admin
**I want** to see financial summary across all grounds
**So that** I can monitor platform health

**Acceptance Criteria:**
- Shows total revenue, commissions, and payouts
- Requires both authentication and admin role

**API:** GET \pi/admin/finance\

### US-ADM08: View Audit Logs
**As a** Platform Admin
**I want** to see all system actions logged for audit
**So that** I can investigate issues and track compliance

**Acceptance Criteria:**
- Shows user actions with timestamps
- Filterable by action type and date range

**API:** GET \pi/admin/audit-logs\

### US-ADM09: Manage Regions
**As a** Platform Admin
**I want** to manage the list of regions for ground location
**So that** grounds can be categorized by geographic area

**Acceptance Criteria:**
- Can list, create, activate, deactivate, and delete regions

**API:** GET/POST \pi/admin/regions\, GET \pi/admin/regions/:action/:id\

### US-ADM10: Manage Cities
**As a** Platform Admin
**I want** to manage the list of cities for ground location
**So that** grounds can be categorized by city

**Acceptance Criteria:**
- Can list, create, activate, deactivate, and delete cities

**API:** GET/POST \pi/admin/cities\, GET \pi/admin/cities/:action/:id\

### US-ADM11: Manage Sports
**As a** Platform Admin
**I want** to manage the list of sport categories
**So that** grounds and teams can be categorized correctly

**Acceptance Criteria:**
- Can list, create, activate, deactivate, and delete sports

**API:** GET/POST \pi/admin/sports\, GET \pi/admin/sports/:action/:id\

### US-ADM12: Manage Payment Methods
**As a** Platform Admin
**I want** to manage available payment methods on the platform
**So that** users have appropriate payment options

**Acceptance Criteria:**
- Can list, create, activate, deactivate, and delete payment methods

**API:** GET/POST \pi/admin/payment-methods\, GET \pi/admin/payment-methods/:action/:id\

### US-ADM13: Admin Dashboard Overview
**As a** Platform Admin
**I want** to see a comprehensive dashboard with all admin functions
**So that** I can manage the platform efficiently

**Acceptance Criteria:**
- Shows key metrics, quick links to all admin functions
- Shows pending verifications, disputes, and expiring subscriptions

**Frontend Route:** /admin

---

## 19. Health Module (US-H01 to US-H02)

### US-H01: Health Check
**As a** System Administrator or Monitoring Tool
**I want** to check the health of the backend API
**So that** I can verify the system is operational

**Acceptance Criteria:**
- Returns simple status indicating server is responsive

**API:** GET \pi/health\

---

## Summary

This document covers all user-facing features across the PlayArena platform:

| Module | User Story Range | No. of Stories | API Endpoints |
|--------|------------------|----------------|---------------|
| Auth | US-A01 to US-A10 | 10 | 13 |
| Ground | US-G01 to US-G19 | 19 | 21 |
| Booking | US-B01 to US-B10 | 10 | 9 |
| Team | US-T01 to US-T20 | 20 | 17 |
| Match | US-M01 to US-M10 | 10 | 8 |
| Tournament | US-TO01 to US-TO11 | 11 | 9 |
| Chat | US-CH01 to US-CH06 | 6 | 5 (+ socket) |
| Notification | US-N01 to US-N06 | 6 | 5 |
| Finance | US-F01 to US-F12 | 12 | 9 |
| CRM | US-CRM01 to US-CRM06 | 6 | 6 |
| Analytics | US-AN01 to US-AN06 | 6 | 6 |
| Pricing | US-P01 to US-P10 | 10 | 10 |
| Subscription | US-SUB01 to US-SUB12 | 12 | 7 |
| Geo | US-GEO01 to US-GEO03 | 3 | 1 |
| Dispute | US-D01 to US-D08 | 8 | 5 |
| Rating | US-R01 to US-R06 | 6 | 4 |
| Upload | US-U01 to US-U05 | 5 | 5 |
| Admin | US-ADM01 to US-ADM13 | 13 | 13 |
| Health | US-H01 to US-H02 | 2 | 1 |

**Total: 165 user stories**

---
*Document generated as part of frontend-backend integration documentation.*

## Summary

This document covers all user-facing features across the PlayArena platform:

| # | Module | User Story Range | No. of Stories | API Endpoints | Notes |
|---|--------|------------------|----------------|---------------|-------|
| 1 | Auth | US-A01 to US-A10 | 10 | 13 | Includes Google OAuth |
| 2 | Ground | US-G01 to US-G19 | 19 | 21 | Includes courts, schedules, settings |
| 3 | Booking | US-B01 to US-B10 | 10 | 9 | |
| 4 | Team | US-T01 to US-T20 | 20 | 17 | Includes invites and join requests |
| 5 | Match | US-M01 to US-M10 | 10 | 8 | Team vs team challenges |
| 6 | Tournament | US-TO01 to US-TO11 | 11 | 9 | Includes bracket generation |
| 7 | Chat | US-CH01 to US-CH06 | 6 | 5 | Socket.io real-time |
| 8 | Notification | US-N01 to US-N06 | 6 | 5 | Push and in-app |
| 9 | Finance | US-F01 to US-F12 | 12 | 9 | Cash sessions, reports |
| 10 | CRM | US-CRM01 to US-CRM06 | 6 | 6 | Broadcasts, preferences |
| 11 | Analytics | US-AN01 to US-AN06 | 6 | 6 | Dashboard, heatmap, reports |
| 12 | Pricing | US-P01 to US-P10 | 10 | 10 | Dynamic pricing, coupons |
| 13 | Subscription | US-SUB01 to US-SUB12 | 12 | 7 | SaaS lifecycle (upgrade/downgrade/cancel) |
| 14 | Geo | US-GEO01 to US-GEO03 | 3 | 1 | Nearby search + Leaflet map |
| 15 | Dispute | US-D01 to US-D08 | 8 | 5 | Admin resolution |
| 16 | Rating | US-R01 to US-R06 | 6 | 4 | Leaderboard, player stats |
| 17 | Upload | US-U01 to US-U05 | 5 | 5 | Route ordering fixed (shadowing issue) |
| 18 | Admin | US-ADM01 to US-ADM13 | 13 | 13 | User/ground/sport/region management |
| 19 | Health | US-H01 to US-H02 | 2 | 1 | API health check |

**Total: 165 user stories across 19 modules**

---

### Key Notes

- **Frontend Routes:** Many user stories map to Next.js App Router pages in packages/web/src/app/(dashboard)/
- **Role-based access:** Auth middleware and requireAdmin/requirePlan middleware protect routes
- **API prefix:** All backend routes are mounted under /api/* prefix in pp.js
- **Known gaps documented** in docs/gaps-need-to-fixed.md

*Document generated as part of frontend-backend integration documentation.*
