import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import env from "../src/config/env.js";
import prisma from "../src/database/db.js";

function ownerId() { return "00000000-0000-4000-8000-000000000001"; }
function planId() { return "00000000-0000-4000-8000-000000000010"; }
function subId() { return "00000000-0000-4000-8000-000000000020"; }

function mockPlan(overrides = {}) {
  return {
    id: planId(),
    name: "Starter",
    price: 5000,
    interval: "monthly",
    maxGrounds: 3,
    maxCourtsPerGround: 5,
    maxBookingsPerMonth: 300,
    commissionRate: 0.05,
    features: { analytics: true, crm: true },
    isActive: true,
    sortOrder: 1,
    ...overrides,
  };
}

function mockSubscription(overrides = {}) {
  return {
    id: subId(),
    groundOwnerId: ownerId(),
    planId: planId(),
    status: "active",
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    cancelledAt: null,
    plan: mockPlan(),
    invoices: [],
    ...overrides,
  };
}

function clearMocks() {
  vi.clearAllMocks();
}

function mockFreePlan(overrides = {}) {
  return mockPlan({ id: "00000000-0000-4000-8000-000000000000", name: "Free", price: 0, maxGrounds: 1, maxCourtsPerGround: 2, maxBookingsPerMonth: null, sortOrder: 0, ...overrides });
}

describe("Subscription Service", () => {
  let SubscriptionService;

  beforeAll(async () => {
    const mod = await import("../src/modules/subscription/subscription.service.js");
    SubscriptionService = mod.default;
  });

  beforeEach(() => {
    clearMocks();
  });

  describe("listPlans", () => {
    it("should return all active plans", async () => {
      prisma.subscriptionPlan.findMany.mockResolvedValue([mockPlan()]);
      const service = new SubscriptionService();
      const result = await service.listPlans();
      expect(result.plans).toHaveLength(1);
      expect(result.plans[0].name).toBe("Starter");
    });
  });

  describe("mySubscription", () => {
    it("should return subscription for owner", async () => {
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(mockSubscription());
      prisma.ground.count.mockResolvedValue(1);
      prisma.court.count.mockResolvedValue(2);
      prisma.groundAccess.count.mockResolvedValue(3);
      const service = new SubscriptionService();
      const result = await service.mySubscription(ownerId());
      expect(result.subscription).not.toBeNull();
      expect(result.subscription.plan.name).toBe("Starter");
    });

    it("should return usage counts against plan limits", async () => {
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(mockSubscription());
      prisma.ground.count.mockResolvedValue(1);
      prisma.court.count.mockResolvedValue(2);
      prisma.groundAccess.count.mockResolvedValue(3);
      const service = new SubscriptionService();
      const result = await service.mySubscription(ownerId());
      expect(result.usage).toEqual({
        grounds: 1,
        courts: 2,
        staff: 3,
        groundsLimit: 3,
        courtsLimit: 5,
        staffLimit: 0,
      });
    });

    it("should return trial metadata for trial subscription", async () => {
      const periodEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(
        mockSubscription({ status: "trial", currentPeriodEnd: periodEnd })
      );
      prisma.platformSetting.findMany.mockResolvedValue([
        { key: "trial_enabled", value: "true" },
        { key: "trial_duration_days", value: "14" },
      ]);
      prisma.ground.count.mockResolvedValue(1);
      prisma.court.count.mockResolvedValue(0);
      prisma.groundAccess.count.mockResolvedValue(0);
      const service = new SubscriptionService();
      const result = await service.mySubscription(ownerId());
      expect(result.trial).toEqual({ enabled: true, endsAt: periodEnd.toISOString(), daysRemaining: 14 });
    });

    it("should not return trial metadata when trial disabled", async () => {
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(mockSubscription({ status: "active" }));
      prisma.platformSetting.findMany.mockResolvedValue([{ key: "trial_enabled", value: "false" }]);
      prisma.ground.count.mockResolvedValue(1);
      prisma.court.count.mockResolvedValue(0);
      prisma.groundAccess.count.mockResolvedValue(0);
      const service = new SubscriptionService();
      const result = await service.mySubscription(ownerId());
      expect(result.trial).toBeNull();
    });

    it("should return free plan if no subscription", async () => {
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(null);
      prisma.subscriptionPlan.findMany.mockResolvedValue([
        { id: "free-id", name: "Free", isActive: true, sortOrder: 0, maxGrounds: 1, maxCourtsPerGround: 2 },
      ]);
      prisma.ground.count.mockResolvedValue(1);
      prisma.court.count.mockResolvedValue(2);
      prisma.groundAccess.count.mockResolvedValue(0);
      const service = new SubscriptionService();
      const result = await service.mySubscription(ownerId());
      expect(result.subscription).toBeNull();
      expect(result.plan.name).toBe("Free");
      expect(result.usage).toEqual({ grounds: 1, courts: 2, staff: 0, groundsLimit: 1, courtsLimit: 2, staffLimit: 0 });
    });
  });

  describe("upgrade", () => {
    it("should throw if plan not found", async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(null);
      const service = new SubscriptionService();
      await expect(service.upgrade(ownerId(), "no-plan")).rejects.toThrow("Plan not found");
    });

    it("should create pending_payment subscription with unpaid invoice on first upgrade", async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlan());
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(null);
      prisma.ground.count.mockResolvedValue(1);
      prisma.court.count.mockResolvedValue(1);
      prisma.booking.count.mockResolvedValue(10);
      prisma.groundOwnerSubscription.create.mockResolvedValue(mockSubscription());
      prisma.invoice.create.mockResolvedValue({ id: "inv-1", status: "unpaid" });

      const service = new SubscriptionService();
      const result = await service.upgrade(ownerId(), planId());
      expect(result.subscription.plan.name).toBe("Starter");
      expect(prisma.groundOwnerSubscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "pending_payment" }),
        })
      );
      expect(prisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: "unpaid" }) })
      );
    });

    it("should set existing subscription to pending_payment on re-upgrade", async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlan({ sortOrder: 2, name: "Professional" }));
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(mockSubscription());
      prisma.ground.count.mockResolvedValue(1);
      prisma.court.count.mockResolvedValue(1);
      prisma.booking.count.mockResolvedValue(10);
      prisma.groundOwnerSubscription.update.mockResolvedValue(mockSubscription({ status: "pending_payment", plan: mockPlan({ sortOrder: 2, name: "Professional" }) }));
      prisma.invoice.create.mockResolvedValue({ id: "inv-2", status: "unpaid" });

      const service = new SubscriptionService();
      const result = await service.upgrade(ownerId(), planId());
      expect(result.subscription.status).toBe("pending_payment");
      expect(prisma.groundOwnerSubscription.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: "pending_payment" }) })
      );
      expect(prisma.invoice.create).toHaveBeenCalled();
    });

    it("should reject downgrade via upgrade", async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlan({ sortOrder: 0, name: "Free" }));
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(mockSubscription());
      const service = new SubscriptionService();
      await expect(service.upgrade(ownerId(), planId())).rejects.toThrow("Cannot downgrade");
    });

    it("should reject upgrade when usage exceeds target plan limits", async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlan());
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(mockSubscription({ plan: mockFreePlan() }));
      prisma.ground.count.mockResolvedValue(4);
      prisma.court.count.mockResolvedValue(5);
      prisma.booking.count.mockResolvedValue(10);
      const service = new SubscriptionService();
      await expect(service.upgrade(ownerId(), planId())).rejects.toThrow("Plan limit reached: grounds");
    });

    it("should ignore limits with unlimited (-1) plan values", async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlan({ sortOrder: 2, name: "Professional", maxGrounds: -1, maxCourtsPerGround: -1 }));
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(mockSubscription());
      prisma.ground.count.mockResolvedValue(10);
      prisma.court.count.mockResolvedValue(20);
      prisma.booking.count.mockResolvedValue(50);
      prisma.groundOwnerSubscription.update.mockResolvedValue(mockSubscription({ status: "pending_payment" }));
      prisma.invoice.create.mockResolvedValue({ id: "inv-3", status: "unpaid" });

      const service = new SubscriptionService();
      const result = await service.upgrade(ownerId(), planId());
      expect(result.subscription.status).toBe("pending_payment");
    });
  });

  describe("downgrade", () => {
    it("should throw if plan not found", async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(null);
      const service = new SubscriptionService();
      await expect(service.downgrade(ownerId(), planId())).rejects.toThrow("Plan not found");
    });

    it("should throw if no active subscription", async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockFreePlan());
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(null);
      const service = new SubscriptionService();
      await expect(service.downgrade(ownerId(), planId())).rejects.toThrow("No active subscription");
    });

    it("should apply downgrade immediately without invoice", async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockFreePlan());
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(mockSubscription());
      prisma.groundOwnerSubscription.update.mockResolvedValue(mockSubscription({ plan: mockFreePlan() }));

      const service = new SubscriptionService();
      const result = await service.downgrade(ownerId(), planId());
      expect(result.plan.name).toBe("Free");
      expect(prisma.groundOwnerSubscription.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.not.objectContaining({ status: expect.any(String) }) })
      );
      expect(prisma.invoice.create).not.toHaveBeenCalled();
    });

    it("should reject upgrade via downgrade", async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlan({ sortOrder: 2, name: "Professional" }));
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(mockSubscription());
      const service = new SubscriptionService();
      await expect(service.downgrade(ownerId(), planId())).rejects.toThrow("Cannot upgrade via downgrade");
    });
  });

  describe("cancel", () => {
    it("should throw if no active subscription", async () => {
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(null);
      const service = new SubscriptionService();
      await expect(service.cancel(ownerId())).rejects.toThrow("No active subscription");
    });

    it("should cancel existing subscription keeping plan active until period end", async () => {
      const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(mockSubscription({ currentPeriodEnd: periodEnd }));
      prisma.groundOwnerSubscription.update.mockResolvedValue(mockSubscription({ status: "cancelled", cancelledAt: new Date(), currentPeriodEnd: periodEnd }));

      const service = new SubscriptionService();
      const result = await service.cancel(ownerId());
      expect(result.status).toBe("cancelled");
      expect(prisma.groundOwnerSubscription.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.not.objectContaining({ currentPeriodEnd: expect.any(Date) }) })
      );
    });
  });

  describe("confirmPayment", () => {
    it("should throw if subscription not found", async () => {
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(null);
      const service = new SubscriptionService();
      await expect(service.confirmPayment(subId(), ownerId())).rejects.toThrow("Subscription not found");
    });

    it("should throw if subscription not pending_payment", async () => {
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(mockSubscription());
      const service = new SubscriptionService();
      await expect(service.confirmPayment(subId(), ownerId())).rejects.toThrow("Subscription is not awaiting payment");
    });

    it("should activate subscription and mark unpaid invoice paid", async () => {
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(mockSubscription({ status: "pending_payment" }));
      prisma.groundOwnerSubscription.update.mockResolvedValue(mockSubscription({ status: "active" }));
      prisma.invoice.findFirst.mockResolvedValue({ id: "inv-1", status: "unpaid" });
      prisma.invoice.update.mockResolvedValue({ id: "inv-1", status: "paid", paidAt: new Date() });

      const service = new SubscriptionService();
      const result = await service.confirmPayment(subId(), ownerId());
      expect(result.status).toBe("active");
      expect(prisma.groundOwnerSubscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "active", currentPeriodStart: expect.any(Date), currentPeriodEnd: expect.any(Date) }),
        })
      );
      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: "paid" }) })
      );
    });

    it("should extend period by a year for yearly interval", async () => {
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(
        mockSubscription({ status: "pending_payment", plan: mockPlan({ interval: "yearly" }) })
      );
      prisma.groundOwnerSubscription.update.mockResolvedValue(mockSubscription({ status: "active" }));
      prisma.invoice.findFirst.mockResolvedValue(null);

      const service = new SubscriptionService();
      await service.confirmPayment(subId(), ownerId());
      const call = prisma.groundOwnerSubscription.update.mock.calls[0][0];
      const ms = call.data.currentPeriodEnd - call.data.currentPeriodStart;
      expect(ms).toBe(365 * 24 * 60 * 60 * 1000);
    });
  });

  describe("listExpiring", () => {
    it("should return subscriptions expiring within N days", async () => {
      const expiring = [{ id: subId(), groundOwner: { name: "Owner", email: "o@test.com" }, plan: { name: "Starter" }, status: "active", currentPeriodEnd: new Date() }];
      prisma.groundOwnerSubscription.findMany.mockResolvedValue(expiring);

      const service = new SubscriptionService();
      const result = await service.listExpiring(7);
      expect(result).toHaveLength(1);
      expect(prisma.groundOwnerSubscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ currentPeriodEnd: expect.any(Object) }) })
      );
    });

    it("should default to 7 days", async () => {
      prisma.groundOwnerSubscription.findMany.mockResolvedValue([]);
      const service = new SubscriptionService();
      await service.listExpiring();
      expect(prisma.groundOwnerSubscription.findMany).toHaveBeenCalled();
    });
  });

  describe("getInvoices", () => {
    it("should return invoices for subscription", async () => {
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(mockSubscription());
      prisma.invoice.findMany.mockResolvedValue([
        { id: "inv-1", amount: 5000, status: "paid", createdAt: new Date() },
      ]);
      const service = new SubscriptionService();
      const result = await service.getInvoices(ownerId());
      expect(result.invoices).toHaveLength(1);
    });

    it("should return empty list if no subscription", async () => {
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(null);
      const service = new SubscriptionService();
      const result = await service.getInvoices(ownerId());
      expect(result.invoices).toHaveLength(0);
    });
  });
});

describe("Admin Subscription Routes", () => {
  let app;

  beforeAll(async () => {
    const { adminSubscriptionRoutes } = await import("../src/modules/subscription/subscription.route.js");
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use("/api/admin/subscriptions", adminSubscriptionRoutes);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function authedRequest(method, path, role = "admin") {
    const token = jwt.sign({ id: ownerId() }, env.ACCESSTOKEN, { expiresIn: "15m" });
    prisma.user.findUnique.mockResolvedValue({ id: ownerId(), role });
    return request(app)[method](path).set("Cookie", [`accessToken=${token}`]);
  }

  it("should confirm payment for pending_payment subscription", async () => {
    prisma.groundOwnerSubscription.findUnique.mockResolvedValue(mockSubscription({ status: "pending_payment" }));
    prisma.groundOwnerSubscription.update.mockResolvedValue(mockSubscription({ status: "active" }));
    prisma.invoice.findFirst.mockResolvedValue({ id: "inv-1", status: "unpaid" });
    prisma.invoice.update.mockResolvedValue({ id: "inv-1", status: "paid" });

    const res = await authedRequest("post", `/api/admin/subscriptions/${subId()}/confirm-payment`);
    expect(res.status).toBe(200);
    expect(res.body.subscription.status).toBe("active");
    expect(prisma.groundOwnerSubscription.update).toHaveBeenCalled();
    expect(prisma.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "paid" }) })
    );
  });

  it("should reject invalid subscription id", async () => {
    const res = await authedRequest("post", "/api/admin/subscriptions/not-a-uuid/confirm-payment");
    expect(res.status).toBe(422);
  });

  it("should list expiring subscriptions within N days", async () => {
    prisma.groundOwnerSubscription.findMany.mockResolvedValue([
      { id: subId(), groundOwner: { name: "Owner", email: "o@test.com" }, plan: { name: "Starter" }, status: "active", currentPeriodEnd: new Date() },
    ]);

    const res = await authedRequest("get", "/api/admin/subscriptions/expiring?days=7");
    expect(res.status).toBe(200);
    expect(res.body.subscriptions).toHaveLength(1);
    expect(prisma.groundOwnerSubscription.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ currentPeriodEnd: expect.any(Object) }) })
    );
  });

  it("should reject invalid days query", async () => {
    const res = await authedRequest("get", "/api/admin/subscriptions/expiring?days=abc");
    expect(res.status).toBe(422);
  });

  it("should reject non-admin user with 403", async () => {
    const res = await authedRequest("get", "/api/admin/subscriptions/expiring", "owner");
    expect(res.status).toBe(403);
    expect(prisma.groundOwnerSubscription.findMany).not.toHaveBeenCalled();
  });
});
