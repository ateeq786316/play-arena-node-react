import AuthService from "./auth.service.js";
import { app_constant } from "../../constant/app.constant.js";

export default class AuthController {
  constructor() {
    this.authController = new AuthService();
  }

  async createUserController(req, res) {
    const user = await this.authController.createUserService(req.body);
    res.cookie("accessToken", user.accessToken, app_constant.cookie.accessToken);
    res.cookie("refreshToken", user.refreshToken, app_constant.cookie.refreshToken);
    res.status(201).json({ message: "User created. Verify OTP sent to email.", user: user.user });
  }

  async verifyOtpController(req, res) {
    const result = await this.authController.verifyOtpService(req.body);
    res.status(200).json(result);
  }

  async resendOtpController(req, res) {
    const result = await this.authController.resendOtpService(req.body);
    res.status(200).json(result);
  }

  async loginUserController(req, res) {
    const user = await this.authController.loginUserService(req.body);
    res.cookie("accessToken", user.accessToken, app_constant.cookie.accessToken);
    res.cookie("refreshToken", user.refreshToken, app_constant.cookie.refreshToken);
    res.status(200).json({ message: "User login successfully", user: user.isExisted });
  }

  async refreshTokenController(req, res) {
    const tokens = await this.authController.refreshTokenService(req.body, req.cookies?.refreshToken);
    res.cookie("accessToken", tokens.accessToken, app_constant.cookie.accessToken);
    res.cookie("refreshToken", tokens.refreshToken, app_constant.cookie.refreshToken);
    res.status(200).json({ message: "Token refreshed" });
  }

  async getProfileController(req, res) {
    const user = await this.authController.getProfileService(req.userId);
    res.status(200).json({ user });
  }

  async updateProfileController(req, res) {
    const user = await this.authController.updateProfileService(req.userId, req.body);
    res.status(200).json({ message: "Profile updated", user });
  }

  async logoutController(req, res) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  }

  async GoogleLoginController(req, res) {
    const user = await this.authController.GoogleLoginService(req.user);
    res.cookie("accessToken", user.accessToken, app_constant.cookie.accessToken);
    res.cookie("refreshToken", user.refreshToken, app_constant.cookie.refreshToken);
    res.status(201).json({ message: "User created successfully", user: user.user });
  }

  async forgotPasswordController(req, res) {
    const result = await this.authController.forgotPasswordService(req.body);
    res.status(200).json(result);
  }

  async resetPasswordController(req, res) {
    const user = await this.authController.resetPasswordService(req.params);
    res.json({ userId: user.id, message: "User verified. Provide new password." });
  }

  async updatePasswordController(req, res) {
    const user = await this.authController.updatePasswordService(req.userId, req.body);
    res.json({ message: "Password updated successfully", userId: user.id });
  }

  async setNewPasswordController(req, res) {
    const result = await this.authController.setNewPasswordService(req.body);
    res.json(result);
  }
}
