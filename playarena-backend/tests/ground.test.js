import { describe, it, expect, vi, beforeEach } from "vitest";

import prisma from "../src/database/db.js";
function userId() { return "u-00000000-0000-4000-8000-000000000001"; }
function ownerId() { return "u-00000000-0000-4000-8000-000000000002"; }
function groundId() { return "g-00000000-0000-4000-8000-000000000010"; }
function courtId() { return "c-00000000-0000-4000-8000-000000000020"; }
function regionId() { return "r-00000000-0000-4000-8000-000000000030"; }
function cityId() { return "ct-00000000-0000-4000-8000-000000000040"; }

function mockOwnerAccess() {
  prisma.groundAccess.findUnique.mockResolvedValue({
    groundId: groundId(), userId: ownerId(), accessRole: "owner", isActive: true,
  });
}

function mockManagerAccess() {
  prisma.groundAccess.findUnique.mockResolvedValue({
    groundId: groundId(), userId: userId(), accessRole: "manager", isActive: true,
  });
}

function mockNoAccess() {
  prisma.groundAccess.findUnique.mockResolvedValue(null);
}

function mockGround(overrides = {}) {
  return {
    id: groundId(),
    ownerId: ownerId(),
    name: "Test Ground",
    address: "F-8, Islamabad",
    cityId: cityId(),
    regionId: regionId(),
    description: "A test ground",
    contactPhone: "051-1234567",
    isVerified: false,
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    setting: {
      allowOnlineBooking: true,
      allowWalkinBooking: true,
      requireDeposit: true,
      depositPercentage: 50,
      minBookingDuration: 60,
      maxBookingDuration: 180,
      advanceBookingDays: 14,
    },
    images: [],
    courts: [],
    schedules: [],
    ...overrides,
  };
}

function clearMocks() {
  vi.clearAllMocks();
}

describe("Ground Service", () => {
  let GroundService;

  beforeAll(async () => {
    const mod = await import("../src/modules/ground/ground.service.js");
    GroundService = mod.default;
  });

  beforeEach(() => {
    clearMocks();
  });

  describe("createGround", () => {
    it("should throw if name missing", async () => {
      const service = new GroundService();
      await expect(service.createGround(userId(), {})).rejects.toThrow("Ground name is required");
    });

    it("should create ground with owner access and settings", async () => {
      prisma.ground.create.mockResolvedValue(mockGround());
      prisma.groundAccess.create.mockResolvedValue({});
      prisma.groundSetting.upsert.mockResolvedValue({});

      const service = new GroundService();
      const ground = await service.createGround(ownerId(), {
        name: "Test Ground", address: "F-8, Islamabad",
      });
      expect(ground.name).toBe("Test Ground");
      expect(prisma.groundAccess.create).toHaveBeenCalled();
      expect(prisma.groundSetting.upsert).toHaveBeenCalled();
    });
  });

  describe("getGroundById", () => {
    it("should throw if not found", async () => {
      prisma.ground.findUnique.mockResolvedValue(null);
      const service = new GroundService();
      await expect(service.getGroundById("no-id")).rejects.toThrow("Ground not found");
    });

    it("should return ground with relations", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround({ name: "Found Ground" }));
      const service = new GroundService();
      const ground = await service.getGroundById(groundId());
      expect(ground.name).toBe("Found Ground");
    });
  });

  describe("listGrounds", () => {
    it("should return all active grounds", async () => {
      prisma.ground.findMany.mockResolvedValue([mockGround(), mockGround({ name: "Ground 2" })]);
      const service = new GroundService();
      const result = await service.listGrounds();
      expect(result).toHaveLength(2);
    });
  });

  describe("listFeaturedGrounds", () => {
    it("should return verified grounds", async () => {
      prisma.ground.findMany.mockResolvedValue([mockGround({ isVerified: true })]);
      const service = new GroundService();
      const result = await service.listFeaturedGrounds();
      expect(result).toHaveLength(1);
    });
  });

  describe("listMyGrounds", () => {
    it("should return managed grounds", async () => {
      prisma.ground.findMany.mockResolvedValue([mockGround()]);
      const service = new GroundService();
      const result = await service.listMyGrounds(ownerId());
      expect(result).toHaveLength(1);
    });
  });

  describe("updateGround", () => {
    it("should throw if not owner", async () => {
      mockNoAccess();
      const service = new GroundService();
      await expect(service.updateGround(groundId(), userId(), { name: "New" })).rejects.toThrow("Only ground owner");
    });

    it("should update if owner", async () => {
      mockOwnerAccess();
      prisma.ground.update.mockResolvedValue(mockGround({ name: "Updated Ground" }));
      const service = new GroundService();
      const ground = await service.updateGround(groundId(), ownerId(), { name: "Updated Ground" });
      expect(ground.name).toBe("Updated Ground");
    });
  });

  describe("deleteGround", () => {
    it("should throw if not owner", async () => {
      mockNoAccess();
      const service = new GroundService();
      await expect(service.deleteGround(groundId(), userId())).rejects.toThrow("Only ground owner");
    });

    it("should soft delete if owner", async () => {
      mockOwnerAccess();
      prisma.ground.update.mockResolvedValue(mockGround({ deletedAt: new Date(), isActive: false }));
      const service = new GroundService();
      const result = await service.deleteGround(groundId(), ownerId());
      expect(result.isActive).toBe(false);
    });
  });

  describe("createCourt", () => {
    it("should throw if no manager access", async () => {
      mockNoAccess();
      const service = new GroundService();
      await expect(
        service.createCourt(groundId(), userId(), { name: "Court 1", sportType: "cricket", basePrice: 5000, pricePerHour: 2000 })
      ).rejects.toThrow("Only ground owner or manager");
    });

    it("should create court with manager access", async () => {
      mockManagerAccess();
      prisma.court.create.mockResolvedValue({ id: courtId(), name: "Court 1" });
      const service = new GroundService();
      const court = await service.createCourt(groundId(), userId(), {
        name: "Court 1", sportType: "cricket", basePrice: 5000, pricePerHour: 2000,
      });
      expect(court.name).toBe("Court 1");
    });
  });

  describe("listCourts", () => {
    it("should throw if ground not found", async () => {
      prisma.ground.findUnique.mockResolvedValue(null);
      const service = new GroundService();
      await expect(service.listCourts("no-id")).rejects.toThrow("Ground not found");
    });

    it("should return courts for ground", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround());
      prisma.court.findMany.mockResolvedValue([{ id: courtId(), name: "Court 1" }]);
      const service = new GroundService();
      const courts = await service.listCourts(groundId());
      expect(courts).toHaveLength(1);
    });
  });

  describe("updateCourt", () => {
    it("should throw if court not found", async () => {
      prisma.court.findUnique.mockResolvedValue(null);
      const service = new GroundService();
      await expect(service.updateCourt("no-id", userId(), {})).rejects.toThrow("Court not found");
    });
  });

  describe("upsertSchedule", () => {
    it("should require manager access", async () => {
      mockNoAccess();
      const service = new GroundService();
      await expect(
        service.upsertSchedule(groundId(), userId(), 0, { openTime: "06:00", closeTime: "22:00", slotDuration: 60 })
      ).rejects.toThrow("Only ground owner or manager");
    });

    it("should upsert schedule with manager access", async () => {
      mockManagerAccess();
      prisma.groundSchedule.upsert.mockResolvedValue({ groundId: groundId(), dayOfWeek: 0, openTime: "06:00" });
      const service = new GroundService();
      const result = await service.upsertSchedule(groundId(), userId(), 0, { openTime: "06:00", closeTime: "22:00", slotDuration: 60 });
      expect(result.openTime).toBe("06:00");
    });
  });

  describe("listSchedules", () => {
    it("should throw if ground not found", async () => {
      prisma.ground.findUnique.mockResolvedValue(null);
      const service = new GroundService();
      await expect(service.listSchedules("no-id")).rejects.toThrow("Ground not found");
    });
  });

  describe("updateSetting", () => {
    it("should require owner access", async () => {
      mockNoAccess();
      const service = new GroundService();
      await expect(service.updateSetting(groundId(), userId(), { allowOnlineBooking: false })).rejects.toThrow("Only ground owner");
    });

    it("should update setting with owner access", async () => {
      mockOwnerAccess();
      prisma.groundSetting.upsert.mockResolvedValue({ groundId: groundId(), allowOnlineBooking: false });
      const service = new GroundService();
      const result = await service.updateSetting(groundId(), ownerId(), { allowOnlineBooking: false });
      expect(result.allowOnlineBooking).toBe(false);
    });
  });

  describe("listRegions", () => {
    it("should return active regions with cities", async () => {
      prisma.region.findMany.mockResolvedValue([{ id: regionId(), name: "Islamabad", code: "ISB", cities: [] }]);
      const service = new GroundService();
      const regions = await service.listRegions();
      expect(regions).toHaveLength(1);
    });
  });

  describe("addImage", () => {
    it("should require manager access", async () => {
      mockNoAccess();
      const service = new GroundService();
      await expect(service.addImage(groundId(), userId(), { url: "https://img.com/a.jpg" })).rejects.toThrow("Only ground owner or manager");
    });
  });

  describe("inviteStaff", () => {
    it("should require owner access", async () => {
      mockNoAccess();
      const service = new GroundService();
      await expect(service.inviteStaff(groundId(), userId(), { userId: "some-user", accessRole: "manager" })).rejects.toThrow("Only ground owner");
    });
  });
});
