import AdminRepo from "../../repository/admin.repo.js";
import * as error from "../../shared/error/globalError.js";
import prisma from "../../database/db.js";

export default class AdminService {
  constructor() {
    this.repo = new AdminRepo();
  }

  async _requireSuperAdmin(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user || user.role !== "super_admin") {
      throw new error.UNAUTHORIZED("Super admin access required");
    }
  }

  async getUsers(userId, query) {
    await this._requireSuperAdmin(userId);
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 20));
    return await this.repo.findUsers(page, limit);
  }

  async getUserDetail(userId, targetId) {
    await this._requireSuperAdmin(userId);
    const user = await this.repo.findUserById(targetId);
    if (!user) throw new error.NOTFOUNDERROR("User not found");
    return user;
  }

  async getGrounds(userId, query) {
    await this._requireSuperAdmin(userId);
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 20));
    return await this.repo.findGrounds(page, limit);
  }

  async verifyGround(userId, groundId) {
    await this._requireSuperAdmin(userId);
    const ground = await prisma.ground.findUnique({ where: { id: groundId } });
    if (!ground) throw new error.NOTFOUNDERROR("Ground not found");
    const updated = await this.repo.updateGround(groundId, { isVerified: true });
    await this.repo.createAuditLog({ userId, action: "ground_verified", entity: "ground", entityId: groundId });
    return updated;
  }

  async suspendGround(userId, groundId) {
    await this._requireSuperAdmin(userId);
    const ground = await prisma.ground.findUnique({ where: { id: groundId } });
    if (!ground) throw new error.NOTFOUNDERROR("Ground not found");
    const updated = await this.repo.updateGround(groundId, { isActive: false });
    await this.repo.createAuditLog({ userId, action: "ground_suspended", entity: "ground", entityId: groundId });
    return updated;
  }

  async getTeams(userId, query) {
    await this._requireSuperAdmin(userId);
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 20));
    return await this.repo.findTeams(page, limit);
  }

  async getFinance(userId) {
    await this._requireSuperAdmin(userId);
    return await this.repo.getPlatformFinance();
  }

  async getAuditLogs(userId, query) {
    await this._requireSuperAdmin(userId);
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 20));
    return await this.repo.findAuditLogs(page, limit);
  }

  async manageRegions(userId, action, data) {
    await this._requireSuperAdmin(userId);
    switch (action) {
      case "list": return await prisma.region.findMany({ orderBy: { name: "asc" }, include: { cities: true } });
      case "create": return await prisma.region.create({ data: { name: data.name, code: data.code } });
      case "update": return await prisma.region.update({ where: { id: data.id }, data: { name: data.name, code: data.code, isActive: data.isActive } });
      case "delete": return await prisma.region.delete({ where: { id: data.id } });
      default: throw new error.NOTFOUNDERROR("Invalid action");
    }
  }

  async manageCities(userId, action, data) {
    await this._requireSuperAdmin(userId);
    switch (action) {
      case "list": return await prisma.city.findMany({ orderBy: { name: "asc" }, include: { region: true } });
      case "create": return await prisma.city.create({ data: { name: data.name, regionId: data.regionId, displayOrder: data.displayOrder || 0 } });
      case "update": return await prisma.city.update({ where: { id: data.id }, data: { name: data.name, regionId: data.regionId, isActive: data.isActive, displayOrder: data.displayOrder } });
      case "delete": return await prisma.city.delete({ where: { id: data.id } });
      default: throw new error.NOTFOUNDERROR("Invalid action");
    }
  }

  async manageSports(userId, action, data) {
    await this._requireSuperAdmin(userId);
    switch (action) {
      case "list": return await prisma.sportCategory.findMany({ orderBy: { name: "asc" } });
      case "create": return await prisma.sportCategory.create({ data: { name: data.name, slug: data.slug, icon: data.icon } });
      case "update": return await prisma.sportCategory.update({ where: { id: data.id }, data: { name: data.name, slug: data.slug, icon: data.icon, isActive: data.isActive } });
      case "delete": return await prisma.sportCategory.delete({ where: { id: data.id } });
      default: throw new error.NOTFOUNDERROR("Invalid action");
    }
  }

  async managePaymentMethods(userId, action, data) {
    await this._requireSuperAdmin(userId);
    switch (action) {
      case "list": return await prisma.paymentMethod.findMany({ orderBy: { displayOrder: "asc" } });
      case "create": return await prisma.paymentMethod.create({ data: { name: data.name, slug: data.slug, displayOrder: data.displayOrder || 0 } });
      case "update": return await prisma.paymentMethod.update({ where: { id: data.id }, data: { name: data.name, slug: data.slug, isActive: data.isActive, displayOrder: data.displayOrder } });
      case "delete": return await prisma.paymentMethod.delete({ where: { id: data.id } });
      default: throw new error.NOTFOUNDERROR("Invalid action");
    }
  }
}
