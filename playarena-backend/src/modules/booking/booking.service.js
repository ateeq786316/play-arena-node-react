import BookingRepo from "../../repository/booking.repo.js";
import GroundRepo from "../../repository/ground.repo.js";
import * as error from "../../shared/error/globalError.js";
import env from "../../config/env.js";
import logger from "../../config/logger.js";
import prisma from "../../database/db.js";

const ALLOWED_TRANSITIONS = {
  pending_payment_verification: ["approved", "rejected", "expired", "cancelled"],
  approved: ["cancelled", "completed"],
  rejected: [],
  expired: [],
  cancelled: [],
  completed: [],
};

export default class BookingService {
  constructor() {
    this.repo = new BookingRepo();
    this.groundRepo = new GroundRepo();
  }

  async createBooking(userId, data) {
    const { groundId, courtId, date, startTime, endTime } = data;
    if (!groundId || !courtId || !date || !startTime || !endTime) {
      throw new error.NOTFOUNDERROR("groundId, courtId, date, startTime, endTime are required");
    }

    const court = await this.groundRepo.findCourtById(courtId);
    if (!court || court.groundId !== groundId) {
      throw new error.NOTFOUNDERROR("Court not found in this ground");
    }

    const ground = await this.groundRepo.findById(groundId);
    if (!ground || !ground.isActive) {
      throw new error.NOTFOUNDERROR("Ground not found or inactive");
    }
    if (ground.setting && !ground.setting.allowOnlineBooking) {
      throw new error.UNAUTHORIZED("Online booking is disabled for this ground");
    }

    if (startTime >= endTime) {
      throw new error.NOTFOUNDERROR("startTime must be before endTime");
    }

    if (ground.setting) {
      const dur = this._diffMinutes(startTime, endTime);
      if (dur < ground.setting.minBookingDuration) {
        throw new error.NOTFOUNDERROR(`Minimum booking duration is ${ground.setting.minBookingDuration} minutes`);
      }
      if (dur > ground.setting.maxBookingDuration) {
        throw new error.NOTFOUNDERROR(`Maximum booking duration is ${ground.setting.maxBookingDuration} minutes`);
      }
    }

    const depositPct = ground.setting?.depositPercentage ?? 50;
    const totalAmount = court.pricePerHour.mul(this._hoursBetween(startTime, endTime));
    const depositAmount = ground.setting?.requireDeposit !== false
      ? totalAmount.mul(depositPct).div(100)
      : null;

    return await prisma.$transaction(async (tx) => {
      const conflict = await this.repo.findConflicting(courtId, date, startTime, endTime);
      if (conflict) {
        throw new error.ALLREADYEXIST("This time slot is already booked");
      }

      const booking = await tx.booking.create({
        data: {
          groundId,
          courtId,
          playerId: userId,
          date,
          startTime,
          endTime,
          totalAmount,
          depositAmount,
          status: "pending_payment_verification",
        },
      });

      await tx.bookingFinance.create({
        data: {
          bookingId: booking.id,
          totalAmount,
          paymentStatus: "unpaid",
        },
      });

      return await tx.booking.findUnique({
        where: { id: booking.id },
        include: { court: true, ground: true, finance: true },
      });
    });
  }

  async getMyBookings(userId) {
    return await this.repo.findByPlayerId(userId);
  }

  async getBookingById(userId, bookingId) {
    const booking = await this.repo.findById(bookingId);
    if (!booking) throw new error.NOTFOUNDERROR("Booking not found");
    if (booking.playerId !== userId) {
      const access = await this.groundRepo.findAccess(booking.groundId, userId);
      if (!access) throw new error.UNAUTHORIZED("Not authorized to view this booking");
    }
    return booking;
  }

  async cancelBooking(userId, bookingId) {
    const booking = await this.repo.findById(bookingId);
    if (!booking) throw new error.NOTFOUNDERROR("Booking not found");
    if (booking.playerId !== userId) {
      throw new error.UNAUTHORIZED("Only the booking owner can cancel");
    }

    const allowed = ALLOWED_TRANSITIONS[booking.status];
    if (!allowed || !allowed.includes("cancelled")) {
      throw new error.UNAUTHORIZED(`Cannot cancel booking in status ${booking.status}`);
    }

    return await this.repo.cancelBooking(bookingId, new Date());
  }

  async walkinBooking(groundId, userId, data) {
    const { courtId, date, startTime, endTime, playerName, playerPhone } = data;
    if (!courtId || !date || !startTime || !endTime || !playerName) {
      throw new error.NOTFOUNDERROR("courtId, date, startTime, endTime, playerName are required");
    }

    await this._checkStaffAccess(groundId, userId);

    const court = await this.groundRepo.findCourtById(courtId);
    if (!court || court.groundId !== groundId) {
      throw new error.NOTFOUNDERROR("Court not found in this ground");
    }

    if (startTime >= endTime) {
      throw new error.NOTFOUNDERROR("startTime must be before endTime");
    }

    const totalAmount = court.pricePerHour.mul(this._hoursBetween(startTime, endTime));
    const booking = await prisma.$transaction(async (tx) => {
      const conflict = await this.repo.findConflicting(courtId, date, startTime, endTime);
      if (conflict) {
        throw new error.ALLREADYEXIST("This time slot is already booked");
      }

      const created = await tx.booking.create({
        data: {
          groundId,
          courtId,
          playerId: userId,
          date,
          startTime,
          endTime,
          totalAmount,
          status: "approved",
          playerName,
          playerPhone,
        },
      });

      await tx.bookingFinance.create({
        data: {
          bookingId: created.id,
          totalAmount,
          onlineReceived: 0,
          offlineReceived: 0,
          paymentStatus: "unpaid",
        },
      });

      return created;
    });

    return booking;
  }

  async getGroundBookings(groundId, userId, filters = {}) {
    await this._checkStaffAccess(groundId, userId);
    return await this.repo.findByGroundId(groundId, filters);
  }

  async updateBookingStatus(bookingId, userId, status, reason) {
    const booking = await this.repo.findById(bookingId);
    if (!booking) throw new error.NOTFOUNDERROR("Booking not found");

    await this._checkStaffAccess(booking.groundId, userId);

    const allowed = ALLOWED_TRANSITIONS[booking.status];
    if (!allowed || !allowed.includes(status)) {
      throw new error.UNAUTHORIZED(`Cannot transition from ${booking.status} to ${status}`);
    }

    if (status === "rejected" && !reason) {
      throw new error.NOTFOUNDERROR("Rejection reason is required");
    }

    return await this.repo.updateStatus(bookingId, status);
  }

  async recordPayment(bookingId, userId, data) {
    const { amount, channel, paymentMethod, idempotencyKey } = data;
    if (!amount || !channel || !paymentMethod || !idempotencyKey) {
      throw new error.NOTFOUNDERROR("amount, channel, paymentMethod, idempotencyKey are required");
    }

    const existing = await this.repo.findPaymentByIdempotencyKey(idempotencyKey);
    if (existing) {
      return existing;
    }

    const booking = await this.repo.findById(bookingId);
    if (!booking) throw new error.NOTFOUNDERROR("Booking not found");

    await this._checkStaffAccess(booking.groundId, userId);

    return await prisma.$transaction(async (tx) => {
      const payment = await tx.bookingPayment.create({
        data: {
          bookingId,
          amount,
          channel,
          paymentMethod,
          idempotencyKey,
          recordedById: userId,
        },
      });

      const allPayments = await tx.bookingPayment.aggregate({
        where: { bookingId },
        _sum: { amount: true },
      });
      const totalPaid = allPayments._sum.amount || 0;

      const finance = await tx.bookingFinance.findUnique({ where: { bookingId } });
      const isOnline = channel === "online";

      const onlineSum = await tx.bookingPayment.aggregate({
        where: { bookingId, channel: "online" },
        _sum: { amount: true },
      });
      const offlineSum = await tx.bookingPayment.aggregate({
        where: { bookingId, channel: { not: "online" } },
        _sum: { amount: true },
      });
      const onlineTotal = onlineSum._sum.amount || 0;
      const offlineTotal = offlineSum._sum.amount || 0;
      const grandTotal = onlineTotal + offlineTotal;

      let paymentStatus;
      if (grandTotal >= finance.totalAmount) {
        paymentStatus = "paid";
      } else if (grandTotal > 0) {
        paymentStatus = "partial";
      } else {
        paymentStatus = "unpaid";
      }

      await tx.bookingFinance.update({
        where: { bookingId },
        data: {
          onlineReceived: onlineTotal,
          offlineReceived: offlineTotal,
          paymentStatus,
        },
      });

      return payment;
    });
  }

  async getBookingFinance(bookingId, userId) {
    const booking = await this.repo.findById(bookingId);
    if (!booking) throw new error.NOTFOUNDERROR("Booking not found");

    await this._checkStaffAccess(booking.groundId, userId);

    const finance = await this.repo.findFinance(bookingId);
    const payments = await this.repo.findPaymentsByBooking(bookingId);
    return { finance, payments };
  }

  async getSlots(courtId, date) {
    if (!courtId || !date) {
      throw new error.NOTFOUNDERROR("courtId and date are required");
    }

    const court = await this.groundRepo.findCourtById(courtId);
    if (!court) throw new error.NOTFOUNDERROR("Court not found");

    const dayOfWeek = new Date(date).getDay();
    const schedules = await this.groundRepo.findSchedulesByGround(court.groundId);
    const daySchedule = schedules.find((s) => s.dayOfWeek === dayOfWeek);
    if (!daySchedule || !daySchedule.isActive) {
      return { slots: [], message: "Court not available on this day" };
    }

    const slotDuration = daySchedule.slotDuration;
    const slots = this._generateSlots(daySchedule.openTime, daySchedule.closeTime, slotDuration);

    const bookings = await this.repo.findByGroundId(court.groundId, { date });
    const bookedSlots = bookings
      .filter((b) => b.courtId === courtId && ["pending_payment_verification", "approved"].includes(b.status))
      .map((b) => ({ start: b.startTime, end: b.endTime }));

    return {
      slots: slots.map((slot) => ({
        ...slot,
        available: !bookedSlots.some(
          (b) => slot.start < b.end && slot.end > b.start
        ),
      })),
      schedule: daySchedule,
    };
  }

  _checkStaffAccess(groundId, userId) {
    return this.groundRepo.findAccess(groundId, userId).then((access) => {
      if (!access || (access.accessRole !== "owner" && access.accessRole !== "manager" && access.accessRole !== "staff")) {
        throw new error.UNAUTHORIZED("Staff access required");
      }
      return access;
    });
  }

  _diffMinutes(start, end) {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  }

  _hoursBetween(start, end) {
    const mins = this._diffMinutes(start, end);
    return mins / 60;
  }

  _generateSlots(openTime, closeTime, durationMinutes) {
    const slots = [];
    const [oh, om] = openTime.split(":").map(Number);
    const [ch, cm] = closeTime.split(":").map(Number);
    let cur = oh * 60 + om;
    const end = ch * 60 + cm;

    while (cur + durationMinutes <= end) {
      const startStr = `${String(Math.floor(cur / 60)).padStart(2, "0")}:${String(cur % 60).padStart(2, "0")}`;
      cur += durationMinutes;
      const endStr = `${String(Math.floor(cur / 60)).padStart(2, "0")}:${String(cur % 60).padStart(2, "0")}`;
      slots.push({ start: startStr, end: endStr });
    }

    return slots;
  }
}
