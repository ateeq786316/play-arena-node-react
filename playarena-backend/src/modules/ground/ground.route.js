import { Router } from "express";
import GroundController from "./ground.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const groundRoutes = Router();
const controller = new GroundController();

groundRoutes.get("/regions", asyncHandler(controller.listRegions.bind(controller)));

groundRoutes.get("/featured", asyncHandler(controller.listFeaturedGrounds.bind(controller)));

groundRoutes.get("/", asyncHandler(controller.listGrounds.bind(controller)));

groundRoutes.get("/my", authMiddleware, asyncHandler(controller.listMyGrounds.bind(controller)));

groundRoutes.get("/:id", asyncHandler(controller.getGroundById.bind(controller)));

groundRoutes.post("/", authMiddleware, asyncHandler(controller.createGround.bind(controller)));

groundRoutes.patch("/:id", authMiddleware, asyncHandler(controller.updateGround.bind(controller)));

groundRoutes.delete("/:id", authMiddleware, asyncHandler(controller.deleteGround.bind(controller)));

groundRoutes.get("/:groundId/courts", asyncHandler(controller.listCourts.bind(controller)));

groundRoutes.post("/:groundId/courts", authMiddleware, asyncHandler(controller.createCourt.bind(controller)));

groundRoutes.patch("/courts/:id", authMiddleware, asyncHandler(controller.updateCourt.bind(controller)));

groundRoutes.delete("/courts/:id", authMiddleware, asyncHandler(controller.deleteCourt.bind(controller)));

groundRoutes.get("/:groundId/schedules", asyncHandler(controller.listSchedules.bind(controller)));

groundRoutes.put("/:groundId/schedules/:dayOfWeek", authMiddleware, asyncHandler(controller.upsertSchedule.bind(controller)));

groundRoutes.delete("/:groundId/schedules/:dayOfWeek", authMiddleware, asyncHandler(controller.deleteSchedule.bind(controller)));

groundRoutes.patch("/:groundId/settings", authMiddleware, asyncHandler(controller.updateSetting.bind(controller)));

groundRoutes.post("/:groundId/images", authMiddleware, asyncHandler(controller.addImage.bind(controller)));

groundRoutes.delete("/:groundId/images/:imageId", authMiddleware, asyncHandler(controller.removeImage.bind(controller)));

groundRoutes.post("/:groundId/invites", authMiddleware, asyncHandler(controller.inviteStaff.bind(controller)));

export default groundRoutes;
