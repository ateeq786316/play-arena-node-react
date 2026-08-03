import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "../src/database/db.js";

function groundId() { return "00000000-0000-4000-8000-000000000001"; }
function ownerId() { return "00000000-0000-4000-8000-000000000002"; }
function ruleId() { return "00000000-0000-4000-8000-000000000010"; }
function couponId() { return "00000000-0000-4000-8000-000000000020"; }
function courtId() { return "00000000-0000-4000-8000-000000000030"; }

function mockOwnerAccess() {
  prisma.groundAccess.findUnique.mockResolvedValue({
    groundId: groundId(), userId: ownerId(), accessRole: "owner", isActive: true,
  });
}

function clearMocks() {
  vi.clearAllMocks();
}

describe("Pricing Service", () => {
  let PricingService;

  beforeAll(async () => {
    const mod = await import("../src/modules/pricing/pricing.service.js");
    PricingService = mod.default;
  });

  beforeEach(() => {
    clearMocks();
  });

  describe("createRule", () => {
    it("should create a pricing rule", async () => {
      prisma.ground.findUnique.mockResolvedValue({ id: groundId(), ownerId, isActive: true, deletedAt: null });
      mockOwnerAccess();
      prisma.pricingRule.create.mockResolvedValue({
        id: ruleId(), groundId, name: "Weekend Rate", dayOfWeek: 6, startTime: "08:00", endTime: "20:00", multiplier: 1.5, priority: 0, isActive: true,
      });

      const service = new PricingService();
      const rule = await service.createRule(ownerId(), {
        groundId: groundId(), name: "Weekend Rate", dayOfWeek: 6, startTime: "08:00", endTime: "20:00", multiplier: 1.5, priority: 0,
      });
      expect(rule.name).toBe("Weekend Rate");
      expect(rule.multiplier).toBe(1.5);
    });
  });

  describe("getRules", () => {
    it("should return rules and holidays", async () => {
      prisma.ground.findUnique.mockResolvedValue({ id: groundId(), ownerId, isActive: true, deletedAt: null });
      mockOwnerAccess();
      prisma.pricingRule.findMany.mockResolvedValue([
        { id: ruleId(), name: "Weekend Rate", dayOfWeek: 6, multiplier: 1.5, isActive: true },
      ]);
      prisma.holidayPricing.findMany.mockResolvedValue([
        { id: "hol-1", name: "Eid", date: new Date(), multiplier: 2.0 },
      ]);

      const service = new PricingService();
      const result = await service.getRules(groundId(), ownerId());
      expect(result.rules).toHaveLength(1);
      expect(result.holidays).toHaveLength(1);
    });
  });

  describe("createCoupon", () => {
    it("should create a coupon", async () => {
      prisma.ground.findUnique.mockResolvedValue({ id: groundId(), ownerId, isActive: true, deletedAt: null });
      mockOwnerAccess();
      prisma.coupon.findUnique.mockResolvedValue(null);
      prisma.coupon.create.mockResolvedValue({
        id: couponId(), groundId, code: "WEEKEND50", discountPercent: 50, usedCount: 0, isActive: true,
      });

      const service = new PricingService();
      const coupon = await service.createCoupon(ownerId(), {
        groundId: groundId(), code: "WEEKEND50", discountPercent: 50,
      });
      expect(coupon.code).toBe("WEEKEND50");
    });

    it("should throw if coupon code already exists", async () => {
      prisma.coupon.findUnique.mockResolvedValue({ id: couponId(), code: "WEEKEND50" });

      const service = new PricingService();
      await expect(service.createCoupon(ownerId(), {
        groundId: groundId(), code: "WEEKEND50", discountPercent: 50,
      })).rejects.toThrow("already exists");
    });
  });

  describe("validateCoupon", () => {
    it("should validate a valid coupon", async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        id: couponId(), code: "DISCOUNT10", discountPercent: 10, maxUses: 100, usedCount: 5, isActive: true,
        minBookingAmount: null, expiresAt: null, groundId: groundId(),
      });

      const service = new PricingService();
      const result = await service.validateCoupon("DISCOUNT10", 2000);
      expect(result.valid).toBe(true);
      expect(result.discount).toBe(200);
      expect(result.finalAmount).toBe(1800);
    });

    it("should reject expired coupon", async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        id: couponId(), code: "EXPIRED", discountPercent: 10, maxUses: 100, usedCount: 0, isActive: true,
        minBookingAmount: null, expiresAt: new Date("2020-01-01"), groundId: groundId(),
      });

      const service = new PricingService();
      await expect(service.validateCoupon("EXPIRED", 2000)).rejects.toThrow("expired");
    });

    it("should reject coupon at max usage", async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        id: couponId(), code: "MAXED", discountPercent: 10, maxUses: 10, usedCount: 10, isActive: true,
        minBookingAmount: null, expiresAt: null, groundId: groundId(),
      });

      const service = new PricingService();
      await expect(service.validateCoupon("MAXED", 2000)).rejects.toThrow("usage limit");
    });
  });

  describe("pricePreview", () => {
    it("should return base price when no rules apply", async () => {
      prisma.pricingRule.findMany.mockResolvedValue([]);
      prisma.holidayPricing.findMany.mockResolvedValue([]);
      prisma.court.findUnique.mockResolvedValue({
        id: courtId(), groundId, pricePerHour: 2000, isActive: true,
      });

      const service = new PricingService();
      const result = await service.pricePreview(groundId(), courtId(), "2026-08-03", "10:00", "12:00");
      expect(result.basePrice).toBe(4000);
      expect(result.finalPrice).toBe(4000);
      expect(result.source).toBe("base");
    });

    it("should apply holiday multiplier", async () => {
      prisma.pricingRule.findMany.mockResolvedValue([]);
      prisma.holidayPricing.findMany.mockResolvedValue([
        { date: new Date("2026-08-03"), multiplier: 2.0 },
      ]);
      prisma.court.findUnique.mockResolvedValue({
        id: courtId(), groundId, pricePerHour: 2000, isActive: true,
      });

      const service = new PricingService();
      const result = await service.pricePreview(groundId(), courtId(), "2026-08-03", "10:00", "12:00");
      expect(result.finalPrice).toBe(8000);
      expect(result.source).toBe("holiday");
    });
  });
});
