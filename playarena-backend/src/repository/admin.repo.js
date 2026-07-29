import prisma from "../database/db.js";

export default class AdminRepo {
  async findUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = {};
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, mobile: true, role: true, isVerified: true, authProvider: true, createdAt: true },
      }),
      prisma.user.count({ where }),
    ]);
    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findUserById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, mobile: true, role: true, isVerified: true, authProvider: true, createdAt: true, updatedAt: true,
        _count: { select: { bookings: true, ownedTeams: true, teamMemberships: true, grounds: true } },
      },
    });
  }

  async findGrounds(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { deletedAt: null };
    const [grounds, total] = await Promise.all([
      prisma.ground.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { courts: true, bookings: true } },
        },
      }),
      prisma.ground.count({ where }),
    ]);
    return { grounds, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateGround(id, data) {
    return await prisma.ground.update({ where: { id }, data });
  }

  async findTeams(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { deletedAt: null };
    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          captain: { select: { id: true, name: true, email: true } },
          _count: { select: { members: true } },
        },
      }),
      prisma.team.count({ where }),
    ]);
    return { teams, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getPlatformFinance() {
    const [totalUsers, totalGrounds, totalTeams, bookingAgg, paymentAgg] = await Promise.all([
      prisma.user.count(),
      prisma.ground.count({ where: { deletedAt: null } }),
      prisma.team.count({ where: { deletedAt: null } }),
      prisma.booking.aggregate({ where: { deletedAt: null }, _sum: { totalAmount: true }, _count: true }),
      prisma.bookingPayment.aggregate({ _sum: { amount: true }, _count: true }),
    ]);
    return { totalUsers, totalGrounds, totalTeams, bookingAgg, paymentAgg };
  }

  async findAuditLogs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count(),
    ]);
    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createAuditLog(data) {
    return await prisma.auditLog.create({ data });
  }
}
