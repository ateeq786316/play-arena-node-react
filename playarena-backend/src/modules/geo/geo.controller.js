import GeoService from "./geo.service.js";

export default class GeoController {
  constructor() {
    this.service = new GeoService();
  }

  async searchNearby(req, res) {
    const result = await this.service.searchNearby(req.query);
    res.status(200).json(result);
  }
}
