import { Router } from "express";
import MatchController from "./match.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const matchRoutes = Router();
const controller = new MatchController();

matchRoutes.get("/requests/sent/:teamId", authMiddleware, asyncHandler(controller.getSentChallenges.bind(controller)));

matchRoutes.get("/requests/received/:teamId", authMiddleware, asyncHandler(controller.getReceivedChallenges.bind(controller)));

matchRoutes.post("/requests/:teamId", authMiddleware, asyncHandler(controller.createChallenge.bind(controller)));

matchRoutes.patch("/requests/:id/accept", authMiddleware, asyncHandler(controller.acceptChallenge.bind(controller)));

matchRoutes.patch("/requests/:id/reject", authMiddleware, asyncHandler(controller.rejectChallenge.bind(controller)));

matchRoutes.patch("/requests/:id/cancel", authMiddleware, asyncHandler(controller.cancelChallenge.bind(controller)));

matchRoutes.get("/:teamId", authMiddleware, asyncHandler(controller.listMatches.bind(controller)));

matchRoutes.get("/detail/:id", authMiddleware, asyncHandler(controller.getMatchDetail.bind(controller)));

matchRoutes.patch("/:id/score", authMiddleware, asyncHandler(controller.submitScore.bind(controller)));

matchRoutes.patch("/:id/start", authMiddleware, asyncHandler(controller.startMatch.bind(controller)));

matchRoutes.patch("/:id/cancel", authMiddleware, asyncHandler(controller.cancelMatch.bind(controller)));

export default matchRoutes;
