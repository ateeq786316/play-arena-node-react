import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import express from "express";

import prisma from "../src/database/db.js";

class MockDecimal {
  constructor(value) { this.value = value; }
  mul(n) { return new MockDecimal(this.value * n); }
  div(n) { return new MockDecimal(this.value / n); }
  toString() { return String(this.value); }
  toNumber() { return this.value; }
  valueOf() { return this.value; }
}
function D(v) { return new MockDecimal(v); }
import env from "../src/config/env.js";

function createTestUserId() {
  return "00000000-0000-4000-8000-000000000001";
}

function createStaffUserId() {
  return "00000000-0000-4000-8000-000000000002";
}

function createGroundId() {
  return "00000000-0000-4000-8000-000000000010";
}

function createCourtId() {
  return "00000000-0000-4000-8000-000000000020";
}

function createBookingId() {
  return "00000000-0000-4000-8000-000000000030";
}

function signToken(userId) {
  return jwt.sign({ id: userId }, env.ACCESSTOKEN, { expiresIn: "15m" });
}

function createAuthedApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  app.use((req, res, next) => {
    const token = req.cookies?.accessToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, env.ACCESSTOKEN);
        req.userId = decoded.id;
      } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
    }
    next();
  });

  return app;
}

function mockGroundExists(overrides = {}) {
  prisma.ground.findUnique.mockResolvedValue({
    id: createGroundId(),
    ownerId: createStaffUserId(),
    name: "Test Ground",
    isActive: true,
    isVerified: true,
    deletedAt: null,
    setting: {
      allowOnlineBooking: true,
      allowWalkinBooking: true,
      requireDeposit: true,
      depositPercentage: 50,
      minBookingDuration: 60,
      maxBookingDuration: 180,
      advanceBookingDays: 14,
    },
    ...overrides,
  });
}

function mockCourtExists(overrides = {}) {
  prisma.court.findUnique.mockResolvedValue({
    id: createCourtId(),
    groundId: createGroundId(),
    name: "Test Court",
    sportType: "cricket",
    basePrice: D(5000),
    pricePerHour: D(2000),
    depositAmount: null,
    maxPlayers: 22,
    isActive: true,
    deletedAt: null,
    ...overrides,
  });
}

function mockStaffAccess() {
  prisma.groundAccess.findUnique.mockResolvedValue({
    groundId: createGroundId(),
    userId: createStaffUserId(),
    accessRole: "manager",
    isActive: true,
  });
}

function mockNoConflict() {
  prisma.booking.findFirst.mockResolvedValue(null);
}

function mockConflict() {
  prisma.booking.findFirst.mockResolvedValue({ id: "conflict-booking-id" });
}

function clearMocks() {
  vi.clearAllMocks();
}

function registerRoutes(app) {
  import("../src/modules/booking/booking.route.js").then(({ default: bookingRoutes }) => {
    app.use("/api/bookings", bookingRoutes);
  });
}

describe("Booking Service - Unit Tests", () => {
  let BookingService;

  beforeAll(async () => {
    const mod = await import("../src/modules/booking/booking.service.js");
    BookingService = mod.default;
  });

  beforeEach(() => {
    clearMocks();
  });

  describe("createBooking", () => {
    it("should throw if required fields missing", async () => {
      const service = new BookingService();
      await expect(service.createBooking(createTestUserId(), {})).rejects.toThrow();
    });

    it("should throw if court not found", async () => {
      prisma.court.findUnique.mockResolvedValue(null);
      const service = new BookingService();
      await expect(
        service.createBooking(createTestUserId(), {
          groundId: createGroundId(),
          courtId: createCourtId(),
          date: "2026-08-01",
          startTime: "10:00",
          endTime: "12:00",
        })
      ).rejects.toThrow("Court not found");
    });

    it("should throw if court belongs to different ground", async () => {
      prisma.court.findUnique.mockResolvedValue({
        id: createCourtId(),
        groundId: "different-ground-id",
      });
      mockGroundExists();
      const service = new BookingService();
      await expect(
        service.createBooking(createTestUserId(), {
          groundId: createGroundId(),
          courtId: createCourtId(),
          date: "2026-08-01",
          startTime: "10:00",
          endTime: "12:00",
        })
      ).rejects.toThrow("Court not found");
    });

    it("should create booking with finance record when valid", async () => {
      mockGroundExists();
      mockCourtExists();
      mockNoConflict();

      prisma.$transaction = vi.fn(async (fn) => {
        const tx = {
          booking: {
            create: vi.fn().mockResolvedValue({
              id: createBookingId(),
              groundId: createGroundId(),
              courtId: createCourtId(),
              playerId: createTestUserId(),
              date: new Date("2026-08-01"),
              startTime: "10:00",
              endTime: "12:00",
              totalAmount: D(4000),
              depositAmount: D(2000),
              status: "pending_payment_verification",
            }),
            findUnique: vi.fn().mockResolvedValue({
              id: createBookingId(),
              groundId: createGroundId(),
              courtId: createCourtId(),
              status: "pending_payment_verification",
              totalAmount: D(4000),
              depositAmount: D(2000),
              court: { id: createCourtId(), name: "Test Court" },
              ground: { id: createGroundId(), name: "Test Ground" },
              finance: {
                bookingId: createBookingId(),
                totalAmount: D(4000),
                paymentStatus: "unpaid",
              },
            }),
          },
          bookingFinance: { create: vi.fn() },
        };
        return fn(tx);
      });

      const service = new BookingService();
      const booking = await service.createBooking(createTestUserId(), {
        groundId: createGroundId(),
        courtId: createCourtId(),
        date: "2026-08-01",
        startTime: "10:00",
        endTime: "12:00",
      });

      expect(booking.status).toBe("pending_payment_verification");
      expect(Number(booking.totalAmount)).toBe(4000);
      expect(Number(booking.depositAmount)).toBe(2000);
      expect(booking.finance.paymentStatus).toBe("unpaid");
    });
  });

  describe("walkinBooking", () => {
    it("should create approved walk-in booking", async () => {
      mockStaffAccess();
      mockCourtExists();
      mockNoConflict();

      prisma.$transaction = vi.fn(async (fn) => {
        const tx = {
          booking: {
            create: vi.fn().mockResolvedValue({
              id: createBookingId(),
              status: "approved",
              totalAmount: D(2000),
              playerName: "Walk-in Player",
              playerPhone: "03001234567",
            }),
          },
          bookingFinance: { create: vi.fn() },
        };
        return fn(tx);
      });

      const service = new BookingService();
      const booking = await service.walkinBooking(createGroundId(), createStaffUserId(), {
        courtId: createCourtId(),
        date: "2026-08-01",
        startTime: "14:00",
        endTime: "15:00",
        playerName: "Walk-in Player",
        playerPhone: "03001234567",
      });

      expect(booking.status).toBe("approved");
      expect(booking.playerName).toBe("Walk-in Player");
    });

    it("should throw without staff access", async () => {
      prisma.groundAccess.findUnique.mockResolvedValue(null);
      const service = new BookingService();
      await expect(
        service.walkinBooking(createGroundId(), createTestUserId(), {
          courtId: createCourtId(),
          date: "2026-08-01",
          startTime: "14:00",
          endTime: "15:00",
          playerName: "Walk-in Player",
        })
      ).rejects.toThrow("Staff access required");
    });
  });

  describe("conflict detection", () => {
    it("should throw on time slot conflict", async () => {
      mockGroundExists();
      mockCourtExists();
      mockConflict();

      const service = new BookingService();
      await expect(
        service.createBooking(createTestUserId(), {
          groundId: createGroundId(),
          courtId: createCourtId(),
          date: "2026-08-01",
          startTime: "10:00",
          endTime: "12:00",
        })
      ).rejects.toThrow("already booked");
    });
  });

  describe("cancelBooking", () => {
    it("should cancel pending booking", async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: createBookingId(),
        playerId: createTestUserId(),
        status: "pending_payment_verification",
        deletedAt: null,
      });
      prisma.booking.update.mockResolvedValue({
        id: createBookingId(),
        status: "cancelled",
        cancelledAt: new Date(),
      });

      const service = new BookingService();
      const result = await service.cancelBooking(createTestUserId(), createBookingId());
      expect(result.status).toBe("cancelled");
    });

    it("should not cancel if not owner", async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: createBookingId(),
        playerId: "different-user-id",
        status: "pending_payment_verification",
      });
      const service = new BookingService();
      await expect(
        service.cancelBooking(createTestUserId(), createBookingId())
      ).rejects.toThrow("Only the booking owner can cancel");
    });
  });

  describe("updateBookingStatus - state machine", () => {
    it("should allow pending→approved transition", async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: createBookingId(),
        groundId: createGroundId(),
        status: "pending_payment_verification",
        deletedAt: null,
      });
      mockStaffAccess();
      prisma.booking.update.mockResolvedValue({ id: createBookingId(), status: "approved" });

      const service = new BookingService();
      const result = await service.updateBookingStatus(createBookingId(), createStaffUserId(), "approved");
      expect(result.status).toBe("approved");
    });

    it("should reject pending→completed transition", async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: createBookingId(),
        groundId: createGroundId(),
        status: "pending_payment_verification",
        deletedAt: null,
      });
      mockStaffAccess();

      const service = new BookingService();
      await expect(
        service.updateBookingStatus(createBookingId(), createStaffUserId(), "completed")
      ).rejects.toThrow("Cannot transition");
    });

    it("should require reason for rejection", async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: createBookingId(),
        groundId: createGroundId(),
        status: "pending_payment_verification",
        deletedAt: null,
      });
      mockStaffAccess();

      const service = new BookingService();
      await expect(
        service.updateBookingStatus(createBookingId(), createStaffUserId(), "rejected")
      ).rejects.toThrow("Rejection reason is required");
    });
  });

  describe("recordPayment", () => {
    it("should record payment with idempotency", async () => {
      prisma.bookingPayment.findUnique.mockResolvedValue(null);
      prisma.booking.findUnique.mockResolvedValue({
        id: createBookingId(),
        groundId: createGroundId(),
        deletedAt: null,
      });
      mockStaffAccess();

      prisma.$transaction = vi.fn(async (fn) => {
        const tx = {
          bookingPayment: {
            create: vi.fn().mockResolvedValue({ id: "payment-1", amount: 2000, channel: "cash" }),
            aggregate: vi.fn()
              .mockReturnValueOnce({ _sum: { amount: 2000 } })
              .mockReturnValueOnce({ _sum: { amount: 0 } })
              .mockReturnValueOnce({ _sum: { amount: 2000 } }),
          },
          bookingFinance: {
            findUnique: vi.fn().mockResolvedValue({ totalAmount: 4000 }),
            update: vi.fn(),
          },
        };
        return fn(tx);
      });

      const service = new BookingService();
      const result = await service.recordPayment(createBookingId(), createStaffUserId(), {
        amount: 2000,
        channel: "cash",
        paymentMethod: "cash",
        idempotencyKey: "unique-key-1",
      });
      expect(result.amount).toBe(2000);
    });

    it("should return existing payment for duplicate idempotency key", async () => {
      prisma.bookingPayment.findUnique.mockResolvedValue({
        id: "existing-payment",
        amount: 2000,
        idempotencyKey: "dup-key",
      });

      const service = new BookingService();
      const result = await service.recordPayment(createBookingId(), createStaffUserId(), {
        amount: 2000,
        channel: "cash",
        paymentMethod: "cash",
        idempotencyKey: "dup-key",
      });
      expect(result.id).toBe("existing-payment");
    });
  });

  describe("getSlots", () => {
    it("should generate available slots", async () => {
      prisma.court.findUnique.mockResolvedValue({
        id: createCourtId(),
        groundId: createGroundId(),
        isActive: true,
        deletedAt: null,
      });
      prisma.groundSchedule.findMany.mockResolvedValue([
        { dayOfWeek: 6, openTime: "06:00", closeTime: "10:00", slotDuration: 60, isActive: true },
      ]);
      prisma.booking.findMany.mockResolvedValue([]);

      const service = new BookingService();
      const result = await service.getSlots(createCourtId(), "2026-08-01");
      expect(result.slots.length).toBeGreaterThan(0);
      expect(result.slots.every((s) => s.available)).toBe(true);
    });

    it("should mark booked slots as unavailable", async () => {
      prisma.court.findUnique.mockResolvedValue({
        id: createCourtId(),
        groundId: createGroundId(),
        isActive: true,
        deletedAt: null,
      });
      prisma.groundSchedule.findMany.mockResolvedValue([
        { dayOfWeek: 6, openTime: "06:00", closeTime: "10:00", slotDuration: 60, isActive: true },
      ]);
      prisma.booking.findMany.mockResolvedValue([
        {
          courtId: createCourtId(),
          startTime: "07:00",
          endTime: "08:00",
          status: "approved",
        },
      ]);

      const service = new BookingService();
      const result = await service.getSlots(createCourtId(), "2026-08-01");
      const slot7to8 = result.slots.find((s) => s.start === "07:00");
      expect(slot7to8.available).toBe(false);
    });
  });
});
