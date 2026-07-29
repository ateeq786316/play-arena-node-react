import { describe, it, expect, vi, beforeEach } from "vitest";

import prisma from "../src/database/db.js";

function userId() { return "u-user-0001"; }
function captainId() { return "u-captain-001"; }
function coCaptainId() { return "u-cocaptain-01"; }
function memberId() { return "u-member-001"; }
function teamId() { return "t-team-00001"; }
function strangerId() { return "u-stranger-01"; }

function mockMember(uid, role) {
  return {
    id: `mem-${uid}`,
    teamId: teamId(),
    userId: uid,
    role,
    joinedAt: new Date(),
  };
}

function mockTeam(overrides = {}) {
  return {
    id: teamId(),
    name: "Test Team",
    sport: "cricket",
    cityId: null,
    logo: null,
    description: "A test team",
    elo: 1200,
    captainId: captainId(),
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { members: 5 },
    members: [
      { ...mockMember(captainId(), "captain"), user: { id: captainId(), name: "Captain" } },
      { ...mockMember(memberId(), "player"), user: { id: memberId(), name: "Member" } },
    ],
    captain: { id: captainId(), name: "Captain" },
    ...overrides,
  };
}

function clearMocks() {
  vi.clearAllMocks();
}

function setupCaptainMember() {
  prisma.teamMember.findUnique.mockImplementation(({ where: { teamId_userId: { userId } } }) => {
    if (userId === captainId()) return mockMember(captainId(), "captain");
    if (userId === coCaptainId()) return mockMember(coCaptainId(), "co_captain");
    if (userId === memberId()) return mockMember(memberId(), "player");
    return null;
  });
}

describe("Team Service", () => {
  let TeamService;

  beforeAll(async () => {
    const mod = await import("../src/modules/team/team.service.js");
    TeamService = mod.default;
  });

  beforeEach(() => {
    clearMocks();
  });

  describe("createTeam", () => {
    it("should throw if name or sport missing", async () => {
      const service = new TeamService();
      await expect(service.createTeam(userId(), {})).rejects.toThrow("Team name and sport are required");
      await expect(service.createTeam(userId(), { name: "T" })).rejects.toThrow("Team name and sport are required");
    });

    it("should create team and add creator as captain", async () => {
      prisma.team.create.mockResolvedValue(mockTeam());
      prisma.teamMember.create.mockResolvedValue(mockMember(captainId(), "captain"));

      const service = new TeamService();
      const team = await service.createTeam(captainId(), { name: "Test Team", sport: "cricket" });
      expect(team.name).toBe("Test Team");
      expect(prisma.teamMember.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ role: "captain" }) })
      );
    });
  });

  describe("getTeamById", () => {
    it("should throw if not found", async () => {
      prisma.team.findUnique.mockResolvedValue(null);
      const service = new TeamService();
      await expect(service.getTeamById(userId(), "no-id")).rejects.toThrow("Team not found");
    });

    it("should throw if user not a member", async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      prisma.teamMember.findUnique.mockResolvedValue(null);
      const service = new TeamService();
      await expect(service.getTeamById(strangerId(), teamId())).rejects.toThrow("Not a member");
    });

    it("should return team for member", async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam({ name: "My Team" }));
      prisma.teamMember.findUnique.mockResolvedValue(mockMember(memberId(), "player"));

      const service = new TeamService();
      const team = await service.getTeamById(memberId(), teamId());
      expect(team.name).toBe("My Team");
    });
  });

  describe("listTeams", () => {
    it("should return all teams", async () => {
      prisma.team.findMany.mockResolvedValue([mockTeam(), mockTeam({ name: "Team 2" })]);
      const service = new TeamService();
      const teams = await service.listTeams();
      expect(teams).toHaveLength(2);
    });
  });

  describe("listMyTeams", () => {
    it("should return user's teams", async () => {
      prisma.team.findMany.mockResolvedValue([mockTeam()]);
      const service = new TeamService();
      const teams = await service.listMyTeams(memberId());
      expect(teams).toHaveLength(1);
    });
  });

  describe("updateTeam", () => {
    it("should throw if not captain", async () => {
      prisma.teamMember.findUnique.mockResolvedValue(null);
      const service = new TeamService();
      await expect(service.updateTeam(teamId(), strangerId(), {})).rejects.toThrow("Captain or co-captain access required");
    });

    it("should update if captain", async () => {
      setupCaptainMember();
      prisma.team.update.mockResolvedValue(mockTeam({ name: "Updated" }));
      const service = new TeamService();
      const team = await service.updateTeam(teamId(), captainId(), { name: "Updated" });
      expect(team.name).toBe("Updated");
    });

    it("should update if co-captain", async () => {
      setupCaptainMember();
      prisma.team.update.mockResolvedValue(mockTeam({ name: "Updated" }));
      const service = new TeamService();
      const team = await service.updateTeam(teamId(), coCaptainId(), { name: "Updated" });
      expect(team.name).toBe("Updated");
    });
  });

  describe("deleteTeam", () => {
    it("should throw if not captain", async () => {
      prisma.teamMember.findUnique.mockResolvedValue(null);
      const service = new TeamService();
      await expect(service.deleteTeam(teamId(), memberId())).rejects.toThrow("Captain or co-captain access required");
    });
  });

  describe("member management", () => {
    it("should get members for team member", async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      prisma.teamMember.findUnique.mockResolvedValue(mockMember(memberId(), "player"));

      const service = new TeamService();
      const members = await service.getTeamMembers(teamId(), memberId());
      expect(members).toHaveLength(2);
    });

    it("should update member role (captain only)", async () => {
      setupCaptainMember();
      prisma.teamMember.update.mockResolvedValue(mockMember(memberId(), "co_captain"));

      const service = new TeamService();
      const result = await service.updateMemberRole(teamId(), captainId(), memberId(), "co_captain");
      expect(result.role).toBe("co_captain");
    });

    it("should not allow changing own role", async () => {
      setupCaptainMember();
      const service = new TeamService();
      await expect(service.updateMemberRole(teamId(), captainId(), captainId(), "co_captain")).rejects.toThrow("Cannot change your own role");
    });

    it("should remove member (captain only)", async () => {
      setupCaptainMember();
      prisma.teamMember.delete.mockResolvedValue({});
      const service = new TeamService();
      await expect(service.removeMember(teamId(), captainId(), memberId())).resolves.toBeDefined();
    });

    it("should not let captain remove self", async () => {
      setupCaptainMember();
      const service = new TeamService();
      await expect(service.removeMember(teamId(), captainId(), captainId())).rejects.toThrow("Use transfer-captaincy");
    });
  });

  describe("leaveTeam", () => {
    it("should let player leave", async () => {
      prisma.teamMember.findUnique.mockResolvedValue(mockMember(memberId(), "player"));
      prisma.teamMember.delete.mockResolvedValue({});
      const service = new TeamService();
      await expect(service.leaveTeam(teamId(), memberId())).resolves.toBeDefined();
    });

    it("should block captain from leaving", async () => {
      prisma.teamMember.findUnique.mockResolvedValue(mockMember(captainId(), "captain"));
      const service = new TeamService();
      await expect(service.leaveTeam(teamId(), captainId())).rejects.toThrow("Transfer captaincy before leaving");
    });
  });

  describe("transferCaptaincy", () => {
    it("should transfer to another member", async () => {
      setupCaptainMember();
      prisma.teamMember.findUnique.mockImplementation(({ where: { teamId_userId: { userId } } }) => {
        if (userId === captainId()) return mockMember(captainId(), "captain");
        if (userId === memberId()) return mockMember(memberId(), "player");
        return null;
      });
      prisma.teamMember.update.mockResolvedValue({});
      prisma.team.update.mockResolvedValue(mockTeam({ captainId: memberId() }));

      const service = new TeamService();
      const result = await service.transferCaptaincy(teamId(), captainId(), memberId());
      expect(result.message).toBe("Captaincy transferred");
    });

    it("should throw if target not a member", async () => {
      setupCaptainMember();
      prisma.teamMember.findUnique.mockImplementation(({ where: { teamId_userId: { userId } } }) => {
        if (userId === captainId()) return mockMember(captainId(), "captain");
        return null;
      });
      const service = new TeamService();
      await expect(service.transferCaptaincy(teamId(), captainId(), strangerId())).rejects.toThrow("Target user is not a member");
    });
  });

  describe("invites", () => {
    it("should invite player (captain only)", async () => {
      prisma.teamMember.findUnique.mockImplementation(({ where: { teamId_userId: { userId } } }) => {
        if (userId === captainId()) return mockMember(captainId(), "captain");
        return null;
      });
      prisma.teamInvite.findUnique.mockResolvedValue(null);
      prisma.teamInvite.create.mockResolvedValue({ id: "inv-1", status: "pending" });

      const service = new TeamService();
      const invite = await service.invitePlayer(teamId(), captainId(), { targetUserId: strangerId() });
      expect(invite.status).toBe("pending");
    });

    it("should reject invite if already member", async () => {
      prisma.teamMember.findUnique.mockImplementation(({ where: { teamId_userId: { userId } } }) => {
        if (userId === captainId()) return mockMember(captainId(), "captain");
        if (userId === memberId()) return mockMember(memberId(), "player");
        return null;
      });
      const service = new TeamService();
      await expect(service.invitePlayer(teamId(), captainId(), { targetUserId: memberId() })).rejects.toThrow("already a member");
    });
  });

  describe("join requests", () => {
    it("should allow requesting to join", async () => {
      prisma.teamMember.findUnique.mockResolvedValue(null);
      prisma.joinRequest.findUnique.mockResolvedValue(null);
      prisma.joinRequest.create.mockResolvedValue({ id: "jr-1", status: "pending" });

      const service = new TeamService();
      const req = await service.requestToJoin(teamId(), strangerId());
      expect(req.status).toBe("pending");
    });

    it("should block duplicate join request", async () => {
      prisma.teamMember.findUnique.mockResolvedValue(null);
      prisma.joinRequest.findUnique.mockResolvedValue({ id: "jr-1", status: "pending" });

      const service = new TeamService();
      await expect(service.requestToJoin(teamId(), strangerId())).rejects.toThrow("already pending");
    });

    it("should accept join request (captain)", async () => {
      setupCaptainMember();
      prisma.joinRequest.findUnique.mockResolvedValue({ id: "jr-1", teamId: teamId(), userId: strangerId(), status: "pending" });
      prisma.joinRequest.update.mockResolvedValue({});
      prisma.teamMember.create.mockResolvedValue({});

      const service = new TeamService();
      const result = await service.acceptJoinRequest(teamId(), captainId(), strangerId());
      expect(result.message).toBe("Join request accepted");
    });
  });

  describe("getTeamStats", () => {
    it("should return stats for member", async () => {
      prisma.teamMember.findUnique.mockResolvedValue(mockMember(memberId(), "player"));
      prisma.team.findUnique.mockResolvedValue(mockTeam({ elo: 1350 }));

      const service = new TeamService();
      const stats = await service.getTeamStats(teamId(), memberId());
      expect(stats.elo).toBe(1350);
      expect(stats.totalMembers).toBe(5);
    });
  });

  describe("listSportCategories", () => {
    it("should return active sports", async () => {
      prisma.sportCategory.findMany.mockResolvedValue([{ name: "Cricket" }, { name: "Football" }]);
      const service = new TeamService();
      const result = await service.listSportCategories();
      expect(result).toHaveLength(2);
    });
  });
});
