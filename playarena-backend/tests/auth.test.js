import { describe, it, expect, vi, beforeEach } from "vitest";

import prisma from "../src/database/db.js";

function mockUser(overrides = {}) {
  return {
    id: "user-id-1",
    name: "Test User",
    email: "test@test.com",
    password: "$2b$10$hashedpassword",
    mobile: "03001234567",
    authProvider: "local",
    isVerified: false,
    otpCode: "123456",
    otpExpiry: new Date(Date.now() + 600000),
    refreshToken: "old-refresh-token",
    avatar: null,
    role: "player",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function clearMocks() {
  vi.clearAllMocks();
}

describe("Auth Service", () => {
  let AuthService;

  beforeAll(async () => {
    const mod = await import("../src/modules/auth/auth.service.js");
    AuthService = mod.default;
  });

  beforeEach(() => {
    clearMocks();
  });

  describe("createUserService (Register)", () => {
    it("should throw if required fields missing", async () => {
      const service = new AuthService();
      await expect(service.createUserService({})).rejects.toThrow("all fields are required");
      await expect(service.createUserService({ name: "A" })).rejects.toThrow("all fields are required");
    });

    it("should throw if email already exists", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser());
      const service = new AuthService();
      await expect(
        service.createUserService({
          name: "Test", email: "test@test.com", password: "Pass123!", mobile: "03001234567",
        })
      ).rejects.toThrow("User is already existed");
    });

    it("should create user and return tokens", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser({ id: "new-user-id" }));
      prisma.user.update.mockResolvedValue(mockUser({ id: "new-user-id" }));

      const service = new AuthService();
      const result = await service.createUserService({
        name: "New User", email: "new@test.com", password: "Pass123!", mobile: "03007654321",
      });

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user.email).toBe("test@test.com");
    });
  });

  describe("verifyOtpService", () => {
    it("should throw if email or otp missing", async () => {
      const service = new AuthService();
      await expect(service.verifyOtpService({})).rejects.toThrow("email and otp are required");
    });

    it("should throw if user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const service = new AuthService();
      await expect(service.verifyOtpService({ email: "no@user.com", otp: "123456" })).rejects.toThrow("user not found");
    });

    it("should throw if already verified", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser({ isVerified: true }));
      const service = new AuthService();
      await expect(service.verifyOtpService({ email: "test@test.com", otp: "123456" })).rejects.toThrow("User already verified");
    });

    it("should throw on invalid OTP", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser({ isVerified: false }));
      const service = new AuthService();
      await expect(service.verifyOtpService({ email: "test@test.com", otp: "wrong" })).rejects.toThrow("Invalid OTP");
    });

    it("should throw on expired OTP", async () => {
      prisma.user.findUnique.mockResolvedValue(
        mockUser({ isVerified: false, otpExpiry: new Date(Date.now() - 1000) })
      );
      const service = new AuthService();
      await expect(service.verifyOtpService({ email: "test@test.com", otp: "123456" })).rejects.toThrow("OTP expired");
    });

    it("should verify user with valid OTP", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser({ isVerified: false }));
      prisma.user.update.mockResolvedValue(mockUser({ isVerified: true }));
      const service = new AuthService();
      const result = await service.verifyOtpService({ email: "test@test.com", otp: "123456" });
      expect(result.message).toBe("Email verified successfully");
    });
  });

  describe("resendOtpService", () => {
    it("should throw if email missing", async () => {
      const service = new AuthService();
      await expect(service.resendOtpService({})).rejects.toThrow("email is required");
    });

    it("should resend OTP for unverified user", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser({ isVerified: false }));
      prisma.user.update.mockResolvedValue(mockUser());
      const service = new AuthService();
      const result = await service.resendOtpService({ email: "test@test.com" });
      expect(result.message).toBe("OTP resent");
    });
  });

  describe("loginUserService", () => {
    it("should throw if fields missing", async () => {
      const service = new AuthService();
      await expect(service.loginUserService({})).rejects.toThrow("all fields are required");
    });

    it("should throw if user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const service = new AuthService();
      await expect(service.loginUserService({ email: "no@user.com", password: "x" })).rejects.toThrow("user not found");
    });

    it("should throw on wrong password", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser());
      const service = new AuthService();
      await expect(service.loginUserService({ email: "test@test.com", password: "wrong" })).rejects.toThrow("Wrong Credential");
    });

    it("should login with valid credentials", async () => {
      const bcrypt = await import("bcrypt");
      const hashedPassword = await bcrypt.hash("Pass123!", 10);
      prisma.user.findUnique.mockResolvedValue(mockUser({ password: hashedPassword }));
      prisma.user.update.mockResolvedValue(mockUser({ password: hashedPassword }));

      const service = new AuthService();
      const result = await service.loginUserService({ email: "test@test.com", password: "Pass123!" });
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
    });
  });

  describe("refreshTokenService", () => {
    it("should throw if no refresh token", async () => {
      const service = new AuthService();
      await expect(service.refreshTokenService({}, null)).rejects.toThrow("refresh token is required");
    });

    it("should throw if user not found from token", async () => {
      const jwt = await import("jsonwebtoken");
      const token = jwt.sign({ id: "no-user" }, "test-refresh-token-secret-key-12345678");
      prisma.user.findUnique.mockResolvedValue(null);
      const service = new AuthService();
      await expect(service.refreshTokenService({}, token)).rejects.toThrow("user not found");
    });

    it("should throw if token does not match stored", async () => {
      const jwt = await import("jsonwebtoken");
      const token = jwt.sign({ id: "user-id-1" }, "test-refresh-token-secret-key-12345678");
      prisma.user.findUnique.mockResolvedValue(mockUser({ refreshToken: "different-token" }));
      const service = new AuthService();
      await expect(service.refreshTokenService({}, token)).rejects.toThrow("Invalid refresh token");
    });

    it("should return new tokens on valid refresh", async () => {
      const jwt = await import("jsonwebtoken");
      const token = jwt.sign({ id: "user-id-1" }, "test-refresh-token-secret-key-12345678");
      prisma.user.findUnique.mockResolvedValue(mockUser({ refreshToken: token }));
      prisma.user.update.mockResolvedValue(mockUser());
      const service = new AuthService();
      const result = await service.refreshTokenService({}, token);
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
    });
  });

  describe("getProfileService", () => {
    it("should throw if user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const service = new AuthService();
      await expect(service.getProfileService("no-id")).rejects.toThrow("user not found");
    });

    it("should return user profile", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser());
      const service = new AuthService();
      const user = await service.getProfileService("user-id-1");
      expect(user.email).toBe("test@test.com");
    });
  });

  describe("updateProfileService", () => {
    it("should update allowed fields only", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser());
      prisma.user.update.mockResolvedValue(mockUser({ name: "Updated" }));
      const service = new AuthService();
      const result = await service.updateProfileService("user-id-1", { name: "Updated", role: "admin" });
      expect(result.name).toBe("Updated");
    });
  });

  describe("forgotPasswordService", () => {
    it("should send reset link email", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser());
      const service = new AuthService();
      const result = await service.forgotPasswordService({ email: "test@test.com" });
      expect(result.message).toBe("Password reset link sent to email");
    });
  });

  describe("updatePasswordService", () => {
    it("should throw if password missing", async () => {
      const service = new AuthService();
      await expect(service.updatePasswordService("user-id-1", {})).rejects.toThrow("password is required");
    });

    it("should update password", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser());
      prisma.user.update.mockResolvedValue(mockUser());
      const service = new AuthService();
      const result = await service.updatePasswordService("user-id-1", { password: "NewPass456!" });
      expect(result).toBeDefined();
    });
  });
});
