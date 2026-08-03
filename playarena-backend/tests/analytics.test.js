import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import env from "../src/config/env.js";
import prisma from "../src/database/db.js";

function groundId() { return "00000000-0000-4000-8000-000000000001"; }
function ownerId() { return "00000000-0000-4000-8000-000000000002"; }
function courtId() { return "00000000-0000-4000-8000-000000000010"; }

function mockOwnerAccess() {
  prisma.groundAccess.findUnique.mockResolvedValue({
    groundId: groundId(), userId: ownerId(), accessRole: "owner", isActive: true,
  });
}

function clearMocks() {
  vi.clearAllMocks();
}

describe("Analytics Service", () => {
  let AnalyticsService;

  beforeAll(async () => {
    const mod = await import("../src/modules/analytics/analytics.service.js");
    AnalyticsService = mod.default;
  });

  beforeEach(() => {
    clearMocks();
  });

  function mockVerifiedGround() {
    prisma.ground.findUnique.mockResolvedValue({ id: groundId(), ownerId: ownerId(), isActive: true, isVerified: true, deletedAt: null });
  }

  describe("getDashboard", () => {
    it("should return dashboard data for valid ground", async () => {
      mockVerifiedGround();
      mockOwnerAccess();
      prisma.analyticsSnapshot.findMany.mockResolvedValue([
        { date: new Date(), totalRevenue: 10000, totalBookings: 5, completedBookings: 4, cancelledBookings: 1, utilizationRate: 0.8, newCustomers: 3, returningCustomers: 2, avgBookingValue: 2000 },
      ]);
      prisma.dailyAggregation.findMany.mockResolvedValue([
        { hour: 10, bookings: 2, revenue: 4000 },
      ]);

      prisma.booking.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(2);
      prisma.analyticsSnapshot.findFirst.mockResolvedValue({ date: new Date("2026-07-30") });

      const service = new AnalyticsService();
      const result = await service.getDashboard(groundId(), ownerId(), {});
      expect(result.revenue).toBeDefined();
      expect(result.bookings.total).toBe(10);
    });

    it("should throw if ground not found", async () => {
      prisma.ground.findUnique.mockResolvedValue(null);
      const service = new AnalyticsService();
      await expect(service.getDashboard(groundId(), ownerId(), {})).rejects.toThrow("Ground not found");
    });

    it("should throw for unverified ground", async () => {
      prisma.ground.findUnique.mockResolvedValue({ id: groundId(), ownerId: ownerId(), isActive: true, isVerified: false, deletedAt: null });
      const service = new AnalyticsService();
      await expect(service.getDashboard(groundId(), ownerId(), {})).rejects.toThrow("Analytics unavailable for unverified grounds");
    });
  });

  describe("getHeatmap", () => {
    it("should return hourly heatmap data", async () => {
      mockVerifiedGround();
      mockOwnerAccess();
      prisma.dailyAggregation.findMany.mockResolvedValue([
        { groundId: groundId(), courtId, date: new Date(), hour: 10, bookings: 3, revenue: 6000 },
        { groundId: groundId(), courtId, date: new Date(), hour: 11, bookings: 5, revenue: 10000 },
      ]);

      const service = new AnalyticsService();
      const result = await service.getHeatmap(groundId(), ownerId(), "2026-08-01", "2026-08-07");
      expect(result.heatmap).toHaveLength(2);
    });
  });

  describe("generateReport", () => {
    it("should return report data", async () => {
      mockVerifiedGround();
      mockOwnerAccess();
      prisma.analyticsSnapshot.findMany.mockResolvedValue([]);
      prisma.dailyAggregation.findMany.mockResolvedValue([]);

      const service = new AnalyticsService();
      const result = await service.generateReport(groundId(), ownerId(), "2026-08-01", "2026-08-07");
      expect(result.generatedAt).toBeDefined();
      expect(result.snapshots).toEqual([]);
    });
  });

  describe("retention enforcement", () => {
    it("should clamp startDate to retention window and include dataAsOf/retentionNotice", async () => {
      mockVerifiedGround();
      mockOwnerAccess();
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue({
        groundOwnerId: ownerId(), planId: "p1", status: "active",
        plan: { id: "p1", analyticsRetentionDays: 7 },
      });
      prisma.analyticsSnapshot.findMany.mockResolvedValue([]);
      prisma.dailyAggregation.findMany.mockResolvedValue([]);
      prisma.booking.count.mockResolvedValue(0);
      prisma.analyticsSnapshot.findFirst.mockResolvedValue({ date: new Date("2026-07-30") });

      const service = new AnalyticsService();
      const result = await service.getDashboard(groundId(), ownerId(), {
        startDate: "2026-07-01",
        endDate: "2026-07-31",
      });
      expect(result.retentionDays).toBe(7);
      expect(result.dataAsOf).toBe("2026-07-30");
      expect(result.retentionNotice).toMatch(/retention/i);
      expect(result.period.startDate.getDate()).toBe(25);
    });

    it("should fall back to 7-day retention when no subscription plan exists", async () => {
      mockVerifiedGround();
      mockOwnerAccess();
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue(null);
      prisma.analyticsSnapshot.findMany.mockResolvedValue([]);
      prisma.dailyAggregation.findMany.mockResolvedValue([]);
      prisma.booking.count.mockResolvedValue(0);

      const service = new AnalyticsService();
      const result = await service.getDashboard(groundId(), ownerId(), {
        startDate: "2026-07-01",
        endDate: "2026-07-31",
      });
      expect(result.retentionDays).toBe(7);
      expect(result.period.startDate.getDate()).toBe(25);
    });

    it("should not clamp when requested window is within retention", async () => {
      mockVerifiedGround();
      mockOwnerAccess();
      prisma.groundOwnerSubscription.findUnique.mockResolvedValue({
        groundOwnerId: ownerId(), planId: "p1", status: "active",
        plan: { id: "p1", analyticsRetentionDays: 30 },
      });
      prisma.analyticsSnapshot.findMany.mockResolvedValue([]);
      prisma.dailyAggregation.findMany.mockResolvedValue([]);
      prisma.booking.count.mockResolvedValue(0);

      const service = new AnalyticsService();
      const result = await service.getDashboard(groundId(), ownerId(), {
        startDate: "2026-07-20",
        endDate: "2026-07-31",
      });
      expect(result.retentionNotice).toBeNull();
      expect(result.period.startDate.getDate()).toBe(20);
    });
  });

  describe("aggregateDay", () => {
    it("should build snapshot + daily aggregation for approved grounds", async () => {
      prisma.ground.findMany.mockResolvedValue([{ id: groundId() }]);
      prisma.booking.findMany
        .mockResolvedValueOnce([
          {
            id: "b1", courtId, playerId: "player1", date: new Date("2026-07-30"),
            startTime: "10:00", endTime: "12:00", totalAmount: 2000, status: "completed",
            finance: { onlineReceived: 1500, offlineReceived: 500 },
          },
          {
            id: "b2", courtId, playerId: "player1", date: new Date("2026-07-30"),
            startTime: "14:00", endTime: "15:00", totalAmount: 1000, status: "cancelled",
            finance: { onlineReceived: 0, offlineReceived: 0 },
          },
        ])
        .mockResolvedValueOnce([]);
      prisma.court.count.mockResolvedValue(2);
      prisma.analyticsSnapshot.upsert.mockImplementation(async (args) => args.create);
      prisma.dailyAggregation.upsert.mockImplementation(async (args) => args.create);

      const service = new AnalyticsService();
      const results = await service.aggregateDay("2026-07-30");

      expect(prisma.ground.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ isVerified: true }),
      }));
      expect(results).toHaveLength(1);
      const snapshot = results[0].snapshot;
      expect(snapshot.totalRevenue).toBe(2000);
      expect(snapshot.onlineRevenue).toBe(1500);
      expect(snapshot.offlineRevenue).toBe(500);
      expect(snapshot.totalBookings).toBe(2);
      expect(snapshot.completedBookings).toBe(1);
      expect(snapshot.cancelledBookings).toBe(1);
      expect(snapshot.newCustomers).toBe(1);
      expect(snapshot.returningCustomers).toBe(0);
      expect(results[0].dailyAggs.length).toBeGreaterThan(0);
      const heat = results[0].dailyAggs.find((a) => a.hour === 10);
      expect(heat).toBeDefined();
      expect(heat.bookings).toBe(1);
      expect(Number(heat.revenue)).toBe(2000);
    });

    it("should skip grounds that fail aggregation and continue", async () => {
      prisma.ground.findMany.mockResolvedValue([{ id: groundId() }, { id: "00000000-0000-4000-8000-000000000099" }]);
      prisma.booking.findMany
        .mockRejectedValueOnce(new Error("boom"))
        .mockResolvedValueOnce([]);
      prisma.court.count.mockResolvedValue(0);
      prisma.analyticsSnapshot.upsert.mockImplementation(async (args) => args.create);

      const service = new AnalyticsService();
      const results = await service.aggregateDay("2026-07-30");
      expect(results).toHaveLength(1);
      expect(results[0].groundId).toBe("00000000-0000-4000-8000-000000000099");
    });

    it("should respect approved-ground filter (pending/rejected excluded)", async () => {
      prisma.ground.findMany.mockResolvedValue([]);
      const service = new AnalyticsService();
      const results = await service.aggregateDay("2026-07-30");
      expect(results).toHaveLength(0);
      expect(prisma.booking.findMany).not.toHaveBeenCalled();
    });
  });
});

describe("Analytics Report Export (CSV)", () => {
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

  function authedGet(path) {
    const token = jwt.sign({ id: ownerId() }, env.ACCESSTOKEN, { expiresIn: "15m" });
    return request(app).get(path).set("Cookie", [`accessToken=${token}`]);
  }

  function mockReportData() {
    prisma.ground.findUnique.mockResolvedValue({
      id: groundId(), ownerId: ownerId(), isActive: true, isVerified: true, deletedAt: null,
    });
    prisma.groundOwnerSubscription.findUnique.mockResolvedValue({
      groundOwnerId: ownerId(), planId: "p1", status: "active",
      plan: { id: "p1", name: "Starter", features: { analytics: true }, analyticsRetentionDays: 30 },
    });
    mockOwnerAccess();
    prisma.analyticsSnapshot.findMany.mockResolvedValue([
      { date: new Date("2026-07-28"), totalRevenue: 10000, onlineRevenue: 7000, offlineRevenue: 3000, totalBookings: 5, completedBookings: 4, cancelledBookings: 1, utilizationRate: 0.5, newCustomers: 3, returningCustomers: 2, avgBookingValue: 2000 },
      { date: new Date("2026-07-29"), totalRevenue: 12000, onlineRevenue: 8000, offlineRevenue: 4000, totalBookings: 6, completedBookings: 5, cancelledBookings: 1, utilizationRate: 0.6, newCustomers: 4, returningCustomers: 2, avgBookingValue: 2000 },
    ]);
    prisma.dailyAggregation.findMany.mockResolvedValue([]);
    prisma.analyticsSnapshot.findFirst.mockResolvedValue({ date: new Date("2026-07-29") });
  }

  it("should return JSON by default (backward compatible)", async () => {
    mockReportData();
    const res = await authedGet(`/api/analytics/${groundId()}/report?startDate=2026-07-28&endDate=2026-07-29`);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body.report).toBeDefined();
    expect(res.body.report.dataAsOf).toBe("2026-07-29");
  });

  it("should return CSV with content-type header and correct row count", async () => {
    mockReportData();
    const res = await authedGet(`/api/analytics/${groundId()}/report?startDate=2026-07-28&endDate=2026-07-29&export=csv`);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/csv/);
    expect(res.headers["content-disposition"]).toContain(`report_${groundId()}_2026-07-28_2026-07-29.csv`);
    const lines = res.text.trim().split("\r\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("date,revenue,online,offline,bookings,completed,cancelled,utilization,new,returning,avgValue");
    expect(lines[1]).toBe("2026-07-28,10000.00,7000.00,3000.00,5,4,1,0.5000,3,2,2000.00");
  });

  it("should respect retention clamp in export", async () => {
    mockReportData();
    prisma.groundOwnerSubscription.findUnique.mockResolvedValue({
      groundOwnerId: ownerId(), planId: "p1", status: "active",
      plan: { id: "p1", features: { analytics: true }, analyticsRetentionDays: 2 },
    });
    const res = await authedGet(`/api/analytics/${groundId()}/report?startDate=2026-07-01&endDate=2026-07-29&export=csv`);
    expect(res.status).toBe(200);
    expect(prisma.analyticsSnapshot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ date: expect.objectContaining({ gte: expect.any(Date) }) }) })
    );
    const lines = res.text.trim().split("\r\n");
    expect(lines).toHaveLength(3);
  });
});
