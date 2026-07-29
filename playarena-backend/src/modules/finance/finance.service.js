import FinanceRepo from "../../repository/finance.repo.js";
import * as error from "../../shared/error/globalError.js";

export default class FinanceService {
  constructor() {
    this.repo = new FinanceRepo();
  }

  async listPaymentMethods() {
    return await this.repo.findPaymentMethods({ isActive: true });
  }

  async getGroundPaymentMethods(groundId) {
    const allMethods = await this.repo.findPaymentMethods({ isActive: true });
    const groundMethods = await this.repo.findGroundPaymentMethods(groundId);
    const activeMap = {};
    for (const gm of groundMethods) {
      activeMap[gm.paymentMethodId] = gm.isActive;
    }
    return allMethods.map((m) => ({
      ...m,
      enabled: activeMap[m.id] !== undefined ? activeMap[m.id] : true,
    }));
  }

  async toggleGroundPaymentMethod(groundId, methodId, userId) {
    const ground = await this.repo.findGroundById(groundId);
    if (!ground) throw new error.NOTFOUNDERROR("Ground not found");
    if (ground.ownerId !== userId) {
      const access = await this.repo.findGroundAccess(groundId, userId);
      if (!access || access.accessRole !== "owner") {
        throw new error.UNAUTHORIZED("Only ground owner can manage payment methods");
      }
    }

    const method = await this.repo.findPaymentMethodById(methodId);
    if (!method) throw new error.NOTFOUNDERROR("Payment method not found");

    const existing = await this.repo.findGroundPaymentMethod(groundId, methodId);
    const newActive = existing ? !existing.isActive : true;

    return await this.repo.upsertGroundPaymentMethod(groundId, methodId, { isActive: newActive });
  }

  async getGroundFinance(groundId, userId) {
    await this._checkOwnerOrManagerAccess(groundId, userId);
    return await this.repo.getGroundFinanceSummary(groundId);
  }

  async getGroundFinanceReport(groundId, userId, query) {
    await this._checkOwnerOrManagerAccess(groundId, userId);
    return await this.repo.getGroundFinanceReport(groundId, query.startDate, query.endDate);
  }

  async openCashSession(groundId, userId, data) {
    await this._checkStaffAccess(groundId, userId);

    const openSession = await this.repo.findOpenCashSession(groundId);
    if (openSession) throw new error.ALLREADYEXIST("A cash session is already open");

    return await this.repo.createCashSession({
      groundId,
      openedById: userId,
      openingCash: data.openingCash || 0,
      notes: data.notes,
    });
  }

  async closeCashSession(groundId, sessionId, userId, data) {
    await this._checkStaffAccess(groundId, userId);

    const session = await this.repo.findCashSessionById(sessionId);
    if (!session || session.groundId !== groundId) {
      throw new error.NOTFOUNDERROR("Cash session not found");
    }
    if (session.status !== "open") {
      throw new error.UNAUTHORIZED("Cash session is already closed");
    }

    const closingCash = data.closingCash;
    if (closingCash == null) throw new error.NOTFOUNDERROR("closingCash is required");

    const expectedCash = Number(session.openingCash);
    const variance = closingCash - expectedCash;

    return await this.repo.updateCashSession(sessionId, {
      closedById: userId,
      closedAt: new Date(),
      closingCash,
      expectedCash,
      variance,
      status: "closed",
      notes: data.notes || session.notes,
    });
  }

  async listCashSessions(groundId, userId) {
    await this._checkOwnerOrManagerAccess(groundId, userId);
    return await this.repo.findCashSessionsByGround(groundId);
  }

  async getAdminFinance(userId) {
    const user = await this.repo.findGroundById(userId);
    const isAdmin = userId === "admin-placeholder";
    if (!isAdmin) throw new error.UNAUTHORIZED("Admin access required");
    return await this.repo.getAdminFinanceSummary();
  }

  async _checkOwnerOrManagerAccess(groundId, userId) {
    const ground = await this.repo.findGroundById(groundId);
    if (!ground) throw new error.NOTFOUNDERROR("Ground not found");
    if (ground.ownerId === userId) return true;

    const access = await this.repo.findGroundAccess(groundId, userId);
    if (!access || (access.accessRole !== "owner" && access.accessRole !== "manager")) {
      throw new error.UNAUTHORIZED("Owner or manager access required");
    }
    return true;
  }

  async _checkStaffAccess(groundId, userId) {
    const ground = await this.repo.findGroundById(groundId);
    if (!ground) throw new error.NOTFOUNDERROR("Ground not found");
    if (ground.ownerId === userId) return true;

    const access = await this.repo.findGroundAccess(groundId, userId);
    if (!access) throw new error.UNAUTHORIZED("Staff access required");
    return true;
  }
}
