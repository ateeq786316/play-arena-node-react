import prisma from "../database/db.js";

export default class FinanceRepo {
  async findPaymentMethods(filters = {}) {
    return await prisma.paymentMethod.findMany({
      where: filters,
      orderBy: { displayOrder: "asc" },
    });
  }

  async findPaymentMethodById(id) {
    return await prisma.paymentMethod.findUnique({ where: { id } });
  }

  async findGroundPaymentMethods(groundId) {
    return await prisma.groundPaymentMethod.findMany({
      where: { groundId },
      include: { paymentMethod: true },
    });
  }

  async findGroundPaymentMethod(groundId, methodId) {
    return await prisma.groundPaymentMethod.findUnique({
      where: { groundId_paymentMethodId: { groundId, paymentMethodId: methodId } },
    });
  }

  async upsertGroundPaymentMethod(groundId, methodId, data) {
    return await prisma.groundPaymentMethod.upsert({
      where: { groundId_paymentMethodId: { groundId, paymentMethodId: methodId } },
      update: data,
      create: { groundId, paymentMethodId: methodId, ...data },
    });
  }

  async createCashSession(data) {
    return await prisma.cashSession.create({ data });
  }

  async findOpenCashSession(groundId) {
    return await prisma.cashSession.findFirst({
      where: { groundId, status: "open" },
    });
  }

  async findCashSessionById(id) {
    return await prisma.cashSession.findUnique({ where: { id } });
  }

  async updateCashSession(id, data) {
    return await prisma.cashSession.update({ where: { id }, data });
  }

  async findCashSessionsByGround(groundId) {
    return await prisma.cashSession.findMany({
      where: { groundId },
      include: {
        openedBy: { select: { id: true, name: true } },
        closedBy: { select: { id: true, name: true } },
      },
      orderBy: { openedAt: "desc" },
    });
  }

  async getGroundFinanceSummary(groundId) {
    const [bookingAgg, paymentAgg] = await Promise.all([
      prisma.booking.aggregate({
        where: { groundId, deletedAt: null },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.bookingPayment.aggregate({
        where: { booking: { groundId } },
        _sum: { amount: true },
        _count: true,
      }),
    ]);
    return { bookingAgg, paymentAgg };
  }

  async getGroundFinanceReport(groundId, startDate, endDate) {
    const where = { groundId, deletedAt: null };
    if (startDate) where.date = { ...where.date, gte: new Date(startDate) };
    if (endDate) where.date = { ...where.date, lte: new Date(endDate) };

    return await prisma.booking.findMany({
      where,
      include: {
        finance: true,
        payments: true,
      },
      orderBy: { date: "desc" },
    });
  }

  async getAdminFinanceSummary() {
    const [totalBookings, totalPayments, totalGrounds] = await Promise.all([
      prisma.booking.aggregate({
        where: { deletedAt: null },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.bookingPayment.aggregate({
        _sum: { amount: true },
        _count: true,
      }),
      prisma.ground.count({ where: { deletedAt: null } }),
    ]);
    return { totalBookings, totalPayments, totalGrounds };
  }

  async findGroundById(id) {
    return await prisma.ground.findUnique({ where: { id, deletedAt: null } });
  }

  async findGroundAccess(groundId, userId) {
    return await prisma.groundAccess.findUnique({
      where: { groundId_userId: { groundId, userId } },
    });
  }
}
