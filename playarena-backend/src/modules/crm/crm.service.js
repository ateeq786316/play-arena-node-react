import CrmRepo from "../../repository/crm.repo.js";
import GroundRepo from "../../repository/ground.repo.js";
import * as error from "../../shared/error/globalError.js";

export default class CrmService {
  constructor() {
    this.repo = new CrmRepo();
    this.groundRepo = new GroundRepo();
  }

  async createBroadcast(userId, data) {
    const { groundId, title, message, audience, scheduledAt } = data;
    await this._checkOwnerAccess(groundId, userId);
    if (!title || !message) throw new error.NOTFOUNDERROR("title and message are required");
    return await this.repo.createBroadcast({
      groundId,
      title,
      message,
      audience: audience || null,
      status: scheduledAt ? "scheduled" : "draft",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    });
  }

  async getBroadcasts(groundId, userId) {
    await this._checkOwnerAccess(groundId, userId);
    return await this.repo.findBroadcastsByGround(groundId);
  }

  async getBroadcastById(id, userId) {
    const broadcast = await this.repo.findBroadcastById(id);
    if (!broadcast) throw new error.NOTFOUNDERROR("Broadcast not found");
    await this._checkOwnerAccess(broadcast.groundId, userId);
    return broadcast;
  }

  async sendBroadcast(id, userId) {
    const broadcast = await this.repo.findBroadcastById(id);
    if (!broadcast) throw new error.NOTFOUNDERROR("Broadcast not found");
    await this._checkOwnerAccess(broadcast.groundId, userId);
    if (broadcast.status === "sent") throw new error.UNAUTHORIZED("Already sent");
    return await this.repo.updateBroadcast(id, {
      status: "sent",
      sentAt: new Date(),
    });
  }

  async getPreferences(userId) {
    const pref = await this.repo.findPreferenceByUser(userId);
    return pref || { emailEnabled: true, smsEnabled: false, marketing: true, bookingUpdates: true };
  }

  async updatePreferences(userId, data) {
    return await this.repo.upsertPreference(userId, data);
  }

  async _checkOwnerAccess(groundId, userId) {
    const ground = await this.groundRepo.findById(groundId);
    if (!ground) throw new error.NOTFOUNDERROR("Ground not found");
    if (ground.ownerId !== userId) {
      const access = await this.groundRepo.findAccess(groundId, userId);
      if (!access) throw new error.UNAUTHORIZED("Not authorized");
    }
  }
}
