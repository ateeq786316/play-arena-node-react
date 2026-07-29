import { Router } from "express";
import BookingController from "./booking.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const bookingRoutes = Router();
const controller = new BookingController();

bookingRoutes.get("/courts/:courtId/slots", asyncHandler(controller.getSlots.bind(controller)));

bookingRoutes.post("/", authMiddleware, asyncHandler(controller.createBooking.bind(controller)));

bookingRoutes.get("/my", authMiddleware, asyncHandler(controller.getMyBookings.bind(controller)));

bookingRoutes.get("/:id", authMiddleware, asyncHandler(controller.getBookingById.bind(controller)));

bookingRoutes.patch("/:id/cancel", authMiddleware, asyncHandler(controller.cancelBooking.bind(controller)));

bookingRoutes.post("/:id/payment", authMiddleware, asyncHandler(controller.recordPayment.bind(controller)));

bookingRoutes.get("/:id/finance", authMiddleware, asyncHandler(controller.getBookingFinance.bind(controller)));

bookingRoutes.patch("/:id/status", authMiddleware, asyncHandler(controller.updateBookingStatus.bind(controller)));

export default bookingRoutes;
