import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "../src/database/db.js";
import TournamentService from "../src/modules/tournament/tournament.service.js";

const userId = () => "owner-id-123";
const otherUserId = () => "other-user-456";
const tournamentId = () => "tournament-id-789";
const teamId1 = () => "team-id-111";
const teamId2 = () => "team-id-222";
const teamId3 = () => "team-id-333";
const teamId4 = () => "team-id-444";
const matchId = () => "match-id-555";

function mockTournament(overrides = {}) {
  return {
    id: tournamentId(),
    name: "Test Tournament",
    sport: "cricket",
    format: "knockout",
    status: "registration_open",
    groundId: null,
    maxTeams: 16,
    minTeams: 4,
    registrationStarts: null,
    registrationEnds: null,
    startDate: null,
    endDate: null,
    description: "A test tournament",
    rules: null,
    ownerId: userId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    teams: [],
    _count: { teams: 0, matches: 0 },
    ...overrides,
  };
}

function mockTournamentTeam(tournamentIdVal, teamIdVal, overrides = {}) {
  return {
    id: "tt-id",
    tournamentId: tournamentIdVal,
    teamId: teamIdVal,
    seed: null,
    group: null,
    points: 0,
    played: 0,
    won: 0,
    lost: 0,
    drawn: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    registeredAt: new Date(),
    team: { id: teamIdVal, name: "Team", logo: null },
    ...overrides,
  };
}

function mockTournamentMatch(overrides = {}) {
  return {
    id: matchId(),
    tournamentId: tournamentId(),
    round: 1,
    matchIndex: 0,
    team1Id: teamId1(),
    team2Id: teamId2(),
    winnerId: null,
    score1: null,
    score2: null,
    status: "scheduled",
    scheduledDate: null,
    groundId: null,
    courtId: null,
    playedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    tournament: { id: tournamentId(), format: "knockout", status: "ongoing" },
    ...overrides,
  };
}

describe("Tournament Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTournament", () => {
    it("should create a tournament", async () => {
      prisma.tournament.create.mockResolvedValue(mockTournament());
      const service = new TournamentService();
      const result = await service.createTournament(userId(), {
        name: "Test Tournament",
        sport: "cricket",
        format: "knockout",
      });
      expect(result.name).toBe("Test Tournament");
      expect(result.ownerId).toBe(userId());
    });

    it("should throw if name/sport/format missing", async () => {
      const service = new TournamentService();
      await expect(service.createTournament(userId(), {})).rejects.toThrow();
    });

    it("should throw if invalid format", async () => {
      const service = new TournamentService();
      await expect(service.createTournament(userId(), { name: "T", sport: "cricket", format: "invalid" })).rejects.toThrow();
    });
  });

  describe("listTournaments", () => {
    it("should list all tournaments", async () => {
      prisma.tournament.findMany.mockResolvedValue([mockTournament()]);
      const service = new TournamentService();
      const result = await service.listTournaments();
      expect(result).toHaveLength(1);
    });

    it("should apply filters", async () => {
      prisma.tournament.findMany.mockResolvedValue([]);
      const service = new TournamentService();
      await service.listTournaments({ sport: "cricket", status: "registration_open" });
      expect(prisma.tournament.findMany).toHaveBeenCalled();
    });
  });

  describe("getMyTournaments", () => {
    it("should return tournaments owned by user", async () => {
      prisma.tournament.findMany.mockResolvedValue([mockTournament()]);
      const service = new TournamentService();
      const result = await service.getMyTournaments(userId());
      expect(result).toHaveLength(1);
    });
  });

  describe("getTournamentById", () => {
    it("should return tournament detail", async () => {
      prisma.tournament.findUnique.mockResolvedValue(mockTournament());
      const service = new TournamentService();
      const result = await service.getTournamentById(tournamentId());
      expect(result.id).toBe(tournamentId());
    });

    it("should throw if not found", async () => {
      prisma.tournament.findUnique.mockResolvedValue(null);
      const service = new TournamentService();
      await expect(service.getTournamentById(tournamentId())).rejects.toThrow();
    });
  });

  describe("updateTournament", () => {
    it("should update tournament if owner", async () => {
      prisma.tournament.findUnique.mockResolvedValue(mockTournament());
      prisma.tournament.update.mockResolvedValue(mockTournament({ name: "Updated" }));
      const service = new TournamentService();
      const result = await service.updateTournament(tournamentId(), userId(), { name: "Updated" });
      expect(result.name).toBe("Updated");
    });

    it("should throw if not owner", async () => {
      prisma.tournament.findUnique.mockResolvedValue(mockTournament());
      const service = new TournamentService();
      await expect(service.updateTournament(tournamentId(), otherUserId(), {})).rejects.toThrow();
    });
  });

  describe("deleteTournament", () => {
    it("should delete tournament if owner", async () => {
      prisma.tournament.findUnique.mockResolvedValue(mockTournament());
      prisma.tournament.delete.mockResolvedValue(mockTournament());
      const service = new TournamentService();
      await expect(service.deleteTournament(tournamentId(), userId())).resolves.not.toThrow();
    });

    it("should throw if not owner", async () => {
      prisma.tournament.findUnique.mockResolvedValue(mockTournament());
      const service = new TournamentService();
      await expect(service.deleteTournament(tournamentId(), otherUserId())).rejects.toThrow();
    });
  });

  describe("registerTeam", () => {
    it("should register a team", async () => {
      prisma.tournament.findUnique.mockResolvedValue(mockTournament());
      prisma.tournamentTeam.count.mockResolvedValue(2);
      prisma.tournamentTeam.findUnique.mockResolvedValue(null);
      prisma.tournamentTeam.create.mockResolvedValue(mockTournamentTeam(tournamentId(), teamId1()));

      const service = new TournamentService();
      const result = await service.registerTeam(tournamentId(), otherUserId(), { teamId: teamId1() });
      expect(result.teamId).toBe(teamId1());
    });

    it("should throw if tournament not in registration_open", async () => {
      prisma.tournament.findUnique.mockResolvedValue(mockTournament({ status: "ongoing" }));
      const service = new TournamentService();
      await expect(service.registerTeam(tournamentId(), otherUserId(), { teamId: teamId1() })).rejects.toThrow();
    });

    it("should throw if team already registered", async () => {
      prisma.tournament.findUnique.mockResolvedValue(mockTournament());
      prisma.tournamentTeam.findUnique.mockResolvedValue(mockTournamentTeam(tournamentId(), teamId1()));
      const service = new TournamentService();
      await expect(service.registerTeam(tournamentId(), otherUserId(), { teamId: teamId1() })).rejects.toThrow();
    });

    it("should throw if tournament is full", async () => {
      prisma.tournament.findUnique.mockResolvedValue(mockTournament({ maxTeams: 4 }));
      prisma.tournamentTeam.count.mockResolvedValue(4);
      const service = new TournamentService();
      await expect(service.registerTeam(tournamentId(), otherUserId(), { teamId: teamId1() })).rejects.toThrow();
    });
  });

  describe("withdrawTeam", () => {
    it("should withdraw a team", async () => {
      prisma.tournament.findUnique.mockResolvedValue(mockTournament());
      prisma.tournamentTeam.findUnique.mockResolvedValue(mockTournamentTeam(tournamentId(), teamId1()));
      prisma.tournamentTeam.delete.mockResolvedValue(mockTournamentTeam(tournamentId(), teamId1()));

      const service = new TournamentService();
      const result = await service.withdrawTeam(tournamentId(), userId(), { teamId: teamId1() });
      expect(result.message).toBe("Team withdrawn");
    });

    it("should throw if tournament completed", async () => {
      prisma.tournament.findUnique.mockResolvedValue(mockTournament({ status: "completed" }));
      const service = new TournamentService();
      await expect(service.withdrawTeam(tournamentId(), userId(), { teamId: teamId1() })).rejects.toThrow();
    });
  });

  describe("getBracket", () => {
    it("should return bracket data", async () => {
      prisma.tournament.findUnique.mockResolvedValue(mockTournament({ status: "ongoing" }));
      prisma.tournamentMatch.findMany.mockResolvedValue([mockTournamentMatch()]);
      prisma.tournamentTeam.findMany.mockResolvedValue([mockTournamentTeam(tournamentId(), teamId1())]);

      const service = new TournamentService();
      const result = await service.getBracket(tournamentId());
      expect(result.format).toBe("knockout");
      expect(result.matches).toHaveLength(1);
    });

    it("should throw if tournament not found", async () => {
      prisma.tournament.findUnique.mockResolvedValue(null);
      const service = new TournamentService();
      await expect(service.getBracket(tournamentId())).rejects.toThrow();
    });
  });

  describe("getStandings", () => {
    it("should return standings", async () => {
      prisma.tournament.findUnique.mockResolvedValue(mockTournament());
      prisma.tournamentTeam.findMany.mockResolvedValue([mockTournamentTeam(tournamentId(), teamId1())]);

      const service = new TournamentService();
      const result = await service.getStandings(tournamentId());
      expect(result).toHaveLength(1);
    });
  });

  describe("enterMatchResult", () => {
    it("should record match result as owner", async () => {
      prisma.tournamentMatch.findUnique.mockResolvedValue(mockTournamentMatch());
      prisma.tournament.findUnique.mockResolvedValue(mockTournament());
      prisma.tournamentMatch.update.mockResolvedValue(mockTournamentMatch({ score1: 3, score2: 1, winnerId: teamId1(), status: "completed" }));

      const service = new TournamentService();
      const result = await service.enterMatchResult(tournamentId(), matchId(), userId(), { score1: 3, score2: 1 });
      expect(result.score1).toBe(3);
      expect(result.winnerId).toBe(teamId1());
    });

    it("should throw if not tournament owner", async () => {
      prisma.tournamentMatch.findUnique.mockResolvedValue(mockTournamentMatch());
      prisma.tournament.findUnique.mockResolvedValue(mockTournament());
      const service = new TournamentService();
      await expect(service.enterMatchResult(tournamentId(), matchId(), otherUserId(), { score1: 3, score2: 1 })).rejects.toThrow();
    });

    it("should throw if scores missing", async () => {
      prisma.tournamentMatch.findUnique.mockResolvedValue(mockTournamentMatch());
      prisma.tournament.findUnique.mockResolvedValue(mockTournament());
      const service = new TournamentService();
      await expect(service.enterMatchResult(tournamentId(), matchId(), userId(), {})).rejects.toThrow();
    });
  });

  describe("generateBracket", () => {
    it("should generate knockout bracket", async () => {
      const teams = [
        mockTournamentTeam(tournamentId(), teamId1(), { seed: 1, team: { id: teamId1(), name: "A", logo: null } }),
        mockTournamentTeam(tournamentId(), teamId2(), { seed: 2, team: { id: teamId2(), name: "B", logo: null } }),
        mockTournamentTeam(tournamentId(), teamId3(), { seed: 3, team: { id: teamId3(), name: "C", logo: null } }),
        mockTournamentTeam(tournamentId(), teamId4(), { seed: 4, team: { id: teamId4(), name: "D", logo: null } }),
      ];

      prisma.tournament.findUnique.mockResolvedValue(mockTournament({ format: "knockout", status: "registration_open" }));
      prisma.tournamentTeam.findMany.mockResolvedValue(teams);
      prisma.tournamentMatch.createMany.mockResolvedValue({ count: 7 });
      prisma.tournament.update.mockResolvedValue(mockTournament({ format: "knockout", status: "ongoing" }));

      const service = new TournamentService();
      const result = await service.generateBracket(tournamentId(), userId());
      expect(result.message).toBe("Bracket generated");
    });

    it("should generate round robin", async () => {
      const teams = [
        mockTournamentTeam(tournamentId(), teamId1(), { team: { id: teamId1(), name: "A", logo: null } }),
        mockTournamentTeam(tournamentId(), teamId2(), { team: { id: teamId2(), name: "B", logo: null } }),
        mockTournamentTeam(tournamentId(), teamId3(), { team: { id: teamId3(), name: "C", logo: null } }),
      ];

      prisma.tournament.findUnique.mockResolvedValue(mockTournament({ format: "round_robin", status: "registration_open", minTeams: 3 }));
      prisma.tournamentTeam.findMany.mockResolvedValue(teams);
      prisma.tournamentMatch.createMany.mockResolvedValue({ count: 3 });
      prisma.tournament.update.mockResolvedValue(mockTournament({ format: "round_robin", status: "ongoing" }));

      const service = new TournamentService();
      const result = await service.generateBracket(tournamentId(), userId());
      expect(result.message).toBe("Bracket generated");
    });

    it("should generate group+knockout", async () => {
      const teams = [
        mockTournamentTeam(tournamentId(), teamId1(), { group: "A", team: { id: teamId1(), name: "A", logo: null } }),
        mockTournamentTeam(tournamentId(), teamId2(), { group: "A", team: { id: teamId2(), name: "B", logo: null } }),
        mockTournamentTeam(tournamentId(), teamId3(), { group: "B", team: { id: teamId3(), name: "C", logo: null } }),
        mockTournamentTeam(tournamentId(), teamId4(), { group: "B", team: { id: teamId4(), name: "D", logo: null } }),
      ];

      prisma.tournament.findUnique.mockResolvedValue(mockTournament({ format: "group_knockout", status: "registration_open" }));
      prisma.tournamentTeam.findMany.mockResolvedValue(teams);
      prisma.tournamentMatch.createMany.mockResolvedValue({ count: 4 });
      prisma.tournament.update.mockResolvedValue(mockTournament({ format: "group_knockout", status: "ongoing" }));

      const service = new TournamentService();
      const result = await service.generateBracket(tournamentId(), userId());
      expect(result.message).toBe("Bracket generated");
    });

    it("should throw if not enough teams", async () => {
      prisma.tournament.findUnique.mockResolvedValue(mockTournament({ minTeams: 4 }));
      prisma.tournamentTeam.findMany.mockResolvedValue([mockTournamentTeam(tournamentId(), teamId1())]);
      const service = new TournamentService();
      await expect(service.generateBracket(tournamentId(), userId())).rejects.toThrow();
    });

    it("should throw if not owner", async () => {
      prisma.tournament.findUnique.mockResolvedValue(mockTournament());
      const service = new TournamentService();
      await expect(service.generateBracket(tournamentId(), otherUserId())).rejects.toThrow();
    });
  });
});
