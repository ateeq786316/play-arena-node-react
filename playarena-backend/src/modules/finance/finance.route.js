import { Router } from "express";
import FinanceController from "./finance.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import requireAdmin from "../../middlewares/requireAdmin.middleware.js";

const financeRoutes = Router();
const controller = new FinanceController();

financeRoutes.get("/payment-methods", asyncHandler(controller.listPaymentMethods.bind(controller)));

financeRoutes.get("/payment-methods/ground/:id", authMiddleware, asyncHandler(controller.getGroundPaymentMethods.bind(controller)));

financeRoutes.patch("/grounds/:id/payment-methods/:methodId", authMiddleware, asyncHandler(controller.toggleGroundPaymentMethod.bind(controller)));

financeRoutes.get("/grounds/:id/finance", authMiddleware, asyncHandler(controller.getGroundFinance.bind(controller)));

financeRoutes.get("/grounds/:id/reports", authMiddleware, asyncHandler(controller.getGroundFinanceReport.bind(controller)));

financeRoutes.post("/grounds/:id/cash-session/open", authMiddleware, asyncHandler(controller.openCashSession.bind(controller)));

financeRoutes.post("/grounds/:id/cash-session/:sessionId/close", authMiddleware, asyncHandler(controller.closeCashSession.bind(controller)));

financeRoutes.get("/grounds/:id/cash-sessions", authMiddleware, asyncHandler(controller.listCashSessions.bind(controller)));

financeRoutes.get("/admin/finance", authMiddleware, requireAdmin, asyncHandler(controller.getAdminFinance.bind(controller)));

export default financeRoutes;
