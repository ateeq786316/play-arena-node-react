import prisma from "../database/db.js";

export default class TournamentRepo {
  async create(data) {
    return await prisma.tournament.create({ data });
  }

  async findById(id) {
    return await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: {
          include: { team: { select: { id: true, name: true, logo: true } } },
          orderBy: { seed: "asc" },
        },
        _count: { select: { teams: true, matches: true } },
      },
    });
  }

  async findAll(filters = {}) {
    return await prisma.tournament.findMany({
      where: filters,
      include: {
        _count: { select: { teams: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByOwnerId(ownerId) {
    return await prisma.tournament.findMany({
      where: { ownerId },
      include: { _count: { select: { teams: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id, data) {
    return await prisma.tournament.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.tournament.delete({ where: { id } });
  }

  async registerTeam(data) {
    return await prisma.tournamentTeam.create({ data });
  }

  async findTournamentTeam(tournamentId, teamId) {
    return await prisma.tournamentTeam.findUnique({
      where: { tournamentId_teamId: { tournamentId, teamId } },
    });
  }

  async removeTournamentTeam(tournamentId, teamId) {
    return await prisma.tournamentTeam.delete({
      where: { tournamentId_teamId: { tournamentId, teamId } },
    });
  }

  async getTeamsByTournament(tournamentId) {
    return await prisma.tournamentTeam.findMany({
      where: { tournamentId },
      include: { team: { select: { id: true, name: true, logo: true } } },
      orderBy: [{ group: "asc" }, { seed: "asc" }],
    });
  }

  async updateTournamentTeam(tournamentId, teamId, data) {
    return await prisma.tournamentTeam.update({
      where: { tournamentId_teamId: { tournamentId, teamId } },
      data,
    });
  }

  async createMatch(data) {
    return await prisma.tournamentMatch.create({ data });
  }

  async createManyMatches(data) {
    return await prisma.tournamentMatch.createMany({ data });
  }

  async findMatchById(id) {
    return await prisma.tournamentMatch.findUnique({
      where: { id },
      include: {
        tournament: { select: { id: true, format: true, status: true } },
      },
    });
  }

  async findMatchesByTournament(tournamentId) {
    return await prisma.tournamentMatch.findMany({
      where: { tournamentId },
      orderBy: [{ round: "asc" }, { matchIndex: "asc" }],
    });
  }

  async findMatchesByRound(tournamentId, round) {
    return await prisma.tournamentMatch.findMany({
      where: { tournamentId, round },
      orderBy: { matchIndex: "asc" },
    });
  }

  async updateMatch(id, data) {
    return await prisma.tournamentMatch.update({ where: { id }, data });
  }

  async countTeams(tournamentId) {
    return await prisma.tournamentTeam.count({ where: { tournamentId } });
  }

  async getStandings(tournamentId) {
    return await prisma.tournamentTeam.findMany({
      where: { tournamentId },
      include: { team: { select: { id: true, name: true, logo: true } } },
      orderBy: [{ points: "desc" }, { goalsFor: "desc" }, { goalsAgainst: "asc" }],
    });
  }
}
