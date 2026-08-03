import prisma from "../database/db.js";

export default class AnalyticsRepo {
  async upsertSnapshot(data) {
    return await prisma.analyticsSnapshot.upsert({
      where: { groundId_date: { groundId: data.groundId, date: data.date } },
      create: data,
      update: data,
    });
  }

  async findSnapshotsByGround(groundId, startDate, endDate) {
    return await prisma.analyticsSnapshot.findMany({
      where: { groundId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: "asc" },
    });
  }

  async upsertDailyAgg(data) {
    return await prisma.dailyAggregation.upsert({
      where: { groundId_courtId_date_hour: { groundId: data.groundId, courtId: data.courtId, date: data.date, hour: data.hour } },
      create: data,
      update: data,
    });
  }

  async findDailyAggsByGround(groundId, startDate, endDate) {
    return await prisma.dailyAggregation.findMany({
      where: { groundId, date: { gte: startDate, lte: endDate } },
      orderBy: [{ date: "asc" }, { hour: "asc" }],
    });
  }

  async getBookingStats(groundId, startDate, endDate) {
    const where = { groundId, createdAt: { gte: startDate, lte: endDate } };
    const [total, completed, cancelled] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.count({ where: { ...where, status: "completed" } }),
      prisma.booking.count({ where: { ...where, status: "cancelled" } }),
    ]);
    return { total, completed, cancelled };
  }

  async getRevenueStats(groundId, startDate, endDate) {
    const where = { groundId, createdAt: { gte: startDate, lte: endDate } };
    const dailyAggs = await this.findDailyAggsByGround(groundId, startDate, endDate);
    const totalRevenue = dailyAggs.reduce((sum, d) => sum + Number(d.revenue), 0);
    const bookings = dailyAggs.reduce((sum, d) => sum + d.bookings, 0);
    return { totalRevenue, totalBookings: bookings, avgBookingValue: bookings > 0 ? totalRevenue / bookings : 0 };
  }

  async findApprovedGrounds() {
    return await prisma.ground.findMany({
      where: { isVerified: true, isActive: true, deletedAt: null },
      select: { id: true },
    });
  }

  async findBookingsForAggregation(groundId, date) {
    return await prisma.booking.findMany({
      where: {
        groundId,
        date,
        deletedAt: null,
        status: { in: ["completed", "approved", "cancelled", "expired"] },
      },
      include: { finance: true },
    });
  }

  async findPriorPlayers(groundId, date, playerIds) {
    if (playerIds.length === 0) return [];
    return await prisma.booking.findMany({
      where: { groundId, playerId: { in: playerIds }, date: { lt: date }, deletedAt: null },
      select: { playerId: true },
      distinct: ["playerId"],
    });
  }

  async countCourtsByGround(groundId) {
    return await prisma.court.count({ where: { groundId, isActive: true, deletedAt: null } });
  }

  async findLatestSnapshotDate(groundId) {
    return await prisma.analyticsSnapshot.findFirst({
      where: { groundId },
      orderBy: { date: "desc" },
      select: { date: true },
    });
  }

  async findAllSubscriptions() {
    return await prisma.groundOwnerSubscription.findMany({
      include: { plan: true },
    });
  }

  async findNewSubscriptionsInRange(startDate, endDate) {
    return await prisma.groundOwnerSubscription.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      select: { createdAt: true, plan: { select: { price: true, interval: true } } },
    });
  }

  async findCancellationsInRange(startDate, endDate) {
    return await prisma.groundOwnerSubscription.findMany({
      where: { cancelledAt: { gte: startDate, lte: endDate } },
      select: { cancelledAt: true, plan: { select: { price: true, interval: true } } },
    });
  }
}
