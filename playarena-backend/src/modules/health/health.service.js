import prisma from "../../database/db.js";

export default class HealthService {
  async check() {
    const start = Date.now();
    let dbStatus = "up";
    let latencyMs = null;

    try {
      await prisma.$queryRaw`SELECT 1`;
      latencyMs = Date.now() - start;
    } catch {
      dbStatus = "down";
      latencyMs = null;
    }

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        database: { status: dbStatus, latencyMs },
      },
    };
  }
}
