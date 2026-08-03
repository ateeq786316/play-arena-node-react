import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "../src/database/db.js";

function groundId() { return "00000000-0000-4000-8000-000000000001"; }
function courtId() { return "00000000-0000-4000-8000-000000000010"; }

function clearMocks() {
  vi.clearAllMocks();
}

describe("Geo Service", () => {
  let GeoService;

  beforeAll(async () => {
    const mod = await import("../src/modules/geo/geo.service.js");
    GeoService = mod.default;
  });

  beforeEach(() => {
    clearMocks();
  });

  describe("searchNearby", () => {
    it("should return paginated nearby results", async () => {
      prisma.$queryRawUnsafe = vi.fn().mockResolvedValue([
        { id: groundId(), name: "Nearby Ground 1", latitude: 33.6844, longitude: 73.0479, distance_km: 1.5 },
        { id: "g-2", name: "Nearby Ground 2", latitude: 33.6944, longitude: 73.0579, distance_km: 2.3 },
      ]);
      prisma.court.findMany.mockResolvedValue([
        { id: courtId(), groundId: groundId(), name: "Court 1", sportType: "cricket", isActive: true },
      ]);

      const service = new GeoService();
      const result = await service.searchNearby({
        latitude: 33.6844, longitude: 73.0479, radius: 10, page: 1, limit: 20,
      });
      expect(result.grounds).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.center).toEqual({ latitude: 33.6844, longitude: 73.0479 });
    });

    it("should filter by sport", async () => {
      prisma.$queryRawUnsafe = vi.fn().mockResolvedValue([
        { id: groundId(), name: "Football Ground", latitude: 33.6844, longitude: 73.0479, distance_km: 0.5 },
      ]);
      prisma.court.findMany.mockResolvedValue([
        { id: courtId(), groundId: groundId(), name: "Court 1", sportType: "football", isActive: true },
      ]);

      const service = new GeoService();
      const result = await service.searchNearby({
        latitude: 33.6844, longitude: 73.0479, radius: 10, sport: "football", page: 1, limit: 20,
      });
      expect(result.grounds).toHaveLength(1);
    });

    it("should throw if lat/lng missing", async () => {
      const service = new GeoService();
      await expect(service.searchNearby({ radius: 10 })).rejects.toThrow("latitude");
    });

    it("should return empty array if no results", async () => {
      prisma.$queryRawUnsafe = vi.fn().mockResolvedValue([]);

      const service = new GeoService();
      const result = await service.searchNearby({
        latitude: 0, longitude: 0, radius: 1, page: 1, limit: 20,
      });
      expect(result.grounds).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it("should paginate results", async () => {
      prisma.$queryRawUnsafe = vi.fn().mockResolvedValue([
        { id: "g-1", name: "Ground 1", latitude: 33.68, longitude: 73.04, distance_km: 1.0 },
        { id: "g-2", name: "Ground 2", latitude: 33.69, longitude: 73.05, distance_km: 2.0 },
      ]);
      prisma.court.findMany.mockResolvedValue([]);

      const service = new GeoService();
      const result = await service.searchNearby({
        latitude: 33.6844, longitude: 73.0479, radius: 10, page: 1, limit: 1,
      });
      expect(result.grounds).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.totalPages).toBe(2);
    });
  });
});
