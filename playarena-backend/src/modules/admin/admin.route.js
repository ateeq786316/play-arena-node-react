import { Router } from "express";
import AdminController from "./admin.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const adminRoutes = Router();
const controller = new AdminController();

adminRoutes.get("/users", authMiddleware, asyncHandler(controller.getUsers.bind(controller)));

adminRoutes.get("/users/:id", authMiddleware, asyncHandler(controller.getUserDetail.bind(controller)));

adminRoutes.get("/grounds", authMiddleware, asyncHandler(controller.getGrounds.bind(controller)));

adminRoutes.patch("/grounds/:id/verify", authMiddleware, asyncHandler(controller.verifyGround.bind(controller)));

adminRoutes.patch("/grounds/:id/suspend", authMiddleware, asyncHandler(controller.suspendGround.bind(controller)));

adminRoutes.get("/teams", authMiddleware, asyncHandler(controller.getTeams.bind(controller)));

adminRoutes.get("/finance", authMiddleware, asyncHandler(controller.getFinance.bind(controller)));

adminRoutes.get("/audit-logs", authMiddleware, asyncHandler(controller.getAuditLogs.bind(controller)));

adminRoutes.get("/regions", authMiddleware, asyncHandler(controller.manageRegions.bind(controller)));
adminRoutes.post("/regions", authMiddleware, asyncHandler(controller.manageRegions.bind(controller)));
adminRoutes.get("/regions/:action/:id", authMiddleware, asyncHandler(controller.manageRegions.bind(controller)));

adminRoutes.get("/cities", authMiddleware, asyncHandler(controller.manageCities.bind(controller)));
adminRoutes.post("/cities", authMiddleware, asyncHandler(controller.manageCities.bind(controller)));
adminRoutes.get("/cities/:action/:id", authMiddleware, asyncHandler(controller.manageCities.bind(controller)));

adminRoutes.get("/sports", authMiddleware, asyncHandler(controller.manageSports.bind(controller)));
adminRoutes.post("/sports", authMiddleware, asyncHandler(controller.manageSports.bind(controller)));
adminRoutes.get("/sports/:action/:id", authMiddleware, asyncHandler(controller.manageSports.bind(controller)));

adminRoutes.get("/payment-methods", authMiddleware, asyncHandler(controller.managePaymentMethods.bind(controller)));
adminRoutes.post("/payment-methods", authMiddleware, asyncHandler(controller.managePaymentMethods.bind(controller)));
adminRoutes.get("/payment-methods/:action/:id", authMiddleware, asyncHandler(controller.managePaymentMethods.bind(controller)));

export default adminRoutes;
