import createApp from "./src/app.js";
import { connectDB } from "./src/database/db.js";
import logger from "./src/config/logger.js";
import env from "./src/config/env.js";
import { startAnalyticsAggregationJob } from "./src/jobs/analytics-aggregation.job.js";

process.on("uncaughtException", (error) => {
  logger.error({ error: error.message, stack: error.stack }, "Uncaught exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error({ error: reason }, "Unhandled rejection");
});

(async function startServer() {
  await connectDB();
  startAnalyticsAggregationJob();
  const httpServer = createApp();
  httpServer.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Server is running");
  });
  httpServer.on("error", (error) => {
    logger.error({ error: error.message }, "Server error");
  });
})().catch((error) => {
  logger.error({ error }, "Failed to start server");
  process.exit(1);
});
