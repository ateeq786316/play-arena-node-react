import { Router } from "express";
import TournamentController from "./tournament.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const tournamentRoutes = Router();
const controller = new TournamentController();

tournamentRoutes.post("/", authMiddleware, asyncHandler(controller.createTournament.bind(controller)));

tournamentRoutes.get("/", asyncHandler(controller.listTournaments.bind(controller)));

tournamentRoutes.get("/my", authMiddleware, asyncHandler(controller.getMyTournaments.bind(controller)));

tournamentRoutes.get("/:id", asyncHandler(controller.getTournamentById.bind(controller)));

tournamentRoutes.patch("/:id", authMiddleware, asyncHandler(controller.updateTournament.bind(controller)));

tournamentRoutes.delete("/:id", authMiddleware, asyncHandler(controller.deleteTournament.bind(controller)));

tournamentRoutes.post("/:id/register", authMiddleware, asyncHandler(controller.registerTeam.bind(controller)));

tournamentRoutes.post("/:id/withdraw", authMiddleware, asyncHandler(controller.withdrawTeam.bind(controller)));

tournamentRoutes.get("/:id/bracket", asyncHandler(controller.getBracket.bind(controller)));

tournamentRoutes.get("/:id/standings", asyncHandler(controller.getStandings.bind(controller)));

tournamentRoutes.post("/:id/matches/:matchId/result", authMiddleware, asyncHandler(controller.enterMatchResult.bind(controller)));

tournamentRoutes.post("/:id/generate-bracket", authMiddleware, asyncHandler(controller.generateBracket.bind(controller)));

export default tournamentRoutes;
