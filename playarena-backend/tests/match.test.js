import { describe, it, expect, vi, beforeEach } from "vitest";

import prisma from "../src/database/db.js";

function teamAId() { return "t-team-a-001"; }
function teamBId() { return "t-team-b-001"; }
function captainId() { return "u-captain-001"; }
function playerId() { return "u-player-001"; }
function strangerId() { return "u-stranger-01"; }
function requestId() { return "mr-request-1"; }
function matchId() { return "tm-match-001"; }

function mockMember(uid, role, teamId) {
  return { id: `mem-${uid}`, teamId, userId: uid, role, joinedAt: new Date() };
}

function mockTeam(id, elo = 1200) {
  return { id, name: id === teamAId() ? "Team A" : "Team B", sport: "cricket", elo, captainId };
}

function mockRequest(overrides = {}) {
  return {
    id: requestId(),
    challengerTeamId: teamAId(),
    opponentTeamId: teamBId(),
    groundId: null,
    proposedDate: null,
    status: "pending",
    message: null,
    expiresAt: new Date(Date.now() + 86400000),
    challenger: { id: teamAId(), name: "Team A", elo: 1200 },
    opponent: { id: teamBId(), name: "Team B", elo: 1200 },
    ...overrides,
  };
}

function mockMatch(overrides = {}) {
  return {
    id: matchId(),
    matchRequestId: requestId(),
    challengerTeamId: teamAId(),
    opponentTeamId: teamBId(),
    groundId: null,
    scheduledDate: null,
    status: "scheduled",
    scoreChallenger: null,
    scoreOpponent: null,
    scoreSubmittedBy: null,
    startedAt: null,
    completedAt: null,
    challenger: { id: teamAId(), name: "Team A", elo: 1200 },
    opponent: { id: teamBId(), name: "Team B", elo: 1200 },
    ...overrides,
  };
}

function clearMocks() {
  vi.clearAllMocks();
}

function setupMockMember(teamId, userId, role) {
  prisma.teamMember.findUnique.mockImplementation(({ where: { teamId_userId: { teamId: tid, userId: uid } } }) => {
    if (tid === teamId && uid === userId) return mockMember(uid, role, tid);
    return null;
  });
}

describe("Matchmaking Service", () => {
  let MatchService;

  beforeAll(async () => {
    const mod = await import("../src/modules/match/match.service.js");
    MatchService = mod.default;
  });

  beforeEach(() => {
    clearMocks();
  });

  describe("createChallenge", () => {
    it("should throw if opponentTeamId missing", async () => {
      const service = new MatchService();
      await expect(
        service.createChallenge(captainId(), { challengerTeamId: teamAId() })
      ).rejects.toThrow("opponentTeamId is required");
    });

    it("should throw if not captain/co-captain", async () => {
      prisma.teamMember.findUnique.mockResolvedValue(null);
      const service = new MatchService();
      await expect(
        service.createChallenge(playerId(), { challengerTeamId: teamAId(), opponentTeamId: teamBId() })
      ).rejects.toThrow("Only captain or co-captain can challenge");
    });

    it("should throw if challenging own team", async () => {
      setupMockMember(teamAId(), captainId(), "captain");
      const service = new MatchService();
      await expect(
        service.createChallenge(captainId(), { challengerTeamId: teamAId(), opponentTeamId: teamAId() })
      ).rejects.toThrow("Cannot challenge your own team");
    });

    it("should create challenge request", async () => {
      setupMockMember(teamAId(), captainId(), "captain");
      prisma.matchRequest.findMany.mockResolvedValue([]);
      prisma.matchRequest.create.mockResolvedValue(mockRequest());

      const service = new MatchService();
      const result = await service.createChallenge(captainId(), {
        challengerTeamId: teamAId(), opponentTeamId: teamBId(),
      });
      expect(result.status).toBe("pending");
    });
  });

  describe("acceptChallenge", () => {
    it("should accept and create match", async () => {
      prisma.matchRequest.findUnique.mockResolvedValue(mockRequest());
      setupMockMember(teamBId(), captainId(), "captain");
      prisma.teamMatch.create.mockResolvedValue(mockMatch());
      prisma.matchRequest.update.mockResolvedValue(mockRequest({ status: "accepted" }));

      const service = new MatchService();
      const result = await service.acceptChallenge(captainId(), requestId());
      expect(result.status).toBe("scheduled");
    });

    it("should reject if not opponent captain", async () => {
      prisma.matchRequest.findUnique.mockResolvedValue(mockRequest());
      setupMockMember(teamAId(), captainId(), "captain");
      const service = new MatchService();
      await expect(service.acceptChallenge(captainId(), requestId())).rejects.toThrow("Captain or co-captain access required");
    });
  });

  describe("rejectChallenge", () => {
    it("should reject challenge", async () => {
      prisma.matchRequest.findUnique.mockResolvedValue(mockRequest());
      setupMockMember(teamBId(), captainId(), "captain");
      prisma.matchRequest.update.mockResolvedValue(mockRequest({ status: "rejected" }));

      const service = new MatchService();
      await expect(service.rejectChallenge(captainId(), requestId())).resolves.toBeDefined();
    });
  });

  describe("cancelChallenge", () => {
    it("should cancel own challenge", async () => {
      prisma.matchRequest.findUnique.mockResolvedValue(mockRequest());
      setupMockMember(teamAId(), captainId(), "captain");
      prisma.matchRequest.update.mockResolvedValue(mockRequest({ status: "cancelled" }));

      const service = new MatchService();
      await expect(service.cancelChallenge(captainId(), requestId())).resolves.toBeDefined();
    });
  });

  describe("submitScore", () => {
    it("should record first score submission", async () => {
      setupMockMember(teamAId(), captainId(), "captain");
      prisma.teamMatch.findUnique
        .mockResolvedValueOnce(mockMatch())
        .mockResolvedValueOnce(mockMatch({ scoreChallenger: 2, scoreOpponent: 1, scoreSubmittedBy: "challenger", status: "in_progress" }));
      prisma.teamMatch.update.mockResolvedValue({});

      const service = new MatchService();
      const result = await service.submitScore(captainId(), matchId(), { scoreChallenger: 2, scoreOpponent: 1 });
      expect(result.scoreSubmittedBy).toBe("challenger");
    });

    it("should complete match on matching scores", async () => {
      prisma.teamMember.findUnique.mockImplementation(({ where: { teamId_userId: { teamId, userId } } }) => {
        if (teamId === teamAId() && userId === captainId()) return mockMember(captainId(), "captain", teamAId());
        return null;
      });
      prisma.team.findUnique.mockResolvedValue(mockTeam(teamAId(), 1200));
      prisma.teamMatch.count.mockResolvedValue(5);

      prisma.teamMatch.findUnique
        .mockResolvedValueOnce(mockMatch({ scoreChallenger: 2, scoreOpponent: 1, scoreSubmittedBy: "opponent", status: "in_progress" }))
        .mockResolvedValueOnce(mockMatch({
          id: matchId(), status: "completed", scoreChallenger: 2, scoreOpponent: 1,
          challengerTeamId: teamAId(), opponentTeamId: teamBId(),
          scoreSubmittedBy: "both",
        }));
      prisma.teamMatch.update.mockResolvedValue({});
      prisma.team.update.mockResolvedValue({});

      const service = new MatchService();
      const result = await service.submitScore(captainId(), matchId(), { scoreChallenger: 2, scoreOpponent: 1 });
      expect(result.status).toBe("completed");
    });

    it("should flag mismatch as score_pending", async () => {
      prisma.teamMember.findUnique.mockImplementation(({ where: { teamId_userId: { teamId, userId } } }) => {
        if (teamId === teamBId() && userId === captainId()) return mockMember(captainId(), "captain", teamBId());
        return null;
      });
      prisma.teamMatch.findUnique
        .mockResolvedValueOnce(mockMatch({ scoreChallenger: 2, scoreOpponent: 1, scoreSubmittedBy: "challenger", status: "in_progress" }))
        .mockResolvedValueOnce(mockMatch({ id: matchId(), scoreSubmittedBy: "staff", status: "score_pending" }));
      prisma.teamMatch.update.mockResolvedValue({});

      const service = new MatchService();
      const result = await service.submitScore(captainId(), matchId(), { scoreChallenger: 3, scoreOpponent: 1 });
      expect(result.status).toBe("score_pending");
    });
  });

  describe("startMatch", () => {
    it("should start a scheduled match", async () => {
      prisma.teamMatch.findUnique.mockResolvedValue(mockMatch());
      setupMockMember(teamAId(), captainId(), "captain");
      prisma.teamMatch.update.mockResolvedValue(mockMatch({ status: "in_progress", startedAt: new Date() }));

      const service = new MatchService();
      const result = await service.startMatch(captainId(), matchId());
      expect(result.status).toBe("in_progress");
    });
  });

  describe("cancelMatch", () => {
    it("should cancel a non-completed match", async () => {
      prisma.teamMatch.findUnique.mockResolvedValue(mockMatch({ status: "scheduled" }));
      setupMockMember(teamAId(), captainId(), "captain");
      prisma.teamMatch.update.mockResolvedValue(mockMatch({ status: "cancelled" }));

      const service = new MatchService();
      const result = await service.cancelMatch(captainId(), matchId());
      expect(result.status).toBe("cancelled");
    });
  });

  describe("ELO calculation", () => {
    it("should calculate expected score", () => {
      const service = new MatchService();
      const expected = service._expectedScore(1200, 1200);
      expect(expected).toBeCloseTo(0.5, 1);
    });

    it("should favor higher-rated team", () => {
      const service = new MatchService();
      const expected = service._expectedScore(1600, 1200);
      expect(expected).toBeGreaterThan(0.9);
    });
  });
});
