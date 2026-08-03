import GeoRepo from "../../repository/geo.repo.js";
import GroundRepo from "../../repository/ground.repo.js";

export default class GeoService {
  constructor() {
    this.repo = new GeoRepo();
    this.groundRepo = new GroundRepo();
  }

  async searchNearby(data) {
    const { latitude, longitude, radius = 10, sport, page = 1, limit = 20 } = data;
    if (latitude == null || longitude == null) throw new Error("latitude and longitude are required");
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusKm = parseFloat(radius);
    const skip = (page - 1) * limit;

    const results = sport
      ? await this.repo.findNearbyWithSport(lat, lng, radiusKm, sport)
      : await this.repo.findNearby(lat, lng, radiusKm);

    const total = results.length;
    const paginatedResults = results.slice(skip, skip + limit);

    // Enrich with court info
    const enriched = await Promise.all(
      paginatedResults.map(async (g) => {
        const courts = await this.groundRepo.findCourtsByGround(g.id);
        return { ...g, courts, distance_km: parseFloat(g.distance_km).toFixed(2) };
      })
    );

    return {
      grounds: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      center: { latitude: lat, longitude: lng },
    };
  }
}
