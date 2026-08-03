import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "../src/database/db.js";

function groundId() { return "00000000-0000-4000-8000-000000000001"; }
function ownerId() { return "00000000-0000-4000-8000-000000000002"; }
function broadcastId() { return "00000000-0000-4000-8000-000000000010"; }

function mockOwnerAccess() {
  prisma.groundAccess.findUnique.mockResolvedValue({
    groundId: groundId(), userId: ownerId(), accessRole: "owner", isActive: true,
  });
}

function clearMocks() {
  vi.clearAllMocks();
}

describe("CRM Service", () => {
  let CrmService;

  beforeAll(async () => {
    const mod = await import("../src/modules/crm/crm.service.js");
    CrmService = mod.default;
  });

  beforeEach(() => {
    clearMocks();
  });

  describe("createBroadcast", () => {
    it("should create broadcast as draft", async () => {
      prisma.ground.findUnique.mockResolvedValue({ id: groundId(), ownerId, isActive: true, deletedAt: null });
      mockOwnerAccess();
      prisma.broadcastMessage.create.mockResolvedValue({
        id: broadcastId(), groundId, title: "Weekend Offer", message: "50% off", status: "draft",
      });

      const service = new CrmService();
      const result = await service.createBroadcast(ownerId(), {
        groundId: groundId(), title: "Weekend Offer", message: "50% off",
      });
      expect(result.title).toBe("Weekend Offer");
      expect(result.status).toBe("draft");
    });

    it("should create broadcast as scheduled when date given", async () => {
      prisma.ground.findUnique.mockResolvedValue({ id: groundId(), ownerId, isActive: true, deletedAt: null });
      mockOwnerAccess();
      prisma.broadcastMessage.create.mockResolvedValue({
        id: broadcastId(), groundId, title: "Scheduled", message: "Later", status: "scheduled",
      });

      const service = new CrmService();
      const result = await service.createBroadcast(ownerId(), {
        groundId: groundId(), title: "Scheduled", message: "Later",
        scheduledAt: "2026-08-15T10:00:00Z",
      });
      expect(result.status).toBe("scheduled");
    });

    it("should throw if title or message missing", async () => {
      const service = new CrmService();
      await expect(service.createBroadcast(ownerId(), { groundId: groundId() })).rejects.toThrow("title and message");
    });
  });

  describe("getBroadcasts", () => {
    it("should return broadcasts for ground", async () => {
      prisma.ground.findUnique.mockResolvedValue({ id: groundId(), ownerId, isActive: true, deletedAt: null });
      mockOwnerAccess();
      prisma.broadcastMessage.findMany.mockResolvedValue([
        { id: broadcastId(), title: "Offer", message: "Hi", status: "draft", logs: [] },
      ]);

      const service = new CrmService();
      const result = await service.getBroadcasts(groundId(), ownerId());
      expect(result).toHaveLength(1);
    });
  });

  describe("sendBroadcast", () => {
    it("should mark broadcast as sent", async () => {
      prisma.broadcastMessage.findUnique.mockResolvedValue({
        id: broadcastId(), groundId, status: "draft",
      });
      mockOwnerAccess();
      prisma.broadcastMessage.update.mockResolvedValue({
        id: broadcastId(), status: "sent", sentAt: new Date(),
      });

      const service = new CrmService();
      const result = await service.sendBroadcast(broadcastId(), ownerId());
      expect(result.status).toBe("sent");
    });

    it("should throw if already sent", async () => {
      prisma.broadcastMessage.findUnique.mockResolvedValue({
        id: broadcastId(), groundId, status: "sent",
      });
      mockOwnerAccess();

      const service = new CrmService();
      await expect(service.sendBroadcast(broadcastId(), ownerId())).rejects.toThrow("Already sent");
    });
  });

  describe("getPreferences", () => {
    it("should return defaults if no preference exists", async () => {
      prisma.userCommunicationPreference.findUnique.mockResolvedValue(null);

      const service = new CrmService();
      const result = await service.getPreferences(ownerId());
      expect(result.emailEnabled).toBe(true);
      expect(result.marketing).toBe(true);
    });

    it("should return existing preferences", async () => {
      prisma.userCommunicationPreference.findUnique.mockResolvedValue({
        userId: ownerId(), emailEnabled: false, smsEnabled: true, marketing: false, bookingUpdates: true,
      });

      const service = new CrmService();
      const result = await service.getPreferences(ownerId());
      expect(result.emailEnabled).toBe(false);
      expect(result.smsEnabled).toBe(true);
    });
  });

  describe("updatePreferences", () => {
    it("should upsert preferences", async () => {
      prisma.userCommunicationPreference.upsert.mockResolvedValue({
        userId: ownerId(), emailEnabled: false, smsEnabled: true, marketing: false, bookingUpdates: true,
      });

      const service = new CrmService();
      const result = await service.updatePreferences(ownerId(), { emailEnabled: false, smsEnabled: true, marketing: false });
      expect(result.emailEnabled).toBe(false);
    });
  });
});
