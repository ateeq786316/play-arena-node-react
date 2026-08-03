import { Router } from "express";
import { query } from "express-validator";
import AnalyticsController from "./analytics.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import validRequest from "../../utils/validRequest.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import requireAdmin from "../../middlewares/requireAdmin.middleware.js";
import { requirePlan } from "../../middlewares/plan.middleware.js";

const analyticsRoutes = Router();
const controller = new AnalyticsController();

const platformExpiringRules = [
  query("days").optional().isInt({ min: 1 }).withMessage("days must be a positive integer"),
];

analyticsRoutes.get(
  "/platform/summary",
  authMiddleware,
  requireAdmin,
  asyncHandler(controller.getPlatformSummary.bind(controller)),
);
analyticsRoutes.get(
  "/platform/expiring",
  authMiddleware,
  requireAdmin,
  platformExpiringRules,
  validRequest,
  asyncHandler(controller.getPlatformExpiring.bind(controller)),
);
analyticsRoutes.get(
  "/platform/trends",
  authMiddleware,
  requireAdmin,
  asyncHandler(controller.getPlatformTrends.bind(controller)),
);

analyticsRoutes.get("/:groundId/dashboard", authMiddleware, requirePlan("analytics"), asyncHandler(controller.getDashboard.bind(controller)));
analyticsRoutes.get("/:groundId/heatmap", authMiddleware, requirePlan("analytics"), asyncHandler(controller.getHeatmap.bind(controller)));
analyticsRoutes.get("/:groundId/report", authMiddleware, requirePlan("analytics"), asyncHandler(controller.generateReport.bind(controller)));

export default analyticsRoutes;
