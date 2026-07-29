import prisma from "../database/db.js";

export default class BookingRepo {
  async create(data) {
    return await prisma.booking.create({
      data: {
        groundId: data.groundId,
        courtId: data.courtId,
        playerId: data.playerId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        totalAmount: data.totalAmount,
        depositAmount: data.depositAmount,
        status: data.status || "pending_payment_verification",
        playerName: data.playerName,
        playerPhone: data.playerPhone,
      },
      include: { finance: true, court: true, ground: true },
    });
  }

  async findById(id) {
    return await prisma.booking.findUnique({
      where: { id, deletedAt: null },
      include: {
        court: true,
        ground: { include: { setting: true } },
        finance: true,
        payments: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  async findByPlayerId(playerId, filters = {}) {
    const where = { playerId, deletedAt: null, ...filters };
    return await prisma.booking.findMany({
      where,
      include: {
        court: true,
        ground: { select: { id: true, name: true } },
        finance: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByGroundId(groundId, filters = {}) {
    const where = { groundId, deletedAt: null, ...filters };
    return await prisma.booking.findMany({
      where,
      include: {
        court: true,
        player: { select: { id: true, name: true, email: true, mobile: true } },
        finance: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findConflicting(courtId, date, startTime, endTime, excludeId) {
    const where = {
      courtId,
      date,
      deletedAt: null,
      status: { in: ["pending_payment_verification", "approved"] },
      OR: [
        { startTime: { lt: endTime }, endTime: { gt: startTime } },
      ],
    };
    if (excludeId) where.id = { not: excludeId };
    return await prisma.booking.findFirst({ where, select: { id: true } });
  }

  async updateStatus(id, status) {
    return await prisma.booking.update({
      where: { id },
      data: {
        status,
        ...(status === "cancelled" ? { cancelledAt: new Date() } : {}),
      },
      include: { finance: true },
    });
  }

  async cancelBooking(id, cancelledAt) {
    return await prisma.booking.update({
      where: { id },
      data: { status: "cancelled", cancelledAt },
    });
  }

  async softDelete(id) {
    return await prisma.booking.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async upsertFinance(bookingId, data) {
    return await prisma.bookingFinance.upsert({
      where: { bookingId },
      create: { bookingId, ...data },
      update: data,
    });
  }

  async findFinance(bookingId) {
    return await prisma.bookingFinance.findUnique({
      where: { bookingId },
    });
  }

  async createPayment(data) {
    return await prisma.bookingPayment.create({ data });
  }

  async findPaymentByIdempotencyKey(key) {
    return await prisma.bookingPayment.findUnique({
      where: { idempotencyKey: key },
    });
  }

  async findPaymentsByBooking(bookingId) {
    return await prisma.bookingPayment.findMany({
      where: { bookingId },
      orderBy: { createdAt: "desc" },
      include: { recorder: { select: { id: true, name: true } } },
    });
  }
}
