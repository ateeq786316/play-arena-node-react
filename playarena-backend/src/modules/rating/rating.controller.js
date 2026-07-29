import RatingService from "./rating.service.js";

export default class RatingController {
  constructor() {
    this.service = new RatingService();
  }

  async submitRating(req, res) {
    const rating = await this.service.submitRating(req.params.id, req.userId, req.body);
    res.status(201).json({ message: "Rating submitted", rating });
  }

  async getLeaderboard(req, res) {
    const teams = await this.service.getLeaderboard(req.params.sportId);
    res.status(200).json({ teams });
  }

  async getPlayerStats(req, res) {
    const stats = await this.service.getPlayerStats(req.params.id);
    res.status(200).json({ stats });
  }

  async recordPlayerStats(req, res) {
    const result = await this.service.recordPlayerStats(req.params.id, req.userId, req.body);
    res.status(200).json(result);
  }
}
