import prisma from "../database/db.js";

export default class UserRepo {
  async createUser(payload) {
    return await prisma.user.create({ data: payload });
  }

  async findByEmail(email) {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findById(id) {
    return await prisma.user.findUnique({ where: { id } });
  }

  async updatePassword(id, password) {
    return await prisma.user.update({
      where: { id },
      data: { password },
    });
  }

  async updateRefreshToken(id, refreshToken) {
    return await prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }

  async updateProfile(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async setOtp(id, otpCode, otpExpiry) {
    return await prisma.user.update({
      where: { id },
      data: { otpCode, otpExpiry },
    });
  }

  async verifyUser(id) {
    return await prisma.user.update({
      where: { id },
      data: { isVerified: true, otpCode: null, otpExpiry: null },
    });
  }
}
