import prisma from "../database/db.js";

export default class ChatRepo {
  async findMessages(groundId, cursor, limit = 50) {
    const where = { groundId, deletedAt: null };
    if (cursor) where.createdAt = { lt: new Date(cursor) };

    return await prisma.chatMessage.findMany({
      where,
      include: { sender: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
    });
  }

  async createMessage(data) {
    return await prisma.chatMessage.create({
      data,
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async findParticipant(groundId, userId) {
    return await prisma.chatParticipant.findUnique({
      where: { groundId_userId: { groundId, userId } },
    });
  }

  async upsertParticipant(groundId, userId, data) {
    return await prisma.chatParticipant.upsert({
      where: { groundId_userId: { groundId, userId } },
      update: data,
      create: { groundId, userId, ...data },
    });
  }

  async getUnreadCount(groundId, userId) {
    const record = await prisma.unreadCount.findUnique({
      where: { groundId_userId: { groundId, userId } },
    });
    return record ? record.count : 0;
  }

  async getUnreadCountsForUser(userId) {
    return await prisma.unreadCount.findMany({
      where: { userId },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async incrementUnread(groundId) {
    const participants = await prisma.chatParticipant.findMany({
      where: { groundId },
    });
    for (const p of participants) {
      await prisma.unreadCount.upsert({
        where: { groundId_userId: { groundId, userId: p.userId } },
        update: { count: { increment: 1 } },
        create: { groundId, userId: p.userId, count: 1 },
      });
    }
  }

  async resetUnread(groundId, userId) {
    return await prisma.unreadCount.upsert({
      where: { groundId_userId: { groundId, userId } },
      update: { count: 0 },
      create: { groundId, userId, count: 0 },
    });
  }

  async findGroundAccess(groundId, userId) {
    return await prisma.groundAccess.findUnique({
      where: { groundId_userId: { groundId, userId } },
    });
  }

  async findGroundById(groundId) {
    return await prisma.ground.findUnique({
      where: { id: groundId, deletedAt: null },
    });
  }
}
