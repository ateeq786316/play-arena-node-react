import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "../src/database/db.js";
import RatingService from "../src/modules/rating/rating.service.js";

const matchId = () => "match-id-001";
const userId = () => "user-id-789";
const captainId = () => "captain-id-111";
const playerId = () => "player-id-222";
const teamId = () => "team-id-333";

function mockTeamMatch(overrides = {}) {
  return {
    id: matchId(),
    challengerTeamId: teamId(),
    opponentTeamId: "opponent-team-id",
    status: "completed",
    scoreChallenger: 3,
    scoreOpponent: 1,
    ...overrides,
  };
}

function mockTeamMember(role = "captain") {
  return { id: "tm1", teamId: teamId(), userId: captainId(), role };
}

describe("Rating Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submitRating", () => {
    it("should submit a valid rating", async () => {
      prisma.teamMatch.findUnique.mockResolvedValue(mockTeamMatch());
      prisma.teamMember.findUnique.mockResolvedValue(mockTeamMember());
      prisma.matchRating.findUnique.mockResolvedValue(null);
      prisma.matchRating.create.mockResolvedValue({ id: "r1", matchId: matchId(), reviewerId: captainId(), skillRating: 4, sportsmanshipRating: 5, punctualityRating: 3 });

      const service = new RatingService();
      const result = await service.submitRating(matchId(), captainId(), { skillRating: 4, sportsmanshipRating: 5, punctualityRating: 3 });
      expect(result.skillRating).toBe(4);
    });

    it("should throw if match not found", async () => {
      prisma.teamMatch.findUnique.mockResolvedValue(null);
      const service = new RatingService();
      await expect(service.submitRating(matchId(), captainId(), {})).rejects.toThrow();
    });

    it("should throw if match not completed", async () => {
      prisma.teamMatch.findUnique.mockResolvedValue(mockTeamMatch({ status: "scheduled" }));
      const service = new RatingService();
      await expect(service.submitRating(matchId(), captainId(), { skillRating: 4, sportsmanshipRating: 5, punctualityRating: 3 })).rejects.toThrow();
    });

    it("should throw if not captain", async () => {
      prisma.teamMatch.findUnique.mockResolvedValue(mockTeamMatch());
      prisma.teamMember.findUnique.mockResolvedValue(null);
      const service = new RatingService();
      await expect(service.submitRating(matchId(), userId(), { skillRating: 4, sportsmanshipRating: 5, punctualityRating: 3 })).rejects.toThrow();
    });

    it("should throw if rating already exists", async () => {
      prisma.teamMatch.findUnique.mockResolvedValue(mockTeamMatch());
      prisma.teamMember.findUnique.mockResolvedValue(mockTeamMember());
      prisma.matchRating.findUnique.mockResolvedValue({ id: "r1" });
      const service = new RatingService();
      await expect(service.submitRating(matchId(), captainId(), { skillRating: 4, sportsmanshipRating: 5, punctualityRating: 3 })).rejects.toThrow();
    });

    it("should throw if rating out of range", async () => {
      prisma.teamMatch.findUnique.mockResolvedValue(mockTeamMatch());
      prisma.teamMember.findUnique.mockResolvedValue(mockTeamMember());
      const service = new RatingService();
      await expect(service.submitRating(matchId(), captainId(), { skillRating: 6, sportsmanshipRating: 5, punctualityRating: 3 })).rejects.toThrow();
    });
  });

  describe("getLeaderboard", () => {
    it("should return global leaderboard", async () => {
      prisma.team.findMany.mockResolvedValue([{ id: teamId(), name: "Team A", elo: 1500, sport: "cricket", logo: null }]);
      const service = new RatingService();
      const result = await service.getLeaderboard();
      expect(result).toHaveLength(1);
    });

    it("should return sport-filtered leaderboard", async () => {
      prisma.team.findMany.mockResolvedValue([{ id: teamId(), name: "Team A", elo: 1500, sport: "cricket", logo: null }]);
      const service = new RatingService();
      const result = await service.getLeaderboard("cricket");
      expect(result).toHaveLength(1);
    });
  });

  describe("getPlayerStats", () => {
    it("should return player stats", async () => {
      prisma.playerStat.findUnique.mockResolvedValue({ userId: playerId(), matchesPlayed: 10, wins: 7, losses: 2, draws: 1, goalsScored: 15, goalsConceded: 5 });
      const service = new RatingService();
      const result = await service.getPlayerStats(playerId());
      expect(result.matchesPlayed).toBe(10);
    });

    it("should return empty stats if none exist", async () => {
      prisma.playerStat.findUnique.mockResolvedValue(null);
      const service = new RatingService();
      const result = await service.getPlayerStats(playerId());
      expect(result.matchesPlayed).toBe(0);
    });
  });

  describe("recordPlayerStats", () => {
    it("should record player stats for captain", async () => {
      prisma.teamMatch.findUnique.mockResolvedValue(mockTeamMatch());
      prisma.teamMember.findUnique.mockResolvedValue(mockTeamMember());
      prisma.playerMatchStat.findUnique.mockResolvedValue(null);
      prisma.playerMatchStat.create.mockResolvedValue({ id: "ps1" });
      prisma.playerStat.upsert.mockResolvedValue({ userId: playerId(), matchesPlayed: 1 });

      const service = new RatingService();
      const result = await service.recordPlayerStats(matchId(), captainId(), { playerId: playerId(), goals: 2, assists: 1 });
      expect(result.message).toBe("Player stats recorded");
    });

    it("should throw if not captain", async () => {
      prisma.teamMatch.findUnique.mockResolvedValue(mockTeamMatch());
      prisma.teamMember.findUnique.mockResolvedValue(null);
      const service = new RatingService();
      await expect(service.recordPlayerStats(matchId(), userId(), { playerId: playerId() })).rejects.toThrow();
    });
  });
});
