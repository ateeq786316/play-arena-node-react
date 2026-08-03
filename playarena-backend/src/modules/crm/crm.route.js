import { Router } from "express";
import CrmController from "./crm.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const crmRoutes = Router();
const controller = new CrmController();

crmRoutes.get("/preferences", authMiddleware, asyncHandler(controller.getPreferences.bind(controller)));
crmRoutes.patch("/preferences", authMiddleware, asyncHandler(controller.updatePreferences.bind(controller)));
crmRoutes.get("/ground/:groundId", authMiddleware, asyncHandler(controller.getBroadcasts.bind(controller)));
crmRoutes.post("/broadcast", authMiddleware, asyncHandler(controller.createBroadcast.bind(controller)));
crmRoutes.get("/broadcast/:id", authMiddleware, asyncHandler(controller.getBroadcastById.bind(controller)));
crmRoutes.post("/broadcast/:id/send", authMiddleware, asyncHandler(controller.sendBroadcast.bind(controller)));

export default crmRoutes;
