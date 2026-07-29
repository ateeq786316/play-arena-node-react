import NotificationRepo from "../../repository/notification.repo.js";
import * as error from "../../shared/error/globalError.js";
import { getNotificationNamespace } from "../../socket/socket.js";

export default class NotificationService {
  constructor() {
    this.repo = new NotificationRepo();
  }

  async getNotifications(userId, query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 20));
    return await this.repo.findNotifications(userId, page, limit);
  }

  async getUnreadCount(userId) {
    const count = await this.repo.countUnread(userId);
    return { count };
  }

  async markAsRead(userId, notificationId) {
    const result = await this.repo.markAsRead(notificationId, userId);
    if (result.count === 0) throw new error.NOTFOUNDERROR("Notification not found");
    return { message: "Marked as read" };
  }

  async markAllAsRead(userId) {
    await this.repo.markAllAsRead(userId);
    return { message: "All notifications marked as read" };
  }

  async deleteNotification(userId, notificationId) {
    const result = await this.repo.softDelete(notificationId, userId);
    if (result.count === 0) throw new error.NOTFOUNDERROR("Notification not found");
    return { message: "Notification deleted" };
  }

  async createNotification(data) {
    const notification = await this.repo.create(data);

    const io = getNotificationNamespace();
    if (io) {
      io.to(`user:${data.userId}`).emit("newNotification", notification);
    }

    return notification;
  }
}
