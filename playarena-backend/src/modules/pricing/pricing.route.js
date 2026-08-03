import { Router } from "express";
import PricingController from "./pricing.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const pricingRoutes = Router();
const controller = new PricingController();

pricingRoutes.get("/preview", asyncHandler(controller.pricePreview.bind(controller)));
pricingRoutes.post("/coupon/validate", asyncHandler(controller.validateCoupon.bind(controller)));
pricingRoutes.get("/ground/:groundId/rules", authMiddleware, asyncHandler(controller.getRules.bind(controller)));
pricingRoutes.post("/rules", authMiddleware, asyncHandler(controller.createRule.bind(controller)));
pricingRoutes.patch("/rules/:id", authMiddleware, asyncHandler(controller.updateRule.bind(controller)));
pricingRoutes.delete("/rules/:id", authMiddleware, asyncHandler(controller.deleteRule.bind(controller)));
pricingRoutes.post("/holidays", authMiddleware, asyncHandler(controller.createHoliday.bind(controller)));
pricingRoutes.delete("/holidays/:id", authMiddleware, asyncHandler(controller.deleteHoliday.bind(controller)));
pricingRoutes.get("/ground/:groundId/coupons", authMiddleware, asyncHandler(controller.getCoupons.bind(controller)));
pricingRoutes.post("/coupons", authMiddleware, asyncHandler(controller.createCoupon.bind(controller)));

export default pricingRoutes;
