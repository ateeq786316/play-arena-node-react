import NotificationService from "./notification.service.js";

export default class NotificationController {
  constructor() {
    this.service = new NotificationService();
  }

  async getNotifications(req, res) {
    const result = await this.service.getNotifications(req.userId, req.query);
    res.status(200).json(result);
  }

  async getUnreadCount(req, res) {
    const result = await this.service.getUnreadCount(req.userId);
    res.status(200).json(result);
  }

  async markAsRead(req, res) {
    const result = await this.service.markAsRead(req.userId, req.params.id);
    res.status(200).json(result);
  }

  async markAllAsRead(req, res) {
    const result = await this.service.markAllAsRead(req.userId);
    res.status(200).json(result);
  }

  async deleteNotification(req, res) {
    const result = await this.service.deleteNotification(req.userId, req.params.id);
    res.status(200).json(result);
  }
}
