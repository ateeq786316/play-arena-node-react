import { Router } from "express";
import multer from "multer";
import UploadController from "./upload.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const uploadRoutes = Router();
const controller = new UploadController();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

uploadRoutes.post("/avatar", authMiddleware, upload.single("file"), asyncHandler(controller.uploadAvatar.bind(controller)));

uploadRoutes.post("/tournament-poster", authMiddleware, upload.single("file"), asyncHandler(controller.uploadWithGroundAccess.bind(controller)));

uploadRoutes.post("/ground-image/:groundId", authMiddleware, upload.single("file"), asyncHandler(controller.uploadWithGroundAccess.bind(controller)));

uploadRoutes.post("/booking-proof/:groundId", authMiddleware, upload.single("file"), asyncHandler(controller.uploadWithGroundAccess.bind(controller)));

uploadRoutes.post("/:type", authMiddleware, upload.single("file"), asyncHandler(controller.upload.bind(controller)));

export default uploadRoutes;
