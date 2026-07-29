import ChatRepo from "../../repository/chat.repo.js";
import * as error from "../../shared/error/globalError.js";

export default class ChatService {
  constructor() {
    this.repo = new ChatRepo();
  }

  async _checkAccess(groundId, userId) {
    const ground = await this.repo.findGroundById(groundId);
    if (!ground) throw new error.NOTFOUNDERROR("Ground not found");
    if (ground.ownerId === userId) return true;

    const access = await this.repo.findGroundAccess(groundId, userId);
    if (!access) throw new error.UNAUTHORIZED("Access denied to this ground");
    return true;
  }

  async getMessages(groundId, userId, cursor) {
    await this._checkAccess(groundId, userId);
    const messages = await this.repo.findMessages(groundId, cursor);

    const hasMore = messages.length > 50;
    if (hasMore) messages.pop();

    return {
      messages,
      meta: {
        hasMore,
        nextCursor: hasMore && messages.length > 0 ? messages[messages.length - 1].createdAt.toISOString() : null,
      },
    };
  }

  async sendMessage(groundId, userId, content) {
    if (!content || content.trim().length === 0 || content.length > 2000) {
      throw new error.NOTFOUNDERROR("Message must be 1-2000 characters");
    }

    await this._checkAccess(groundId, userId);
    await this.repo.upsertParticipant(groundId, userId, { lastReadAt: new Date() });

    const message = await this.repo.createMessage({ groundId, senderId: userId, content: content.trim() });

    await this.repo.incrementUnread(groundId);

    return message;
  }

  async markAsRead(groundId, userId) {
    await this._checkAccess(groundId, userId);
    await this.repo.resetUnread(groundId, userId);
    await this.repo.upsertParticipant(groundId, userId, { lastReadAt: new Date() });
    return { message: "Marked as read" };
  }

  async getUnreadCounts(userId) {
    const counts = await this.repo.getUnreadCountsForUser(userId);
    return counts.map((c) => ({ groundId: c.groundId, count: c.count }));
  }
}
