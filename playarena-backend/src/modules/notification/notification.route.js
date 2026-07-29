import { Router } from "express";
import NotificationController from "./notification.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const notificationRoutes = Router();
const controller = new NotificationController();

notificationRoutes.get("/", authMiddleware, asyncHandler(controller.getNotifications.bind(controller)));

notificationRoutes.get("/unread-count", authMiddleware, asyncHandler(controller.getUnreadCount.bind(controller)));

notificationRoutes.patch("/read-all", authMiddleware, asyncHandler(controller.markAllAsRead.bind(controller)));

notificationRoutes.patch("/:id/read", authMiddleware, asyncHandler(controller.markAsRead.bind(controller)));

notificationRoutes.delete("/:id", authMiddleware, asyncHandler(controller.deleteNotification.bind(controller)));

export default notificationRoutes;
