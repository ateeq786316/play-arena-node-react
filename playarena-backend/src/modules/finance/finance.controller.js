import FinanceService from "./finance.service.js";

export default class FinanceController {
  constructor() {
    this.service = new FinanceService();
  }

  async listPaymentMethods(req, res) {
    const methods = await this.service.listPaymentMethods();
    res.status(200).json({ methods });
  }

  async getGroundPaymentMethods(req, res) {
    const methods = await this.service.getGroundPaymentMethods(req.params.id);
    res.status(200).json({ methods });
  }

  async toggleGroundPaymentMethod(req, res) {
    const result = await this.service.toggleGroundPaymentMethod(req.params.id, req.params.methodId, req.userId);
    res.status(200).json({ message: "Payment method toggled", result });
  }

  async getGroundFinance(req, res) {
    const finance = await this.service.getGroundFinance(req.params.id, req.userId);
    res.status(200).json({ finance });
  }

  async getGroundFinanceReport(req, res) {
    const report = await this.service.getGroundFinanceReport(req.params.id, req.userId, req.query);
    res.status(200).json({ report });
  }

  async openCashSession(req, res) {
    const session = await this.service.openCashSession(req.params.id, req.userId, req.body);
    res.status(201).json({ message: "Cash session opened", session });
  }

  async closeCashSession(req, res) {
    const session = await this.service.closeCashSession(req.params.id, req.params.sessionId, req.userId, req.body);
    res.status(200).json({ message: "Cash session closed", session });
  }

  async listCashSessions(req, res) {
    const sessions = await this.service.listCashSessions(req.params.id, req.userId);
    res.status(200).json({ sessions });
  }

  async getAdminFinance(req, res) {
    const finance = await this.service.getAdminFinance(req.userId);
    res.status(200).json({ finance });
  }
}
