import crypto from "crypto";
import UserRepo from "../../repository/auth.repo.js";
import * as error from "../../shared/error/globalError.js";
import * as token from "../../utils/generateToken.js";
import sendEmail from "../../config/nodemailer.js";
import { otpEmail, resetPasswordEmail } from "../../utils/emailTemplates.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../../config/env.js";
import logger from "../../config/logger.js";

export default class AuthService {
  constructor() {
    this.authService = new UserRepo();
  }

  async createUserService(data) {
    let { name, email, password, mobile } = data;
    if (!name || !email || !password || !mobile)
      throw new error.NOTFOUNDERROR("all fields are required");

    const isExisted = await this.authService.findByEmail(email);
    if (isExisted) throw new error.ALLREADYEXIST("User is already existed");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.authService.createUser({
      name,
      email,
      password: hashedPassword,
      mobile,
      authProvider: "local",
    });

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await this.authService.setOtp(user.id, otp, otpExpiry);

    try {
      await sendEmail(email, "Verify your email", otpEmail(otp));
    } catch {
      logger.error({ email }, "Failed to send OTP email");
    }

    const accessToken = token.generateAccessToken(user.id);
    const refreshToken = token.generateRefreshToken(user.id);
    await this.authService.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken, user };
  }

  async verifyOtpService(data) {
    let { email, otp } = data;
    if (!email || !otp) throw new error.NOTFOUNDERROR("email and otp are required");

    const user = await this.authService.findByEmail(email);
    if (!user) throw new error.NOTFOUNDERROR("user not found");
    if (user.isVerified) throw new error.ALLREADYEXIST("User already verified");

    if (user.otpCode !== otp) throw new error.UNAUTHORIZED("Invalid OTP");
    if (!user.otpExpiry || new Date() > user.otpExpiry) throw new error.UNAUTHORIZED("OTP expired");

    await this.authService.verifyUser(user.id);

    return { message: "Email verified successfully" };
  }

  async resendOtpService(data) {
    let { email } = data;
    if (!email) throw new error.NOTFOUNDERROR("email is required");

    const user = await this.authService.findByEmail(email);
    if (!user) throw new error.NOTFOUNDERROR("user not found");
    if (user.isVerified) throw new error.ALLREADYEXIST("User already verified");

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await this.authService.setOtp(user.id, otp, otpExpiry);

    try {
      await sendEmail(email, "Verify your email", otpEmail(otp));
    } catch {
      logger.error({ email }, "Failed to resend OTP email");
    }

    return { message: "OTP resent" };
  }

  async loginUserService(data) {
    let { email, password } = data;
    if (!email || !password) throw new error.NOTFOUNDERROR("all fields are required");

    const isExisted = await this.authService.findByEmail(email);
    if (!isExisted) throw new error.NOTFOUNDERROR("user not found");

    const isPasswordValid = await bcrypt.compare(password, isExisted.password || "");
    if (!isPasswordValid) throw new error.UNAUTHORIZED("Wrong Credential");

    const accessToken = token.generateAccessToken(isExisted.id);
    const refreshToken = token.generateRefreshToken(isExisted.id);
    await this.authService.updateRefreshToken(isExisted.id, refreshToken);

    return { accessToken, refreshToken, isExisted };
  }

  async refreshTokenService(data, cookieToken) {
    let refreshToken = cookieToken || data?.refreshToken;
    if (!refreshToken) throw new error.NOTFOUNDERROR("refresh token is required");

    const decoded = jwt.verify(refreshToken, env.REFRESHTOKEN);
    const user = await this.authService.findById(decoded.id);
    if (!user) throw new error.NOTFOUNDERROR("user not found");
    if (user.refreshToken !== refreshToken) throw new error.UNAUTHORIZED("Invalid refresh token");

    const newAccessToken = token.generateAccessToken(user.id);
    const newRefreshToken = token.generateRefreshToken(user.id);
    await this.authService.updateRefreshToken(user.id, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async getProfileService(userId) {
    const user = await this.authService.findById(userId);
    if (!user) throw new error.NOTFOUNDERROR("user not found");
    return user;
  }

  async updateProfileService(userId, data) {
    const user = await this.authService.findById(userId);
    if (!user) throw new error.NOTFOUNDERROR("user not found");

    const allowed = {};
    if (data.name) allowed.name = data.name;
    if (data.avatar) allowed.avatar = data.avatar;

    return await this.authService.updateProfile(userId, allowed);
  }

  async GoogleLoginService(data) {
    const email = data.emails[0].value;
    const isExisted = await this.authService.findByEmail(email);
    if (isExisted) throw new error.ALLREADYEXIST("User is already existed");

    const user = await this.authService.createUser({
      email,
      name: data.displayName,
      authProvider: "google",
      isVerified: true,
    });

    const accessToken = token.generateAccessToken(user.id);
    const refreshToken = token.generateRefreshToken(user.id);
    await this.authService.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken, user };
  }

  async forgotPasswordService(data) {
    let { email } = data;
    const user = await this.authService.findByEmail(email);
    if (!user) throw new error.NOTFOUNDERROR("user not found");

    const rawToken = token.generateRawToken(user.id);
    const link = `http://localhost:3000/api/user/reset-password/${rawToken}`;

    try {
      await sendEmail(email, "Reset your password", resetPasswordEmail(link));
    } catch {
      logger.error({ email }, "Failed to send reset email");
    }

    return { message: "Password reset link sent to email" };
  }

  async resetPasswordService(data) {
    let { token: rawToken } = data;
    const decode = jwt.verify(rawToken, env.ACCESSTOKEN);
    if (!decode) throw new error.UNAUTHORIZED("Invalid or expired token");

    const user = await this.authService.findById(decode.id);
    if (!user) throw new error.NOTFOUNDERROR("user not found");

    return user;
  }

  async updatePasswordService(userId, body) {
    let { password } = body;
    if (!password) throw new error.NOTFOUNDERROR("password is required");

    const user = await this.authService.findById(userId);
    if (!user) throw new error.NOTFOUNDERROR("user not found");

    const hashPassword = await bcrypt.hash(password, 10);
    return await this.authService.updatePassword(userId, hashPassword);
  }
}
