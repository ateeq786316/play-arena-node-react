import { Router } from "express";
import { body, param, query } from "express-validator";
import SubscriptionController from "./subscription.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import validRequest from "../../utils/validRequest.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import requireAdmin from "../../middlewares/requireAdmin.middleware.js";
import { requirePlan } from "../../middlewares/plan.middleware.js";

const subscriptionRoutes = Router();
const controller = new SubscriptionController();

const planIdRule = () => body("planId")
  .trim()
  .notEmpty()
  .withMessage("planId is required")
  .isUUID()
  .withMessage("planId must be a valid UUID");

subscriptionRoutes.get("/plans", asyncHandler(controller.listPlans.bind(controller)));
subscriptionRoutes.get("/my", authMiddleware, asyncHandler(controller.mySubscription.bind(controller)));
subscriptionRoutes.post("/upgrade", authMiddleware, planIdRule(), validRequest, asyncHandler(controller.upgrade.bind(controller)));
subscriptionRoutes.post("/downgrade", authMiddleware, planIdRule(), validRequest, asyncHandler(controller.downgrade.bind(controller)));
subscriptionRoutes.post("/cancel", authMiddleware, requirePlan(), asyncHandler(controller.cancel.bind(controller)));
subscriptionRoutes.get("/invoices", authMiddleware, asyncHandler(controller.getInvoices.bind(controller)));

const adminSubscriptionRoutes = Router();

adminSubscriptionRoutes.post(
  "/:id/confirm-payment",
  authMiddleware,
  requireAdmin,
  param("id").isUUID().withMessage("Subscription id must be a valid UUID"),
  validRequest,
  asyncHandler(controller.confirmPayment.bind(controller)),
);
adminSubscriptionRoutes.get(
  "/expiring",
  authMiddleware,
  requireAdmin,
  query("days").optional().isInt({ min: 1 }).withMessage("days must be a positive integer"),
  validRequest,
  asyncHandler(controller.listExpiring.bind(controller)),
);

export default subscriptionRoutes;
export { adminSubscriptionRoutes };
