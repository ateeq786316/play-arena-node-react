import prisma from "../database/db.js";

export default class DisputeRepo {
  async create(data) {
    return await prisma.dispute.create({ data });
  }

  async findById(id) {
    return await prisma.dispute.findUnique({ where: { id }, include: { filedBy: { select: { id: true, name: true, email: true } } } });
  }

  async findByBooking(bookingId) {
    return await prisma.dispute.findFirst({ where: { bookingId } });
  }

  async findByUser(userId) {
    return await prisma.dispute.findMany({
      where: { filedById: userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAll(filters = {}) {
    const where = { ...filters };
    return await prisma.dispute.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { filedBy: { select: { id: true, name: true, email: true } } },
    });
  }

  async resolve(id, resolution, resolvedById) {
    return await prisma.dispute.update({
      where: { id },
      data: { status: "resolved", resolution, resolvedById, resolvedAt: new Date() },
    });
  }

  async createDamageClaim(data) {
    return await prisma.damageClaim.create({ data });
  }

  async findDamageClaimByDispute(disputeId) {
    return await prisma.damageClaim.findUnique({ where: { disputeId } });
  }

  async createNoShowPenalty(data) {
    return await prisma.noShowPenalty.create({ data });
  }

  async findNoShowPenaltyByBooking(bookingId) {
    return await prisma.noShowPenalty.findUnique({ where: { bookingId } });
  }

  async updateNoShowPenalty(id, data) {
    return await prisma.noShowPenalty.update({ where: { id }, data });
  }
}
