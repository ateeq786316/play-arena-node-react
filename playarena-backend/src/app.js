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
import healthRoutes from "./modules/health/health.route.js";
import subscriptionRoutes, { adminSubscriptionRoutes } from "./modules/subscription/subscription.route.js";
import analyticsRoutes from "./modules/analytics/analytics.route.js";
import crmRoutes from "./modules/crm/crm.route.js";
import pricingRoutes from "./modules/pricing/pricing.route.js";
import disputeRoutes from "./modules/dispute/dispute.route.js";
import geoRoutes from "./modules/geo/geo.route.js";
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
  app.use("/api/health", healthRoutes);
  app.use("/api/subscriptions", subscriptionRoutes);
  app.use("/api/admin/subscriptions", adminSubscriptionRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/crm", crmRoutes);
  app.use("/api/pricing", pricingRoutes);
  app.use("/api/disputes", disputeRoutes);
  app.use("/api/geo", geoRoutes);

  app.post("/api/grounds/:groundId/walkin", authMiddleware, asyncHandler(bookingController.walkinBooking.bind(bookingController)));

  app.get("/api/grounds/:groundId/bookings", authMiddleware, asyncHandler(bookingController.getGroundBookings.bind(bookingController)));

  app.use(errorHandler);

  setupSocket(server);

  return server;
}
