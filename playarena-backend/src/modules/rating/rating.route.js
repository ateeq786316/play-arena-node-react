import { Router } from "express";
import RatingController from "./rating.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const ratingRoutes = Router();
const controller = new RatingController();

ratingRoutes.get("/leaderboard", asyncHandler(controller.getLeaderboard.bind(controller)));

ratingRoutes.get("/leaderboard/:sportId", asyncHandler(controller.getLeaderboard.bind(controller)));

ratingRoutes.get("/players/:id/stats", asyncHandler(controller.getPlayerStats.bind(controller)));

ratingRoutes.post("/matches/:id/rating", authMiddleware, asyncHandler(controller.submitRating.bind(controller)));

ratingRoutes.post("/matches/:id/player-stats", authMiddleware, asyncHandler(controller.recordPlayerStats.bind(controller)));

export default ratingRoutes;
