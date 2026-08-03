import { Router } from "express";
import DisputeController from "./dispute.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const disputeRoutes = Router();
const controller = new DisputeController();

disputeRoutes.get("/my", authMiddleware, asyncHandler(controller.myDisputes.bind(controller)));
disputeRoutes.get("/all", authMiddleware, asyncHandler(controller.getAllDisputes.bind(controller)));
disputeRoutes.post("/file", authMiddleware, asyncHandler(controller.fileDispute.bind(controller)));
disputeRoutes.get("/:id", authMiddleware, asyncHandler(controller.getDispute.bind(controller)));
disputeRoutes.patch("/:id/resolve", authMiddleware, asyncHandler(controller.resolveDispute.bind(controller)));
disputeRoutes.post("/damage-claim", authMiddleware, asyncHandler(controller.fileDamageClaim.bind(controller)));

export default disputeRoutes;
