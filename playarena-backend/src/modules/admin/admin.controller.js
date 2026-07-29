import AdminService from "./admin.service.js";

export default class AdminController {
  constructor() {
    this.service = new AdminService();
  }

  async getUsers(req, res) {
    const result = await this.service.getUsers(req.userId, req.query);
    res.status(200).json(result);
  }

  async getUserDetail(req, res) {
    const user = await this.service.getUserDetail(req.userId, req.params.id);
    res.status(200).json({ user });
  }

  async getGrounds(req, res) {
    const result = await this.service.getGrounds(req.userId, req.query);
    res.status(200).json(result);
  }

  async verifyGround(req, res) {
    const ground = await this.service.verifyGround(req.userId, req.params.id);
    res.status(200).json({ message: "Ground verified", ground });
  }

  async suspendGround(req, res) {
    const ground = await this.service.suspendGround(req.userId, req.params.id);
    res.status(200).json({ message: "Ground suspended", ground });
  }

  async getTeams(req, res) {
    const result = await this.service.getTeams(req.userId, req.query);
    res.status(200).json(result);
  }

  async getFinance(req, res) {
    const finance = await this.service.getFinance(req.userId);
    res.status(200).json({ finance });
  }

  async getAuditLogs(req, res) {
    const result = await this.service.getAuditLogs(req.userId, req.query);
    res.status(200).json(result);
  }

  async manageRegions(req, res) {
    const result = await this.service.manageRegions(req.userId, req.params.action, { ...req.body, id: req.params.id });
    res.status(200).json(result);
  }

  async manageCities(req, res) {
    const result = await this.service.manageCities(req.userId, req.params.action, { ...req.body, id: req.params.id });
    res.status(200).json(result);
  }

  async manageSports(req, res) {
    const result = await this.service.manageSports(req.userId, req.params.action, { ...req.body, id: req.params.id });
    res.status(200).json(result);
  }

  async managePaymentMethods(req, res) {
    const result = await this.service.managePaymentMethods(req.userId, req.params.action, { ...req.body, id: req.params.id });
    res.status(200).json(result);
  }
}
