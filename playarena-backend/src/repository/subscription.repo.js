import prisma from "../database/db.js";

export default class SubscriptionRepo {
  async findAllPlans(activeOnly = true) {
    const where = activeOnly ? { isActive: true } : {};
    return await prisma.subscriptionPlan.findMany({ where, orderBy: { sortOrder: "asc" } });
  }

  async findPlanById(id) {
    return await prisma.subscriptionPlan.findUnique({ where: { id } });
  }

  async findSubscriptionByOwner(groundOwnerId) {
    return await prisma.groundOwnerSubscription.findUnique({
      where: { groundOwnerId },
      include: { plan: true, invoices: { orderBy: { createdAt: "desc" }, take: 12 } },
    });
  }

  async createSubscription(data) {
    return await prisma.groundOwnerSubscription.create({ data, include: { plan: true } });
  }

  async updateSubscription(id, data) {
    return await prisma.groundOwnerSubscription.update({ where: { id }, data, include: { plan: true } });
  }

  async createInvoice(data) {
    return await prisma.invoice.create({ data });
  }

  async findInvoicesBySubscription(subscriptionId) {
    return await prisma.invoice.findMany({ where: { subscriptionId }, orderBy: { createdAt: "desc" } });
  }

  async findPendingPaymentById(id) {
    return await prisma.groundOwnerSubscription.findUnique({
      where: { id },
      include: { plan: true },
    });
  }

  async findUnpaidInvoiceBySubscription(subscriptionId) {
    return await prisma.invoice.findFirst({
      where: { subscriptionId, status: "unpaid" },
      orderBy: { createdAt: "desc" },
    });
  }

  async markInvoicePaid(id, paidAt) {
    return await prisma.invoice.update({
      where: { id },
      data: { status: "paid", paidAt },
    });
  }

  async findSubscriptionsExpiringWithin(days) {
    const now = new Date();
    const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return await prisma.groundOwnerSubscription.findMany({
      where: { currentPeriodEnd: { gte: now, lte: end } },
      include: {
        groundOwner: { select: { id: true, name: true, email: true } },
        plan: { select: { id: true, name: true } },
      },
      orderBy: { currentPeriodEnd: "asc" },
    });
  }

  async countBookingsThisMonth(ownerId) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return await prisma.booking.count({
      where: {
        ground: { ownerId },
        createdAt: { gte: startOfMonth },
      },
    });
  }

  async countApprovedGrounds(ownerId) {
    return await prisma.ground.count({ where: { ownerId, isVerified: true } });
  }

  async countCourts(ownerId) {
    return await prisma.court.count({ where: { ground: { ownerId, isVerified: true } } });
  }

  async countStaff(ownerId) {
    return await prisma.groundAccess.count({
      where: { ground: { ownerId, isVerified: true }, accessRole: "staff", isActive: true },
    });
  }

  async findPlatformSettings() {
    return await prisma.platformSetting.findMany();
  }
}
