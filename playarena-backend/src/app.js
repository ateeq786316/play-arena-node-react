import express from "express";
import { createServer } from "http";
import securityMiddleware from "./middlewares/security.middleware.js";
import GoogleMiddleware from "./middlewares/googleOauth.middleware.js";
import authRoutes from "./modules/auth/auth.route.js";
import groundRoutes from "./modules/ground/ground.route.js";
import bookingRoutes from "./modules/booking/booking.route.js";
import BookingController from "./modules/booking/booking.controller.js";
import teamRoutes from "./modules/team/team.route.js";
import matchRoutes from "./modules/match/match.route.js";
import tournamentRoutes from "./modules/tournament/tournament.route.js";
import financeRoutes from "./modules/finance/finance.route.js";
import chatRoutes from "./modules/chat/chat.route.js";
import notificationRoutes from "./modules/notification/notification.route.js";
import ratingRoutes from "./modules/rating/rating.route.js";
import adminRoutes from "./modules/admin/admin.route.js";
import uploadRoutes from "./modules/upload/upload.route.js";
import asyncHandler from "./utils/asyncHandler.js";
import authMiddleware from "./middlewares/auth.middleware.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";
import { setupSocket } from "./socket/socket.js";

const bookingController = new BookingController();

export default function createApp() {
  const app = express();
  const server = createServer(app);

  securityMiddleware(app);
  GoogleMiddleware();

  app.use("/api/user", authRoutes);
  app.use("/api/grounds", groundRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/teams", teamRoutes);
  app.use("/api/matches", matchRoutes);
  app.use("/api/tournaments", tournamentRoutes);
  app.use("/api/finance", financeRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api", ratingRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/upload", uploadRoutes);

  app.post("/api/grounds/:groundId/walkin", authMiddleware, asyncHandler(bookingController.walkinBooking.bind(bookingController)));

  app.get("/api/grounds/:groundId/bookings", authMiddleware, asyncHandler(bookingController.getGroundBookings.bind(bookingController)));

  app.use(errorHandler);

  setupSocket(server);

  return server;
}
