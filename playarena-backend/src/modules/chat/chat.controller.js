import ChatService from "./chat.service.js";

export default class ChatController {
  constructor() {
    this.service = new ChatService();
  }

  async getMessages(req, res) {
    const { cursor } = req.query;
    const result = await this.service.getMessages(req.params.id, req.userId, cursor);
    res.status(200).json(result);
  }

  async sendMessage(req, res) {
    const message = await this.service.sendMessage(req.params.id, req.userId, req.body.content);
    res.status(201).json({ message: "Message sent", data: message });
  }

  async markAsRead(req, res) {
    const result = await this.service.markAsRead(req.params.id, req.userId);
    res.status(200).json(result);
  }

  async getUnreadCounts(req, res) {
    const counts = await this.service.getUnreadCounts(req.userId);
    res.status(200).json({ unreadCounts: counts });
  }
}
