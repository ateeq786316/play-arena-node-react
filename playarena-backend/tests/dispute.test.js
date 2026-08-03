import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "../src/database/db.js";

function userId() { return "00000000-0000-4000-8000-000000000001"; }
function adminId() { return "00000000-0000-4000-8000-000000000002"; }
function bookingId() { return "00000000-0000-4000-8000-000000000010"; }
function disputeId() { return "00000000-0000-4000-8000-000000000020"; }
function groundId() { return "00000000-0000-4000-8000-000000000030"; }

function clearMocks() {
  vi.clearAllMocks();
}

describe("Dispute Service", () => {
  let DisputeService;

  beforeAll(async () => {
    const mod = await import("../src/modules/dispute/dispute.service.js");
    DisputeService = mod.default;
  });

  beforeEach(() => {
    clearMocks();
  });

  describe("fileDispute", () => {
    it("should create a dispute with pending status", async () => {
      prisma.dispute.findFirst.mockResolvedValue(null);
      prisma.dispute.create.mockResolvedValue({
        id: disputeId(), bookingId, filedById: userId(),
        type: "booking_conflict", reason: "Double booked", status: "pending",
      });

      const service = new DisputeService();
      const result = await service.fileDispute(userId(), {
        bookingId, type: "booking_conflict", reason: "Double booked",
      });
      expect(result.status).toBe("pending");
      expect(result.type).toBe("booking_conflict");
    });

    it("should throw if dispute already exists for booking", async () => {
      prisma.dispute.findFirst.mockResolvedValue({ id: "existing-dispute" });

      const service = new DisputeService();
      await expect(service.fileDispute(userId(), {
        bookingId, type: "booking_conflict", reason: "Double booked",
      })).rejects.toThrow("already exists");
    });

    it("should throw if required fields missing", async () => {
      const service = new DisputeService();
      await expect(service.fileDispute(userId(), {})).rejects.toThrow("bookingId");
    });
  });

  describe("myDisputes", () => {
    it("should return user's disputes", async () => {
      prisma.dispute.findMany.mockResolvedValue([
        { id: disputeId(), filedById: userId(), type: "damage", reason: "Broken net", status: "pending" },
      ]);

      const service = new DisputeService();
      const result = await service.myDisputes(userId());
      expect(result).toHaveLength(1);
    });
  });

  describe("getDispute", () => {
    it("should return dispute by id", async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: disputeId(), type: "no_show", reason: "Player didn't show", status: "under_review",
        filedBy: { id: userId(), name: "Test User" },
      });

      const service = new DisputeService();
      const result = await service.getDispute(disputeId(), userId());
      expect(result.status).toBe("under_review");
    });

    it("should throw if not found", async () => {
      prisma.dispute.findUnique.mockResolvedValue(null);
      const service = new DisputeService();
      await expect(service.getDispute("no-id", userId())).rejects.toThrow("Dispute not found");
    });
  });

  describe("getAllDisputes", () => {
    it("should return all disputes with filters", async () => {
      prisma.dispute.findMany.mockResolvedValue([
        { id: disputeId(), type: "booking_conflict", reason: "Double booked", status: "pending", filedById: userId() },
        { id: "dispute-2", type: "no_show", reason: "No show", status: "resolved", filedById: userId() },
      ]);

      const service = new DisputeService();
      const result = await service.getAllDisputes({ status: "pending" });
      expect(result).toHaveLength(2);
    });

    it("should return all disputes without filters", async () => {
      prisma.dispute.findMany.mockResolvedValue([
        { id: disputeId(), type: "booking_conflict", reason: "Double booked", status: "pending", filedById: userId() },
      ]);

      const service = new DisputeService();
      const result = await service.getAllDisputes();
      expect(result).toHaveLength(1);
    });
  });

  describe("resolveDispute", () => {
    it("should resolve a dispute", async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: disputeId(), bookingId, status: "pending",
      });
      prisma.dispute.update.mockResolvedValue({
        id: disputeId(), status: "resolved", resolution: "Refund issued", resolvedById: adminId(), resolvedAt: new Date(),
      });

      const service = new DisputeService();
      const result = await service.resolveDispute(disputeId(), adminId(), { resolution: "Refund issued" });
      expect(result.status).toBe("resolved");
    });

    it("should throw if no resolution given", async () => {
      const service = new DisputeService();
      await expect(service.resolveDispute(disputeId(), adminId(), {})).rejects.toThrow("Resolution");
    });

    it("should apply no-show penalty when action is specified", async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: disputeId(), bookingId, status: "pending",
      });
      prisma.dispute.update.mockResolvedValue({
        id: disputeId(), status: "resolved", resolution: "No-show penalty applied", resolvedById: adminId(), resolvedAt: new Date(),
      });
      prisma.noShowPenalty.create.mockResolvedValue({
        id: "penalty-1", bookingId, amount: 500, status: "applied", appliedAt: new Date(),
      });

      const service = new DisputeService();
      const result = await service.resolveDispute(disputeId(), adminId(), {
        resolution: "No-show penalty applied", action: "no_show_penalty",
      });
      expect(result.status).toBe("resolved");
      expect(prisma.noShowPenalty.create).toHaveBeenCalled();
    });
  });

  describe("fileDamageClaim", () => {
    it("should create damage claim", async () => {
      prisma.damageClaim.create.mockResolvedValue({
        id: "claim-1", groundId, reportedById: userId(), description: "Broken floodlight", damageType: "equipment",
      });

      const service = new DisputeService();
      const result = await service.fileDamageClaim(userId(), {
        groundId, description: "Broken floodlight", damageType: "equipment",
      });
      expect(result.damageType).toBe("equipment");
    });

    it("should throw if required fields missing", async () => {
      const service = new DisputeService();
      await expect(service.fileDamageClaim(userId(), {})).rejects.toThrow("groundId");
    });
  });
});
