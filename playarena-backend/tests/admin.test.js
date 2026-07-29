import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "../src/database/db.js";
import AdminService from "../src/modules/admin/admin.service.js";

const adminId = () => "admin-id-001";
const userId = () => "user-id-789";
const groundId = () => "ground-id-111";
const teamId = () => "team-id-333";

describe("Admin Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should return paginated users for super_admin", async () => {
      prisma.user.findUnique.mockResolvedValue({ role: "super_admin" });
      prisma.user.findMany.mockResolvedValue([{ id: userId(), name: "Test", email: "test@test.com", role: "player" }]);
      prisma.user.count.mockResolvedValue(1);

      const service = new AdminService();
      const result = await service.getUsers(adminId(), {});
      expect(result.users).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("should throw if not super_admin", async () => {
      prisma.user.findUnique.mockResolvedValue({ role: "player" });
      const service = new AdminService();
      await expect(service.getUsers(userId(), {})).rejects.toThrow();
    });
  });

  describe("getUserDetail", () => {
    it("should return user detail", async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce({ role: "super_admin" })
        .mockResolvedValueOnce({ id: userId(), name: "Test", email: "test@test.com", _count: { bookings: 0, ownedTeams: 0, teamMemberships: 0, grounds: 0 } });

      const service = new AdminService();
      const result = await service.getUserDetail(adminId(), userId());
      expect(result.name).toBe("Test");
    });
  });

  describe("getGrounds", () => {
    it("should return paginated grounds", async () => {
      prisma.user.findUnique.mockResolvedValue({ role: "super_admin" });
      prisma.ground.findMany.mockResolvedValue([{ id: groundId(), name: "Test Ground", owner: { id: userId(), name: "Owner" }, _count: { courts: 2, bookings: 5 } }]);
      prisma.ground.count.mockResolvedValue(1);

      const service = new AdminService();
      const result = await service.getGrounds(adminId(), {});
      expect(result.grounds).toHaveLength(1);
    });
  });

  describe("verifyGround", () => {
    it("should verify a ground", async () => {
      prisma.user.findUnique.mockResolvedValue({ role: "super_admin" });
      prisma.ground.findUnique.mockResolvedValue({ id: groundId(), name: "Test Ground" });
      prisma.ground.update.mockResolvedValue({ id: groundId(), isVerified: true });
      prisma.auditLog.create.mockResolvedValue({});

      const service = new AdminService();
      const result = await service.verifyGround(adminId(), groundId());
      expect(result.isVerified).toBe(true);
    });
  });

  describe("suspendGround", () => {
    it("should suspend a ground", async () => {
      prisma.user.findUnique.mockResolvedValue({ role: "super_admin" });
      prisma.ground.findUnique.mockResolvedValue({ id: groundId(), name: "Test Ground" });
      prisma.ground.update.mockResolvedValue({ id: groundId(), isActive: false });
      prisma.auditLog.create.mockResolvedValue({});

      const service = new AdminService();
      const result = await service.suspendGround(adminId(), groundId());
      expect(result.isActive).toBe(false);
    });
  });

  describe("getTeams", () => {
    it("should return paginated teams", async () => {
      prisma.user.findUnique.mockResolvedValue({ role: "super_admin" });
      prisma.team.findMany.mockResolvedValue([{ id: teamId(), name: "Team A", captain: { id: userId(), name: "Captain" }, _count: { members: 5 } }]);
      prisma.team.count.mockResolvedValue(1);

      const service = new AdminService();
      const result = await service.getTeams(adminId(), {});
      expect(result.teams).toHaveLength(1);
    });
  });

  describe("getFinance", () => {
    it("should return platform finance", async () => {
      prisma.user.findUnique.mockResolvedValue({ role: "super_admin" });
      prisma.user.count.mockResolvedValue(100);
      prisma.ground.count.mockResolvedValue(10);
      prisma.team.count.mockResolvedValue(20);
      prisma.booking.aggregate.mockResolvedValue({ _sum: { totalAmount: 50000 }, _count: 200 });
      prisma.bookingPayment.aggregate.mockResolvedValue({ _sum: { amount: 30000 }, _count: 150 });

      const service = new AdminService();
      const result = await service.getFinance(adminId());
      expect(result.totalUsers).toBe(100);
      expect(result.totalGrounds).toBe(10);
    });
  });

  describe("getAuditLogs", () => {
    it("should return paginated audit logs", async () => {
      prisma.user.findUnique.mockResolvedValue({ role: "super_admin" });
      prisma.auditLog.findMany.mockResolvedValue([{ id: "log1", action: "ground_verified", entity: "ground" }]);
      prisma.auditLog.count.mockResolvedValue(1);

      const service = new AdminService();
      const result = await service.getAuditLogs(adminId(), {});
      expect(result.logs).toHaveLength(1);
    });
  });
});
