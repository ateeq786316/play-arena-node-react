import DisputeRepo from "../../repository/dispute.repo.js";
import GroundRepo from "../../repository/ground.repo.js";
import * as error from "../../shared/error/globalError.js";

export default class DisputeService {
  constructor() {
    this.repo = new DisputeRepo();
    this.groundRepo = new GroundRepo();
  }

  async fileDispute(userId, data) {
    const { bookingId, type, reason, description, evidence } = data;
    if (!bookingId || !type || !reason) throw new error.NOTFOUNDERROR("bookingId, type, and reason are required");
    const existing = await this.repo.findByBooking(bookingId);
    if (existing) throw new error.ALLREADYEXIST("A dispute already exists for this booking");
    return await this.repo.create({
      bookingId, filedById: userId, type, reason, description, evidence: evidence || null, status: "pending",
    });
  }

  async myDisputes(userId) {
    return await this.repo.findByUser(userId);
  }

  async getDispute(id, userId) {
    const dispute = await this.repo.findById(id);
    if (!dispute) throw new error.NOTFOUNDERROR("Dispute not found");
    return dispute;
  }

  async getAllDisputes(filters = {}) {
    return await this.repo.findAll(filters);
  }

  async resolveDispute(disputeId, userId, data) {
    const { resolution, action } = data;
    if (!resolution) throw new error.NOTFOUNDERROR("Resolution is required");
    const dispute = await this.repo.findById(disputeId);
    if (!dispute) throw new error.NOTFOUNDERROR("Dispute not found");
    const resolved = await this.repo.resolve(disputeId, resolution, userId);
    if (action === "no_show_penalty") {
      await this.repo.createNoShowPenalty({ bookingId: dispute.bookingId, amount: 500, status: "applied", appliedAt: new Date() });
    }
    return resolved;
  }

  async fileDamageClaim(userId, data) {
    const { disputeId, groundId, description, damageType, estimatedCost, images } = data;
    if (!groundId || !description || !damageType) throw new error.NOTFOUNDERROR("groundId, description, and damageType are required");
    return await this.repo.createDamageClaim({
      disputeId: disputeId || null, groundId, reportedById: userId, description, damageType,
      estimatedCost: estimatedCost || null, images: images || null,
    });
  }
}
