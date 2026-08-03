import cron from "node-cron";
import logger from "../config/logger.js";
import AnalyticsService from "../modules/analytics/analytics.service.js";

const CRON_EXPRESSION = "30 0 * * *";
const TIMEZONE = "Asia/Karachi";

export function startAnalyticsAggregationJob() {
  const service = new AnalyticsService();
  cron.schedule(CRON_EXPRESSION, async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    logger.info({ date: yesterday.toISOString().slice(0, 10) }, "Running daily analytics aggregation");
    try {
      const results = await service.aggregateDay(yesterday);
      logger.info({ grounds: results.length }, "Analytics aggregation completed");
    } catch (error) {
      logger.error({ error: error.message }, "Analytics aggregation failed");
    }
  }, { timezone: TIMEZONE });
  logger.info({ expression: CRON_EXPRESSION, timezone: TIMEZONE }, "Analytics aggregation job scheduled");
}
