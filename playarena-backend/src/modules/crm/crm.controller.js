import CrmService from "./crm.service.js";

export default class CrmController {
  constructor() {
    this.service = new CrmService();
  }

  async createBroadcast(req, res) {
    const result = await this.service.createBroadcast(req.userId, req.body);
    res.status(201).json({ message: "Broadcast created", broadcast: result });
  }

  async getBroadcasts(req, res) {
    const broadcasts = await this.service.getBroadcasts(req.params.groundId, req.userId);
    res.status(200).json({ broadcasts });
  }

  async getBroadcastById(req, res) {
    const broadcast = await this.service.getBroadcastById(req.params.id, req.userId);
    res.status(200).json({ broadcast });
  }

  async sendBroadcast(req, res) {
    const broadcast = await this.service.sendBroadcast(req.params.id, req.userId);
    res.status(200).json({ message: "Broadcast sent", broadcast });
  }

  async getPreferences(req, res) {
    const preferences = await this.service.getPreferences(req.userId);
    res.status(200).json({ preferences });
  }

  async updatePreferences(req, res) {
    const preferences = await this.service.updatePreferences(req.userId, req.body);
    res.status(200).json({ message: "Preferences updated", preferences });
  }
}
