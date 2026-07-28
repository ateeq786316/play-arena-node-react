import { Router } from "express";
import AuthController from "./auth.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import * as validation from "../../validation/validationRule.js";
import passport from "passport";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/register", validation.registerValidationRule, asyncHandler(authController.createUserController.bind(authController)));
authRoutes.post("/verify-otp", asyncHandler(authController.verifyOtpController.bind(authController)));
authRoutes.post("/resend-otp", asyncHandler(authController.resendOtpController.bind(authController)));
authRoutes.post("/login", validation.loginValidationRule, asyncHandler(authController.loginUserController.bind(authController)));
authRoutes.post("/refresh", asyncHandler(authController.refreshTokenController.bind(authController)));
authRoutes.post("/logout", asyncHandler(authController.logoutController.bind(authController)));

authRoutes.get("/profile", authMiddleware, asyncHandler(authController.getProfileController.bind(authController)));
authRoutes.patch("/profile", authMiddleware, asyncHandler(authController.updateProfileController.bind(authController)));

authRoutes.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
authRoutes.get("/google/callback", passport.authenticate("google", { failureRedirect: "/register", session: false }), authController.GoogleLoginController.bind(authController));

authRoutes.post("/forgot-password", asyncHandler(authController.forgotPasswordController.bind(authController)));
authRoutes.get("/reset-password/:token", asyncHandler(authController.resetPasswordController.bind(authController)));
authRoutes.post("/update-password", authMiddleware, asyncHandler(authController.updatePasswordController.bind(authController)));

export default authRoutes;
