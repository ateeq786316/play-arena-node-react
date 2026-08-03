import AnalyticsRepo from "../../repository/analytics.repo.js";
import GroundRepo from "../../repository/ground.repo.js";
import SubscriptionRepo from "../../repository/subscription.repo.js";
import logger from "../../config/logger.js";
import * as error from "../../shared/error/globalError.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const OPEN_HOURS_PER_DAY = 12;

export default class AnalyticsService {
  constructor() {
    this.repo = new AnalyticsRepo();
    this.groundRepo = new GroundRepo();
    this.subscriptionRepo = new SubscriptionRepo();
  }

  async _checkOwnerAccess(groundId, userId) {
    const ground = await this.groundRepo.findById(groundId);
    if (!ground) throw new error.NOTFOUNDERROR("Ground not found");
    if (!ground.isVerified) throw new error.UNAUTHORIZED("Analytics unavailable for unverified grounds");
    if (ground.ownerId !== userId) {
      const access = await this.groundRepo.findAccess(groundId, userId);
      if (!access) throw new error.UNAUTHORIZED("Not authorized");
    }
    return ground;
  }

  async _getRetentionDays(ownerId) {
    const subscription = await this.subscriptionRepo.findSubscriptionByOwner(ownerId);
    return subscription?.plan?.analyticsRetentionDays ?? 7;
  }

  _utcMidnight(date) {
    const d = new Date(date);
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  }

  _clampWindow(startDate, endDate, retentionDays) {
    const end = this._utcMidnight(endDate);
    const retentionStart = new Date(end.getTime() - (retentionDays - 1) * DAY_MS);
    const clamped = startDate < retentionStart;
    const effectiveStart = clamped ? retentionStart : startDate;
    return {
      startDate: effectiveStart,
      clamped,
      retentionNotice: clamped
        ? `Data older than ${retentionDays} days is outside your plan's retention window. Upgrade to access more history.`
        : null,
    };
  }

  async aggregateDay(date) {
    const target = this._utcMidnight(new Date(date));
    const grounds = await this.repo.findApprovedGrounds();
    const results = [];
    for (const ground of grounds) {
      try {
        results.push(await this._aggregateGround(ground.id, target));
      } catch (err) {
        logger.error({ groundId: ground.id, error: err.message }, "Failed to aggregate ground");
      }
    }
    return results;
  }

  async _aggregateGround(groundId, date) {
    const bookings = await this.repo.findBookingsForAggregation(groundId, date);
    const playerIds = [...new Set(bookings.map((b) => b.playerId))];
    const priorPlayers = await this.repo.findPriorPlayers(groundId, date, playerIds);
    const priorSet = new Set(priorPlayers.map((p) => p.playerId));
    const courtsCount = await this.repo.countCourtsByGround(groundId);

    const byCourtHour = new Map();
    let totalRevenue = 0;
    let onlineRevenue = 0;
    let offlineRevenue = 0;
    let completedBookings = 0;
    let cancelledBookings = 0;
    let newCustomers = 0;
    let returningCustomers = 0;
    let bookedSlots = 0;

    for (const booking of bookings) {
      const online = Number(booking.finance?.onlineReceived ?? 0);
      const offline = Number(booking.finance?.offlineReceived ?? 0);
      const hasFinance = booking.finance;
      const bookingRevenue = hasFinance ? online + offline : Number(booking.totalAmount);
      totalRevenue += bookingRevenue;
      onlineRevenue += online;
      offlineRevenue += offline;

      if (booking.status === "completed") completedBookings += 1;
      if (booking.status === "cancelled") cancelledBookings += 1;

      const startHour = this._hourOf(booking.startTime);
      const endHour = this._hourOf(booking.endTime);
      for (let h = startHour; h < endHour; h += 1) {
        bookedSlots += 1;
        const key = `${booking.courtId}|${h}`;
        const row = byCourtHour.get(key) || { courtId: booking.courtId, hour: h, bookings: 0, revenue: 0 };
        row.bookings += 1;
        row.revenue += bookingRevenue;
        byCourtHour.set(key, row);
      }
    }

    const totalBookings = bookings.length;
    for (const playerId of playerIds) {
      if (priorSet.has(playerId)) returningCustomers += 1;
      else newCustomers += 1;
    }
    const utilizationRate = courtsCount > 0 && bookedSlots > 0
      ? Math.min(1, bookedSlots / (courtsCount * OPEN_HOURS_PER_DAY))
      : null;
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : null;

    const snapshot = {
      groundId,
      date,
      totalRevenue,
      onlineRevenue,
      offlineRevenue,
      totalBookings,
      completedBookings,
      cancelledBookings,
      utilizationRate,
      newCustomers,
      returningCustomers,
      avgBookingValue,
    };
    await this.repo.upsertSnapshot(snapshot);

    const dailyAggs = [];
    for (const row of byCourtHour.values()) {
      const agg = { groundId, courtId: row.courtId, date, hour: row.hour, bookings: row.bookings, revenue: row.revenue };
      await this.repo.upsertDailyAgg(agg);
      dailyAggs.push(agg);
    }

    return { groundId, snapshot, dailyAggs };
  }

  _hourOf(time) {
    const hour = parseInt(time.split(":")[0], 10);
    return Number.isNaN(hour) ? 0 : hour;
  }

  async getDashboard(groundId, userId, filters = {}) {
    const ground = await this._checkOwnerAccess(groundId, userId);
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
    let startDate = filters.startDate ? new Date(filters.startDate) : new Date(endDate.getTime() - 30 * DAY_MS);
    const retentionDays = await this._getRetentionDays(ground.ownerId);
    const clamped = this._clampWindow(startDate, endDate, retentionDays);
    startDate = clamped.startDate;

    const [snapshots, revenue, bookingStats] = await Promise.all([
      this.repo.findSnapshotsByGround(groundId, startDate, endDate),
      this.repo.getRevenueStats(groundId, startDate, endDate),
      this.repo.getBookingStats(groundId, startDate, endDate),
    ]);
    const latest = await this.repo.findLatestSnapshotDate(groundId);

    return {
      snapshots,
      revenue,
      bookings: bookingStats,
      period: { startDate, endDate },
      dataAsOf: latest ? this._formatDate(latest.date) : null,
      retentionDays,
      retentionNotice: clamped.retentionNotice,
    };
  }

  async getHeatmap(groundId, userId, startDate, endDate) {
    const ground = await this._checkOwnerAccess(groundId, userId);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const retentionDays = await this._getRetentionDays(ground.ownerId);
    const clamped = this._clampWindow(start, end, retentionDays);

    const data = await this.repo.findDailyAggsByGround(groundId, clamped.startDate, end);
    const latest = await this.repo.findLatestSnapshotDate(groundId);

    return {
      heatmap: data,
      dataAsOf: latest ? this._formatDate(latest.date) : null,
      retentionDays,
      retentionNotice: clamped.retentionNotice,
    };
  }

  async generateReport(groundId, userId, startDate, endDate) {
    const ground = await this._checkOwnerAccess(groundId, userId);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const retentionDays = await this._getRetentionDays(ground.ownerId);
    const clamped = this._clampWindow(start, end, retentionDays);

    const [snapshots, revenue, heatmap] = await Promise.all([
      this.repo.findSnapshotsByGround(groundId, clamped.startDate, end),
      this.repo.getRevenueStats(groundId, clamped.startDate, end),
      this.repo.findDailyAggsByGround(groundId, clamped.startDate, end),
    ]);
    const latest = await this.repo.findLatestSnapshotDate(groundId);

    return {
      snapshots,
      revenue,
      heatmap,
      generatedAt: new Date(),
      dataAsOf: latest ? this._formatDate(latest.date) : null,
      retentionDays,
      retentionNotice: clamped.retentionNotice,
    };
  }

  _formatDate(date) {
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  }

  _monthlyEquivalent(plan) {
    const price = Number(plan.price);
    return plan.interval === "yearly" ? price / 12 : price;
  }

  async getPlatformSummary() {
    const subscriptions = await this.repo.findAllSubscriptions();
    const planMap = new Map();
    const statusDistribution = {};

    for (const sub of subscriptions) {
      const planId = sub.plan?.id ?? sub.planId;
      if (!planMap.has(planId)) {
        planMap.set(planId, {
          plan: { id: planId, name: sub.plan?.name ?? "Unknown" },
          count: 0,
          statusBreakdown: {},
        });
      }
      const entry = planMap.get(planId);
      entry.count += 1;
      entry.statusBreakdown[sub.status] = (entry.statusBreakdown[sub.status] || 0) + 1;
      statusDistribution[sub.status] = (statusDistribution[sub.status] || 0) + 1;
    }

    const mrr = subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + this._monthlyEquivalent(s.plan), 0);

    return {
      subscribersPerPlan: [...planMap.values()],
      mrr,
      statusDistribution,
      generatedAt: new Date().toISOString(),
    };
  }

  async getPlatformExpiring(days = 7) {
    return await this.subscriptionRepo.findSubscriptionsExpiringWithin(days);
  }

  async getPlatformTrends(startDate, endDate) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 29 * DAY_MS);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const [created, cancelled] = await Promise.all([
      this.repo.findNewSubscriptionsInRange(start, end),
      this.repo.findCancellationsInRange(start, end),
    ]);

    const byDate = new Map();
    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + DAY_MS)) {
      byDate.set(this._formatDate(d), { date: this._formatDate(d), newSubscriptions: 0, cancellations: 0, mrr: 0 });
    }

    let runningMrr = 0;
    for (const sub of created) {
      const key = this._formatDate(sub.createdAt);
      const row = byDate.get(key);
      if (row) {
        row.newSubscriptions += 1;
        row.mrr += this._monthlyEquivalent(sub.plan);
      }
    }
    for (const sub of cancelled) {
      const key = this._formatDate(sub.cancelledAt);
      const row = byDate.get(key);
      if (row) {
        row.cancellations += 1;
        row.mrr -= this._monthlyEquivalent(sub.plan);
      }
    }

    const trends = [...byDate.values()].map((row) => {
      runningMrr += row.mrr;
      return { ...row, mrr: runningMrr };
    });

    return { trends };
  }
}
