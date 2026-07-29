import express from "express";
import securityMiddleware from "./middlewares/security.middleware.js";
import GoogleMiddleware from "./middlewares/googleOauth.middleware.js";
import authRoutes from "./modules/auth/auth.route.js";
import groundRoutes from "./modules/ground/ground.route.js";
import bookingRoutes from "./modules/booking/booking.route.js";
import BookingController from "./modules/booking/booking.controller.js";
import asyncHandler from "./utils/asyncHandler.js";
import authMiddleware from "./middlewares/auth.middleware.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";

const bookingController = new BookingController();

export default function createApp() {
  const app = express();

  securityMiddleware(app);
  GoogleMiddleware();

  app.use("/api/user", authRoutes);
  app.use("/api/grounds", groundRoutes);
  app.use("/api/bookings", bookingRoutes);

  app.post("/api/grounds/:groundId/walkin", authMiddleware, asyncHandler(bookingController.walkinBooking.bind(bookingController)));

  app.get("/api/grounds/:groundId/bookings", authMiddleware, asyncHandler(bookingController.getGroundBookings.bind(bookingController)));

  app.use(errorHandler);
  return app;
}
