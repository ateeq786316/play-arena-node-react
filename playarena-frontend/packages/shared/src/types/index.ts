export type AuthProvider = "local" | "google";
export type AccessRole = "owner" | "manager" | "staff";
export type InviteStatus = "pending" | "accepted" | "rejected" | "expired";
export type BookingStatus = "pending_payment_verification" | "approved" | "rejected" | "expired" | "cancelled" | "completed";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "overpaid";
export type TeamRole = "captain" | "co_captain" | "player";
export type JoinRequestStatus = "pending" | "accepted" | "rejected";
export type MatchRequestStatus = "pending" | "accepted" | "rejected" | "cancelled" | "expired";
export type TournamentFormat = "knockout" | "round_robin" | "group_knockout";
export type TournamentStatus = "upcoming" | "registration_open" | "registration_closed" | "ongoing" | "completed" | "cancelled";
export type TournamentMatchStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type MatchStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "score_pending";
export type CashSessionStatus = "open" | "closed";

export interface User {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  authProvider: AuthProvider;
  mobile: string | null;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Region {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface City {
  id: string;
  name: string;
  regionId: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Ground {
  id: string;
  ownerId: string;
  name: string;
  address: string | null;
  cityId: string | null;
  regionId: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  contactPhone: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  courts?: Court[];
  schedules?: GroundSchedule[];
  setting?: GroundSetting;
  images?: GroundImage[];
}

export interface Court {
  id: string;
  groundId: string;
  name: string;
  sportType: string;
  basePrice: number;
  pricePerHour: number;
  depositAmount: number | null;
  maxPlayers: number;
  amenities: unknown;
  isActive: boolean;
}

export interface GroundSchedule {
  id: string;
  groundId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  slotDuration: number;
  isActive: boolean;
}

export interface GroundSetting {
  groundId: string;
  allowOnlineBooking: boolean;
  allowWalkinBooking: boolean;
  requireDeposit: boolean;
  depositPercentage: number;
  cancellationPolicy: string | null;
  advanceBookingDays: number;
  minBookingDuration: number;
  maxBookingDuration: number;
}

export interface GroundImage {
  id: string;
  groundId: string;
  url: string;
  isPrimary: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  groundId: string;
  courtId: string;
  playerId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  depositAmount: number | null;
  status: BookingStatus;
  playerName: string | null;
  playerPhone: string | null;
  createdAt: string;
  updatedAt: string;
  finance?: BookingFinance;
  payments?: BookingPayment[];
}

export interface BookingFinance {
  bookingId: string;
  totalAmount: number;
  onlineReceived: number;
  offlineReceived: number;
  paymentStatus: PaymentStatus;
}

export interface BookingPayment {
  id: string;
  bookingId: string;
  amount: number;
  channel: string;
  paymentMethod: string;
  idempotencyKey: string;
  recordedById: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  sport: string;
  cityId: string | null;
  logo: string | null;
  description: string | null;
  elo: number;
  captainId: string;
  createdAt: string;
  updatedAt: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: string;
  user?: User;
}

export interface TeamInvite {
  id: string;
  teamId: string;
  invitedById: string;
  userId: string;
  status: InviteStatus;
  createdAt: string;
}

export interface JoinRequest {
  id: string;
  teamId: string;
  userId: string;
  status: JoinRequestStatus;
  createdAt: string;
}

export interface MatchRequest {
  id: string;
  challengerTeamId: string;
  opponentTeamId: string;
  groundId: string | null;
  proposedDate: string | null;
  status: MatchRequestStatus;
  message: string | null;
  createdAt: string;
}

export interface TeamMatch {
  id: string;
  matchRequestId: string | null;
  challengerTeamId: string;
  opponentTeamId: string;
  groundId: string | null;
  scheduledDate: string | null;
  status: MatchStatus;
  scoreChallenger: number | null;
  scoreOpponent: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  sport: string;
  format: TournamentFormat;
  status: TournamentStatus;
  groundId: string | null;
  maxTeams: number;
  minTeams: number;
  registrationStarts: string | null;
  registrationEnds: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  ownerId: string;
  createdAt: string;
}

export interface TournamentTeam {
  id: string;
  tournamentId: string;
  teamId: string;
  seed: number | null;
  group: string | null;
  points: number;
  played: number;
  won: number;
  lost: number;
  drawn: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  round: number;
  matchIndex: number;
  team1Id: string | null;
  team2Id: string | null;
  winnerId: string | null;
  score1: number | null;
  score2: number | null;
  status: TournamentMatchStatus;
  scheduledDate: string | null;
  groundId: string | null;
  courtId: string | null;
  playedAt: string | null;
}

export interface CashSession {
  id: string;
  groundId: string;
  openedById: string;
  closedById: string | null;
  openedAt: string;
  closedAt: string | null;
  openingCash: number;
  closingCash: number | null;
  expectedCash: number | null;
  variance: number | null;
  status: CashSessionStatus;
  notes: string | null;
}

export interface PaymentMethod {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
}

export interface ChatMessage {
  id: string;
  groundId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: User;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string | null;
  data: unknown;
  readAt: string | null;
  createdAt: string;
}

export interface PlayerStat {
  id: string;
  userId: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  goalsScored: number;
  goalsConceded: number;
}

export interface MatchRating {
  id: string;
  matchId: string;
  reviewerId: string;
  skillRating: number;
  sportsmanshipRating: number;
  punctualityRating: number;
  reviewText: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: unknown;
  createdAt: string;
}

export interface SportCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  isActive: boolean;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// SaaS types
export type PlanInterval = "monthly" | "yearly";
export type SubscriptionStatus = "active" | "pending_payment" | "trial" | "past_due" | "suspended" | "cancelled" | "expired";
export type DisputeStatus = "pending" | "under_review" | "resolved" | "dismissed";
export type DisputeType = "booking_conflict" | "no_show" | "damage" | "other";
export type BroadcastStatus = "draft" | "scheduled" | "sending" | "sent" | "failed";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: PlanInterval;
  maxGrounds: number;
  maxCourtsPerGround: number;
  maxBookingsPerMonth: number | null;
  commissionRate: number;
  analyticsRetentionDays: number;
  features: Record<string, boolean>;
  isActive: boolean;
  sortOrder: number;
}

export interface PlanUsage {
  grounds: number;
  courts: number;
  staff: number;
  groundsLimit: number;
  courtsLimit: number;
  staffLimit: number;
}

export interface TrialInfo {
  enabled: boolean;
  endsAt: string | null;
  daysRemaining: number;
}

export interface MySubscriptionResponse {
  subscription: GroundOwnerSubscription | null;
  plan: SubscriptionPlan | null;
  usage: PlanUsage;
  trial: TrialInfo | null;
}

export interface GroundOwnerSubscription {
  id: string;
  groundOwnerId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  plan?: SubscriptionPlan;
  invoices?: Invoice[];
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
  dueDate: string;
  invoiceUrl: string | null;
  createdAt: string;
}

export interface AnalyticsSnapshot {
  id: string;
  groundId: string;
  date: string;
  totalRevenue: number;
  onlineRevenue: number;
  offlineRevenue: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  utilizationRate: number | null;
  newCustomers: number;
  returningCustomers: number;
  avgBookingValue: number | null;
}

export interface DailyAggregation {
  id: string;
  groundId: string;
  date: string;
  hour: number;
  courtId: string;
  bookings: number;
  revenue: number;
}

export interface PlatformSetting {
  key: string;
  value: string;
  updatedAt: string;
}

export interface PlatformSummary {
  subscribersPerPlan: Array<{ plan: { id: string; name: string }; count: number; statusBreakdown: Record<string, number> }>;
  mrr: number;
  statusDistribution: Record<SubscriptionStatus, number>;
  generatedAt: string;
}

export interface PlatformTrend {
  date: string;
  newSubscriptions: number;
  cancellations: number;
  mrr: number;
}

export interface ExpiringSubscription {
  id: string;
  owner: { name: string; email: string };
  plan: { name: string };
  status: SubscriptionStatus;
  currentPeriodEnd: string;
}

export interface BroadcastMessage {
  id: string;
  groundId: string;
  title: string;
  message: string;
  audience: unknown;
  status: BroadcastStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  logs?: CommunicationLog[];
}

export interface CommunicationLog {
  id: string;
  broadcastId: string;
  userId: string;
  channel: string;
  status: string;
  deliveredAt: string | null;
  openedAt: string | null;
}

export interface PricingRule {
  id: string;
  groundId: string;
  name: string;
  dayOfWeek: number | null;
  startTime: string | null;
  endTime: string | null;
  multiplier: number;
  priority: number;
  isActive: boolean;
}

export interface HolidayPricing {
  id: string;
  groundId: string;
  name: string;
  date: string;
  multiplier: number;
}

export interface Coupon {
  id: string;
  groundId: string;
  code: string;
  discountPercent: number;
  maxUses: number | null;
  usedCount: number;
  minBookingAmount: number | null;
  expiresAt: string | null;
  isActive: boolean;
}

export interface PricePreview {
  basePrice: number;
  multiplier: number;
  finalPrice: number;
  source: "base" | "rule" | "holiday";
}

export interface CouponValidation {
  valid: boolean;
  coupon: Coupon;
  discount: number;
  finalAmount: number;
}

export interface NearbyGround extends Ground {
  distance_km: string;
}

export interface NearbySearchResponse {
  grounds: NearbyGround[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  center: { latitude: number; longitude: number };
}

export interface Dispute {
  id: string;
  bookingId: string;
  filedById: string;
  type: DisputeType;
  reason: string;
  description: string | null;
  evidence: unknown;
  status: DisputeStatus;
  resolution: string | null;
  resolvedById: string | null;
  resolvedAt: string | null;
  createdAt: string;
  filedBy?: { id: string; name: string; email: string };
}

export interface DamageClaim {
  id: string;
  disputeId: string | null;
  groundId: string;
  reportedById: string;
  description: string;
  damageType: string;
  estimatedCost: number | null;
  images: unknown;
}

export interface NoShowPenalty {
  id: string;
  bookingId: string;
  amount: number;
  status: string;
  appliedAt: string | null;
}
