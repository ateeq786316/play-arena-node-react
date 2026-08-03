import DisputeService from "./dispute.service.js";

export default class DisputeController {
  constructor() {
    this.service = new DisputeService();
  }

  async fileDispute(req, res) {
    const dispute = await this.service.fileDispute(req.userId, req.body);
    res.status(201).json({ message: "Dispute filed", dispute });
  }

  async myDisputes(req, res) {
    const disputes = await this.service.myDisputes(req.userId);
    res.status(200).json({ disputes });
  }

  async getDispute(req, res) {
    const dispute = await this.service.getDispute(req.params.id, req.userId);
    res.status(200).json({ dispute });
  }

  async getAllDisputes(req, res) {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    const disputes = await this.service.getAllDisputes(filters);
    res.status(200).json({ disputes });
  }

  async resolveDispute(req, res) {
    const dispute = await this.service.resolveDispute(req.params.id, req.userId, req.body);
    res.status(200).json({ message: "Dispute resolved", dispute });
  }

  async fileDamageClaim(req, res) {
    const claim = await this.service.fileDamageClaim(req.userId, req.body);
    res.status(201).json({ message: "Damage claim filed", claim });
  }
}
