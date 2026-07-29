import HealthService from "./health.service.js";

const healthService = new HealthService();

export async function checkHealth(req, res) {
  const result = await healthService.check();
  const httpStatus = result.services.database.status === "up" ? 200 : 503;
  res.status(httpStatus).json(result);
}
