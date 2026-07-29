import { Router } from "express";
import ChatController from "./chat.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const chatRoutes = Router();
const controller = new ChatController();

chatRoutes.get("/unread", authMiddleware, asyncHandler(controller.getUnreadCounts.bind(controller)));

chatRoutes.get("/:id/messages", authMiddleware, asyncHandler(controller.getMessages.bind(controller)));

chatRoutes.post("/:id/messages", authMiddleware, asyncHandler(controller.sendMessage.bind(controller)));

chatRoutes.post("/:id/read", authMiddleware, asyncHandler(controller.markAsRead.bind(controller)));

export default chatRoutes;
