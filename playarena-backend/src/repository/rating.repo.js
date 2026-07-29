import prisma from "../database/db.js";

export default class RatingRepo {
  async findTeamMatchById(id) {
    return await prisma.teamMatch.findUnique({ where: { id } });
  }

  async findMatchRating(matchId, reviewerId) {
    return await prisma.matchRating.findUnique({
      where: { matchId_reviewerId: { matchId, reviewerId } },
    });
  }

  async createMatchRating(data) {
    return await prisma.matchRating.create({ data });
  }

  async findTeamsBySport(sport) {
    return await prisma.team.findMany({
      where: { sport, deletedAt: null },
      orderBy: { elo: "desc" },
      select: { id: true, name: true, elo: true, sport: true, logo: true },
    });
  }

  async findAllTeams() {
    return await prisma.team.findMany({
      where: { deletedAt: null },
      orderBy: { elo: "desc" },
      select: { id: true, name: true, elo: true, sport: true, logo: true },
    });
  }

  async findPlayerStat(userId) {
    return await prisma.playerStat.findUnique({
      where: { userId },
    });
  }

  async upsertPlayerStat(userId, data) {
    return await prisma.playerStat.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  async createPlayerMatchStat(data) {
    return await prisma.playerMatchStat.create({ data });
  }

  async findPlayerMatchStat(matchId, playerId) {
    return await prisma.playerMatchStat.findUnique({
      where: { matchId_playerId: { matchId, playerId } },
    });
  }

  async findTeamMember(teamId, userId) {
    return await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
  }
}
