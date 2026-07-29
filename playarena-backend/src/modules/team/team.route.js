import { Router } from "express";
import TeamController from "./team.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const teamRoutes = Router();
const controller = new TeamController();

teamRoutes.get("/sports", asyncHandler(controller.listSportCategories.bind(controller)));

teamRoutes.get("/", asyncHandler(controller.listTeams.bind(controller)));

teamRoutes.get("/my", authMiddleware, asyncHandler(controller.listMyTeams.bind(controller)));

teamRoutes.get("/:id", authMiddleware, asyncHandler(controller.getTeamById.bind(controller)));

teamRoutes.post("/", authMiddleware, asyncHandler(controller.createTeam.bind(controller)));

teamRoutes.patch("/:id", authMiddleware, asyncHandler(controller.updateTeam.bind(controller)));

teamRoutes.delete("/:id", authMiddleware, asyncHandler(controller.deleteTeam.bind(controller)));

teamRoutes.get("/:id/members", authMiddleware, asyncHandler(controller.getTeamMembers.bind(controller)));

teamRoutes.patch("/:id/members/:uid", authMiddleware, asyncHandler(controller.updateMemberRole.bind(controller)));

teamRoutes.delete("/:id/members/:uid", authMiddleware, asyncHandler(controller.removeMember.bind(controller)));

teamRoutes.delete("/:id/members/me", authMiddleware, asyncHandler(controller.leaveTeam.bind(controller)));

teamRoutes.patch("/:id/transfer-captaincy/:uid", authMiddleware, asyncHandler(controller.transferCaptaincy.bind(controller)));

teamRoutes.post("/:id/invite", authMiddleware, asyncHandler(controller.invitePlayer.bind(controller)));

teamRoutes.post("/:id/join-request", authMiddleware, asyncHandler(controller.requestToJoin.bind(controller)));

teamRoutes.get("/:id/join-requests", authMiddleware, asyncHandler(controller.listJoinRequests.bind(controller)));

teamRoutes.post("/:id/join-requests/:uid/accept", authMiddleware, asyncHandler(controller.acceptJoinRequest.bind(controller)));

teamRoutes.post("/:id/join-requests/:uid/reject", authMiddleware, asyncHandler(controller.rejectJoinRequest.bind(controller)));

teamRoutes.get("/:id/stats", authMiddleware, asyncHandler(controller.getTeamStats.bind(controller)));

teamRoutes.get("/:id/rating-history", authMiddleware, asyncHandler(controller.getRatingHistory.bind(controller)));

teamRoutes.post("/join/:id", authMiddleware, asyncHandler(controller.acceptInvite.bind(controller)));

teamRoutes.delete("/join/:id", authMiddleware, asyncHandler(controller.rejectInvite.bind(controller)));

export default teamRoutes;
