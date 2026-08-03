import prisma from "../database/db.js";

export default class GeoRepo {
  async findNearby(lat, lng, radiusKm, sportFilter) {
    // Haversine-based distance query using raw SQL for PostgreSQL
    const query = `
      SELECT g.*, 
        (6371 * acos(cos(radians($1)) * cos(radians(g.latitude)) * cos(radians(g.longitude) - radians($2)) + sin(radians($1)) * sin(radians(g.latitude)))) AS distance_km
      FROM grounds g
      WHERE g.is_active = true AND g.deleted_at IS NULL AND g.latitude IS NOT NULL AND g.longitude IS NOT NULL
        AND (6371 * acos(cos(radians($1)) * cos(radians(g.latitude)) * cos(radians(g.longitude) - radians($2)) + sin(radians($1)) * sin(radians(g.latitude)))) <= $3
      ORDER BY distance_km ASC
    `;
    const params = [lat, lng, radiusKm];
    const grounds = await prisma.$queryRawUnsafe(query, ...params);
    return grounds;
  }

  async findNearbyWithSport(lat, lng, radiusKm, sport) {
    const query = `
      SELECT DISTINCT g.*,
        (6371 * acos(cos(radians($1)) * cos(radians(g.latitude)) * cos(radians(g.longitude) - radians($2)) + sin(radians($1)) * sin(radians(g.latitude)))) AS distance_km
      FROM grounds g
      INNER JOIN courts c ON c.ground_id = g.id
      WHERE g.is_active = true AND g.deleted_at IS NULL AND g.latitude IS NOT NULL AND g.longitude IS NOT NULL
        AND c.sport_type = $4 AND c.is_active = true
        AND (6371 * acos(cos(radians($1)) * cos(radians(g.latitude)) * cos(radians(g.longitude) - radians($2)) + sin(radians($1)) * sin(radians(g.latitude)))) <= $3
      ORDER BY distance_km ASC
    `;
    const params = [lat, lng, radiusKm, sport];
    const grounds = await prisma.$queryRawUnsafe(query, ...params);
    return grounds;
  }
}
