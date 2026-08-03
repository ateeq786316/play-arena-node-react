import prisma from "../database/db.js";

export default class CrmRepo {
  async createBroadcast(data) {
    return await prisma.broadcastMessage.create({ data });
  }

  async findBroadcastsByGround(groundId) {
    return await prisma.broadcastMessage.findMany({
      where: { groundId },
      orderBy: { createdAt: "desc" },
      include: { logs: true },
    });
  }

  async findBroadcastById(id) {
    return await prisma.broadcastMessage.findUnique({
      where: { id },
      include: { logs: { orderBy: { createdAt: "desc" } } },
    });
  }

  async updateBroadcast(id, data) {
    return await prisma.broadcastMessage.update({ where: { id }, data });
  }

  async createLog(data) {
    return await prisma.communicationLog.create({ data });
  }

  async updateLog(broadcastId, userId, data) {
    return await prisma.communicationLog.update({
      where: { broadcastId_userId: { broadcastId, userId } },
      data,
    });
  }

  async findPreferenceByUser(userId) {
    return await prisma.userCommunicationPreference.findUnique({ where: { userId } });
  }

  async upsertPreference(userId, data) {
    return await prisma.userCommunicationPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}
