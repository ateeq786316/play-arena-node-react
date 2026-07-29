import prisma from "../database/db.js";

export default class NotificationRepo {
  async findNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { userId, deletedAt: null };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async countUnread(userId) {
    return await prisma.notification.count({
      where: { userId, readAt: null, deletedAt: null },
    });
  }

  async markAsRead(id, userId) {
    return await prisma.notification.updateMany({
      where: { id, userId, deletedAt: null },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId) {
    return await prisma.notification.updateMany({
      where: { userId, readAt: null, deletedAt: null },
      data: { readAt: new Date() },
    });
  }

  async softDelete(id, userId) {
    return await prisma.notification.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  async create(data) {
    return await prisma.notification.create({ data });
  }
}
