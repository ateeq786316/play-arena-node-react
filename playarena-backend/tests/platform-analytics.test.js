import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import env from "../src/config/env.js";
import prisma from "../src/database/db.js";

function adminId() { return "00000000-0000-4000-8000-000000000001"; }
function ownerId() { return "00000000-0000-4000-8000-000000000002"; }
function planId(suffix = "plan-starter") {
  return `00000000-0000-4000-8000-${suffix.replace(/-/g, "").slice(0, 12).padEnd(12, "0")}`;
}

function clearMocks() {
  vi.clearAllMocks();
}

function mockSubscription(overrides = {}) {
  return {
    id: "00000000-0000-4000-8000-000000000010",
    groundOwnerId: ownerId(),
    planId: planId(),
    status: "active",
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    cancelledAt: null,
    plan: { id: planId(), name: "Starter", price: 5000, interval: "monthly" },
    ...overrides,
  };
}

describe("Platform Analytics Service", () => {
  let AnalyticsService;

  beforeAll(async () => {
    const mod = await import("../src/modules/analytics/analytics.service.js");
    AnalyticsService = mod.default;
  });

  beforeEach(() => {
    clearMocks();
  });

  describe("getPlatformSummary", () => {
    it("should return subscribers per plan with status breakdown", async () => {
      prisma.groundOwnerSubscription.findMany.mockResolvedValue([
        mockSubscription(),
        mockSubscription({ id: "s2", status: "pending_payment" }),
        mockSubscription({ id: "s3", status: "active", plan: { id: planId("plan-pro"), name: "Professional", price: 12000, interval: "monthly" } }),
      ]);

      const service = new AnalyticsService();
      const result = await service.getPlatformSummary();
      expect(result.subscribersPerPlan).toHaveLength(2);
      const starter = result.subscribersPerPlan.find((p) => p.plan.name === "Starter");
      expect(starter.count).toBe(2);
      expect(starter.statusBreakdown).toEqual({ active: 1, pending_payment: 1 });
    });

    it("should compute MRR as sum of active monthly-equivalent plan prices", async () => {
      prisma.groundOwnerSubscription.findMany.mockResolvedValue([
        mockSubscription({ plan: { id: planId(), name: "Starter", price: 5000, interval: "monthly" } }),
        mockSubscription({ id: "s2", status: "pending_payment", plan: { id: planId("plan-pro"), name: "Professional", price: 12000, interval: "monthly" } }),
        mockSubscription({ id: "s3", plan: { id: planId("plan-yr"), name: "Yearly", price: 120000, interval: "yearly" } }),
      ]);

      const service = new AnalyticsService();
      const result = await service.getPlatformSummary();
      expect(result.mrr).toBe(5000 + 10000);
    });

    it("should return status distribution across all statuses", async () => {
      prisma.groundOwnerSubscription.findMany.mockResolvedValue([
        mockSubscription({ status: "active" }),
        mockSubscription({ id: "s2", status: "trial" }),
        mockSubscription({ id: "s3", status: "cancelled" }),
      ]);

      const service = new AnalyticsService();
      const result = await service.getPlatformSummary();
      expect(result.statusDistribution).toEqual({ active: 1, trial: 1, cancelled: 1 });
      expect(result.generatedAt).toBeDefined();
    });
  });

  describe("getPlatformExpiring", () => {
    it("should return subscriptions expiring within N days", async () => {
      const expiring = [{ id: "s1", groundOwner: { name: "Owner", email: "o@test.com" }, plan: { name: "Starter" }, status: "active", currentPeriodEnd: new Date() }];
      prisma.groundOwnerSubscription.findMany.mockResolvedValue(expiring);

      const service = new AnalyticsService();
      const result = await service.getPlatformExpiring(7);
      expect(result).toHaveLength(1);
      expect(prisma.groundOwnerSubscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ currentPeriodEnd: expect.any(Object) }) })
      );
    });
  });

  describe("getPlatformTrends", () => {
    it("should return daily trends with new subscriptions, cancellations and running MRR", async () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      prisma.groundOwnerSubscription.findMany.mockResolvedValue([
        { createdAt: yesterday, plan: { price: 5000, interval: "monthly" } },
        { createdAt: today, plan: { price: 12000, interval: "monthly" } },
      ]);
      prisma.groundOwnerSubscription.findMany.mockResolvedValueOnce([
        { createdAt: yesterday, plan: { price: 5000, interval: "monthly" } },
        { createdAt: today, plan: { price: 12000, interval: "monthly" } },
      ]).mockResolvedValueOnce([
        { cancelledAt: today, plan: { price: 5000, interval: "monthly" } },
      ]);

      const service = new AnalyticsService();
      const result = await service.getPlatformTrends();
      expect(result.trends.length).toBeGreaterThanOrEqual(2);
      const last = result.trends[result.trends.length - 1];
      expect(last.newSubscriptions).toBe(1);
      expect(last.cancellations).toBe(1);
      expect(last.mrr).toBe(12000);
    });

    it("should respect provided date range", async () => {
      prisma.groundOwnerSubscription.findMany.mockResolvedValue([]);
      const service = new AnalyticsService();
      const result = await service.getPlatformTrends("2026-07-01", "2026-07-05");
      expect(result.trends).toHaveLength(5);
      expect(result.trends[0].date).toBe("2026-07-01");
      expect(result.trends[4].date).toBe("2026-07-05");
    });
  });
});

describe("Platform Analytics Routes", () => {
  let app;

  beforeAll(async () => {
    const { default: analyticsRoutes } = await import("../src/modules/analytics/analytics.route.js");
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use("/api/analytics", analyticsRoutes);
  });

  beforeEach(() => {
    clearMocks();
  });

  function authedGet(path, role = "admin") {
    const token = jwt.sign({ id: adminId() }, env.ACCESSTOKEN, { expiresIn: "15m" });
    prisma.user.findUnique.mockResolvedValue({ id: adminId(), role });
    return request(app).get(path).set("Cookie", [`accessToken=${token}`]);
  }

  it("should return platform summary", async () => {
    prisma.groundOwnerSubscription.findMany.mockResolvedValue([
      mockSubscription(),
      mockSubscription({ id: "s2", status: "trial", plan: { id: planId("plan-pro"), name: "Professional", price: 12000, interval: "monthly" } }),
    ]);

    const res = await authedGet("/api/analytics/platform/summary");
    expect(res.status).toBe(200);
    expect(res.body.subscribersPerPlan).toBeDefined();
    expect(res.body.mrr).toBe(5000);
  });

  it("should return expiring subscriptions", async () => {
    prisma.groundOwnerSubscription.findMany.mockResolvedValue([
      { id: "s1", groundOwner: { name: "Owner", email: "o@test.com" }, plan: { name: "Starter" }, status: "active", currentPeriodEnd: new Date() },
    ]);

    const res = await authedGet("/api/analytics/platform/expiring?days=7");
    expect(res.status).toBe(200);
    expect(res.body.subscriptions).toHaveLength(1);
  });

  it("should return platform trends", async () => {
    prisma.groundOwnerSubscription.findMany.mockResolvedValue([]);
    const res = await authedGet("/api/analytics/platform/trends?startDate=2026-07-01&endDate=2026-07-07");
    expect(res.status).toBe(200);
    expect(res.body.trends).toHaveLength(7);
  });

  it("should reject non-admin user with 403", async () => {
    const res = await authedGet("/api/analytics/platform/summary", "owner");
    expect(res.status).toBe(403);
    expect(prisma.groundOwnerSubscription.findMany).not.toHaveBeenCalled();
  });

  it("should reject invalid days query", async () => {
    const res = await authedGet("/api/analytics/platform/expiring?days=abc");
    expect(res.status).toBe(422);
  });
});
