import prisma from "../database/db.js";

export default class MatchRepo {
  async createRequest(data) {
    return await prisma.matchRequest.create({ data });
  }

  async findRequestById(id) {
    return await prisma.matchRequest.findUnique({
      where: { id },
      include: {
        challenger: { select: { id: true, name: true, elo: true } },
        opponent: { select: { id: true, name: true, elo: true } },
      },
    });
  }

  async findSentRequests(teamId) {
    return await prisma.matchRequest.findMany({
      where: { challengerTeamId: teamId },
      include: { opponent: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findReceivedRequests(teamId) {
    return await prisma.matchRequest.findMany({
      where: { opponentTeamId: teamId },
      include: { challenger: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateRequest(id, data) {
    return await prisma.matchRequest.update({ where: { id }, data });
  }

  async createMatch(data) {
    return await prisma.teamMatch.create({ data });
  }

  async findMatchById(id) {
    return await prisma.teamMatch.findUnique({
      where: { id },
      include: {
        challenger: { select: { id: true, name: true, elo: true } },
        opponent: { select: { id: true, name: true, elo: true } },
      },
    });
  }

  async findMatches(teamId) {
    return await prisma.teamMatch.findMany({
      where: {
        OR: [{ challengerTeamId: teamId }, { opponentTeamId: teamId }],
      },
      include: {
        challenger: { select: { id: true, name: true } },
        opponent: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateMatch(id, data) {
    return await prisma.teamMatch.update({ where: { id }, data });
  }

  async findTeamById(id) {
    return await prisma.team.findUnique({ where: { id } });
  }

  async updateTeamElo(teamId, elo) {
    return await prisma.team.update({ where: { id: teamId }, data: { elo } });
  }

  async countTeamMatches(teamId) {
    return await prisma.teamMatch.count({
      where: {
        status: "completed",
        OR: [{ challengerTeamId: teamId }, { opponentTeamId: teamId }],
      },
    });
  }
}
