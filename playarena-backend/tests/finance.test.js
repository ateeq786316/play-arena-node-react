import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "../src/database/db.js";
import FinanceService from "../src/modules/finance/finance.service.js";

const groundId = () => "ground-id-111";
const ownerId = () => "owner-id-123";
const staffId = () => "staff-id-456";
const userId = () => "user-id-789";
const methodId = () => "method-id-111";
const sessionId = () => "session-id-222";

function mockPaymentMethod(overrides = {}) {
  return { id: methodId(), name: "Cash", slug: "cash", isActive: true, displayOrder: 0, ...overrides };
}

function mockGround(overrides = {}) {
  return { id: groundId(), ownerId: ownerId(), name: "Test Ground", isActive: true, deletedAt: null, ...overrides };
}

function mockCashSession(overrides = {}) {
  return {
    id: sessionId(),
    groundId: groundId(),
    openedById: staffId(),
    openedAt: new Date(),
    openingCash: 0,
    status: "open",
    ...overrides,
  };
}

describe("Finance Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listPaymentMethods", () => {
    it("should list active payment methods", async () => {
      prisma.paymentMethod.findMany.mockResolvedValue([mockPaymentMethod()]);
      const service = new FinanceService();
      const result = await service.listPaymentMethods();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Cash");
    });
  });

  describe("getGroundPaymentMethods", () => {
    it("should return methods with enabled status", async () => {
      prisma.paymentMethod.findMany.mockResolvedValue([mockPaymentMethod(), mockPaymentMethod({ id: "m2", name: "JazzCash", slug: "jazzcash" })]);
      prisma.groundPaymentMethod.findMany.mockResolvedValue([{ groundId: groundId(), paymentMethodId: "m2", isActive: false }]);

      const service = new FinanceService();
      const result = await service.getGroundPaymentMethods(groundId());
      expect(result).toHaveLength(2);
      expect(result[0].enabled).toBe(true);
      expect(result[1].enabled).toBe(false);
    });
  });

  describe("toggleGroundPaymentMethod", () => {
    it("should toggle if owner", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround());
      prisma.paymentMethod.findUnique.mockResolvedValue(mockPaymentMethod());
      prisma.groundPaymentMethod.findUnique.mockResolvedValue(null);
      prisma.groundPaymentMethod.upsert.mockResolvedValue({ groundId: groundId(), paymentMethodId: methodId(), isActive: true });

      const service = new FinanceService();
      const result = await service.toggleGroundPaymentMethod(groundId(), methodId(), ownerId());
      expect(result.isActive).toBe(true);
    });

    it("should throw if not owner", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround());
      const service = new FinanceService();
      await expect(service.toggleGroundPaymentMethod(groundId(), methodId(), userId())).rejects.toThrow();
    });
  });

  describe("getGroundFinance", () => {
    it("should return finance summary for owner", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround());
      prisma.booking.aggregate.mockResolvedValue({ _sum: { totalAmount: 5000 }, _count: 10 });
      prisma.bookingPayment.aggregate.mockResolvedValue({ _sum: { amount: 3000 }, _count: 8 });

      const service = new FinanceService();
      const result = await service.getGroundFinance(groundId(), ownerId());
      expect(result.bookingAgg._count).toBe(10);
    });

    it("should throw if not owner/manager", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround());
      prisma.groundAccess.findUnique.mockResolvedValue(null);
      const service = new FinanceService();
      await expect(service.getGroundFinance(groundId(), userId())).rejects.toThrow();
    });
  });

  describe("getGroundFinanceReport", () => {
    it("should return report for owner", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround());
      prisma.booking.findMany.mockResolvedValue([{ id: "b1", date: new Date(), finance: {}, payments: [] }]);

      const service = new FinanceService();
      const result = await service.getGroundFinanceReport(groundId(), ownerId(), {});
      expect(result).toHaveLength(1);
    });
  });

  describe("openCashSession", () => {
    it("should open a new cash session", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround({ ownerId: "other-owner" }));
      prisma.groundAccess.findUnique.mockResolvedValue({ id: "a1", groundId: groundId(), userId: staffId(), accessRole: "staff", isActive: true });
      prisma.cashSession.findFirst.mockResolvedValue(null);
      prisma.cashSession.create.mockResolvedValue(mockCashSession());

      const service = new FinanceService();
      const result = await service.openCashSession(groundId(), staffId(), { openingCash: 1000 });
      expect(result.status).toBe("open");
    });

    it("should throw if session already open", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround());
      prisma.cashSession.findFirst.mockResolvedValue(mockCashSession());
      const service = new FinanceService();
      await expect(service.openCashSession(groundId(), staffId(), {})).rejects.toThrow();
    });

    it("should throw if not staff", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround());
      prisma.groundAccess.findUnique.mockResolvedValue(null);
      const service = new FinanceService();
      await expect(service.openCashSession(groundId(), userId(), {})).rejects.toThrow();
    });
  });

  describe("closeCashSession", () => {
    it("should close with variance calculation", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround({ ownerId: "other-owner" }));
      prisma.groundAccess.findUnique.mockResolvedValue({ id: "a1", groundId: groundId(), userId: staffId(), accessRole: "staff", isActive: true });
      prisma.cashSession.findUnique.mockResolvedValue(mockCashSession({ openingCash: 500 }));
      prisma.cashSession.update.mockResolvedValue(mockCashSession({ status: "closed", closingCash: 700, variance: 200 }));

      const service = new FinanceService();
      const result = await service.closeCashSession(groundId(), sessionId(), staffId(), { closingCash: 700 });
      expect(result.status).toBe("closed");
    });

    it("should throw if already closed", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround());
      prisma.cashSession.findUnique.mockResolvedValue(mockCashSession({ status: "closed" }));
      const service = new FinanceService();
      await expect(service.closeCashSession(groundId(), sessionId(), staffId(), { closingCash: 0 })).rejects.toThrow();
    });

    it("should throw if closingCash missing", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround());
      prisma.cashSession.findUnique.mockResolvedValue(mockCashSession());
      const service = new FinanceService();
      await expect(service.closeCashSession(groundId(), sessionId(), staffId(), {})).rejects.toThrow();
    });
  });

  describe("listCashSessions", () => {
    it("should list sessions for owner", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround());
      prisma.cashSession.findMany.mockResolvedValue([mockCashSession()]);

      const service = new FinanceService();
      const result = await service.listCashSessions(groundId(), ownerId());
      expect(result).toHaveLength(1);
    });
  });

  describe("getAdminFinance", () => {
    it("should return platform finance summary", async () => {
      prisma.booking.aggregate.mockResolvedValue({ _sum: { totalAmount: 50000 }, _count: 100 });
      prisma.bookingPayment.aggregate.mockResolvedValue({ _sum: { amount: 45000 }, _count: 95 });
      prisma.ground.count.mockResolvedValue(15);

      const service = new FinanceService();
      const result = await service.getAdminFinance("any-user-id");
      expect(result.totalBookings._count).toBe(100);
      expect(result.totalBookings._sum.totalAmount).toBe(50000);
      expect(result.totalPayments._count).toBe(95);
      expect(result.totalGrounds).toBe(15);
    });
  });
});
