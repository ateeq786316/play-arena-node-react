import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "../src/database/db.js";
import HealthService from "../src/modules/health/health.service.js";

describe("Health Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return ok with db latency", async () => {
    prisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);
    const service = new HealthService();
    const result = await service.check();
    expect(result.status).toBe("ok");
    expect(result.services.database.status).toBe("up");
    expect(result.services.database.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("should handle db down", async () => {
    prisma.$queryRaw.mockRejectedValue(new Error("DB connection failed"));
    const service = new HealthService();
    const result = await service.check();
    expect(result.status).toBe("ok");
    expect(result.services.database.status).toBe("down");
    expect(result.services.database.latencyMs).toBeNull();
  });
});
