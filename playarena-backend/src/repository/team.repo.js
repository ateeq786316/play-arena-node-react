import prisma from "../database/db.js";

export default class TeamRepo {
  async create(data) {
    return await prisma.team.create({ data });
  }

  async findById(id) {
    return await prisma.team.findUnique({
      where: { id, deletedAt: null },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
          orderBy: { joinedAt: "asc" },
        },
        _count: { select: { members: true } },
      },
    });
  }

  async findAll(filters = {}) {
    const where = { deletedAt: null, ...filters };
    return await prisma.team.findMany({
      where,
      include: {
        _count: { select: { members: true } },
        captain: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByPlayerId(userId) {
    return await prisma.team.findMany({
      where: {
        deletedAt: null,
        members: { some: { userId } },
      },
      include: {
        _count: { select: { members: true } },
        captain: { select: { id: true, name: true } },
      },
    });
  }

  async update(id, data) {
    return await prisma.team.update({ where: { id }, data });
  }

  async softDelete(id) {
    return await prisma.team.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findMember(teamId, userId) {
    return await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
  }

  async addMember(data) {
    return await prisma.teamMember.create({ data });
  }

  async updateMember(teamId, userId, data) {
    return await prisma.teamMember.update({
      where: { teamId_userId: { teamId, userId } },
      data,
    });
  }

  async removeMember(teamId, userId) {
    return await prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId } },
    });
  }

  async findInvite(teamId, userId) {
    return await prisma.teamInvite.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
  }

  async createInvite(data) {
    return await prisma.teamInvite.create({ data });
  }

  async updateInvite(teamId, userId, data) {
    return await prisma.teamInvite.update({
      where: { teamId_userId: { teamId, userId } },
      data,
    });
  }

  async findJoinRequest(teamId, userId) {
    return await prisma.joinRequest.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
  }

  async createJoinRequest(data) {
    return await prisma.joinRequest.create({ data });
  }

  async updateJoinRequest(teamId, userId, data) {
    return await prisma.joinRequest.update({
      where: { teamId_userId: { teamId, userId } },
      data,
    });
  }

  async findJoinRequestsByTeam(teamId) {
    return await prisma.joinRequest.findMany({
      where: { teamId, status: "pending" },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });
  }

  async createRatingHistory(data) {
    return await prisma.teamRatingHistory.create({ data });
  }

  async findRatingHistory(teamId) {
    return await prisma.teamRatingHistory.findMany({
      where: { teamId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findSportCategories() {
    return await prisma.sportCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }
}
