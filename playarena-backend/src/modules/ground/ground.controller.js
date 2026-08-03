import GroundService from "./ground.service.js";

export default class GroundController {
  constructor() {
    this.service = new GroundService();
  }

  async createGround(req, res) {
    const ground = await this.service.createGround(req.userId, req.body);
    res.status(201).json({ message: "Ground created", ground });
  }

  async getGroundById(req, res) {
    const ground = await this.service.getGroundById(req.params.id);
    res.status(200).json({ ground });
  }

  async listGrounds(req, res) {
    const filters = {};
    if (req.query.city) filters.city = req.query.city;
    if (req.query.isVerified) filters.isVerified = req.query.isVerified === "true";
    const grounds = await this.service.listGrounds(filters);
    res.status(200).json({ grounds });
  }

  async listFeaturedGrounds(req, res) {
    const grounds = await this.service.listFeaturedGrounds();
    res.status(200).json({ grounds });
  }

  async listMyGrounds(req, res) {
    const grounds = await this.service.listMyGrounds(req.userId);
    res.status(200).json({ grounds });
  }

  async updateGround(req, res) {
    const ground = await this.service.updateGround(req.params.id, req.userId, req.body);
    res.status(200).json({ message: "Ground updated", ground });
  }

  async deleteGround(req, res) {
    await this.service.deleteGround(req.params.id, req.userId);
    res.status(200).json({ message: "Ground deleted" });
  }

  async createCourt(req, res) {
    const court = await this.service.createCourt(req.params.groundId, req.userId, req.body);
    res.status(201).json({ message: "Court created", court });
  }

  async listCourts(req, res) {
    const courts = await this.service.listCourts(req.params.groundId);
    res.status(200).json({ courts });
  }

  async updateCourt(req, res) {
    const court = await this.service.updateCourt(req.params.id, req.userId, req.body);
    res.status(200).json({ message: "Court updated", court });
  }

  async deleteCourt(req, res) {
    await this.service.deleteCourt(req.params.id, req.userId);
    res.status(200).json({ message: "Court deleted" });
  }

  async upsertSchedule(req, res) {
    const schedule = await this.service.upsertSchedule(
      req.params.groundId,
      req.userId,
      parseInt(req.params.dayOfWeek),
      req.body,
    );
    res.status(200).json({ message: "Schedule updated", schedule });
  }

  async listSchedules(req, res) {
    const schedules = await this.service.listSchedules(req.params.groundId);
    res.status(200).json({ schedules });
  }

  async deleteSchedule(req, res) {
    await this.service.deleteSchedule(req.params.groundId, req.userId, parseInt(req.params.dayOfWeek));
    res.status(200).json({ message: "Schedule removed" });
  }

  async updateSetting(req, res) {
    const setting = await this.service.updateSetting(req.params.groundId, req.userId, req.body);
    res.status(200).json({ message: "Settings updated", setting });
  }

  async listRegions(req, res) {
    const regions = await this.service.listRegions();
    res.status(200).json({ regions });
  }

  async addImage(req, res) {
    const image = await this.service.addImage(req.params.groundId, req.userId, req.body);
    res.status(201).json({ message: "Image added", image });
  }

  async removeImage(req, res) {
    await this.service.removeImage(req.params.imageId, req.params.groundId, req.userId);
    res.status(200).json({ message: "Image removed" });
  }

  async inviteStaff(req, res) {
    const invite = await this.service.inviteStaff(req.params.groundId, req.userId, req.body);
    res.status(201).json({ message: "Staff invite sent", invite });
  }
}
