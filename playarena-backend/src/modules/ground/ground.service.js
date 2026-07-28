import GroundRepo from "../../repository/ground.repo.js";
import * as error from "../../shared/error/globalError.js";

export default class GroundService {
  constructor() {
    this.repo = new GroundRepo();
  }

  async createGround(userId, data) {
    const { name } = data;
    if (!name) throw new error.NOTFOUNDERROR("Ground name is required");

    const ground = await this.repo.create({ ownerId: userId, ...data });

    await this.repo.createAccess({
      groundId: ground.id,
      userId,
      accessRole: "owner",
    });

    await this.repo.upsertSetting(ground.id, {});

    return ground;
  }

  async getGroundById(id) {
    const ground = await this.repo.findById(id);
    if (!ground) throw new error.NOTFOUNDERROR("Ground not found");
    return ground;
  }

  async listGrounds(filters = {}) {
    return await this.repo.findAll(filters);
  }

  async listFeaturedGrounds(limit = 10) {
    return await this.repo.findFeatured(limit);
  }

  async listMyGrounds(userId) {
    return await this.repo.findManagedByUser(userId);
  }

  async updateGround(groundId, userId, data) {
    await this.checkOwnerAccess(groundId, userId);
    return await this.repo.update(groundId, data);
  }

  async deleteGround(groundId, userId) {
    await this.checkOwnerAccess(groundId, userId);
    return await this.repo.softDelete(groundId);
  }

  async createCourt(groundId, userId, data) {
    await this.checkManagerAccess(groundId, userId);
    return await this.repo.createCourt({ groundId, ...data });
  }

  async listCourts(groundId) {
    const ground = await this.repo.findById(groundId);
    if (!ground) throw new error.NOTFOUNDERROR("Ground not found");
    return await this.repo.findCourtsByGround(groundId);
  }

  async updateCourt(courtId, userId, data) {
    const court = await this.repo.findCourtById(courtId);
    if (!court) throw new error.NOTFOUNDERROR("Court not found");
    await this.checkManagerAccess(court.groundId, userId);
    return await this.repo.updateCourt(courtId, data);
  }

  async deleteCourt(courtId, userId) {
    const court = await this.repo.findCourtById(courtId);
    if (!court) throw new error.NOTFOUNDERROR("Court not found");
    await this.checkManagerAccess(court.groundId, userId);
    return await this.repo.softDeleteCourt(courtId);
  }

  async upsertSchedule(groundId, userId, dayOfWeek, data) {
    await this.checkManagerAccess(groundId, userId);
    return await this.repo.upsertSchedule(groundId, dayOfWeek, data);
  }

  async listSchedules(groundId) {
    const ground = await this.repo.findById(groundId);
    if (!ground) throw new error.NOTFOUNDERROR("Ground not found");
    return await this.repo.findSchedulesByGround(groundId);
  }

  async deleteSchedule(groundId, userId, dayOfWeek) {
    await this.checkManagerAccess(groundId, userId);
    return await this.repo.deleteSchedule(groundId, dayOfWeek);
  }

  async updateSetting(groundId, userId, data) {
    await this.checkOwnerAccess(groundId, userId);
    return await this.repo.upsertSetting(groundId, { ...data, updatedById: userId });
  }

  async listRegions() {
    return await this.repo.findRegions();
  }

  async addImage(groundId, userId, data) {
    await this.checkManagerAccess(groundId, userId);
    return await this.repo.addImage({ groundId, ...data });
  }

  async removeImage(imageId, groundId, userId) {
    await this.checkManagerAccess(groundId, userId);
    return await this.repo.removeImage(imageId);
  }

  async inviteStaff(groundId, userId, data) {
    await this.checkOwnerAccess(groundId, userId);
    return await this.repo.createInvite({ groundId, ...data });
  }

  async checkOwnerAccess(groundId, userId) {
    const access = await this.repo.findAccess(groundId, userId);
    if (!access || access.accessRole !== "owner") {
      throw new error.UNAUTHORIZED("Only ground owner can perform this action");
    }
    return access;
  }

  async checkManagerAccess(groundId, userId) {
    const access = await this.repo.findAccess(groundId, userId);
    if (!access || (access.accessRole !== "owner" && access.accessRole !== "manager")) {
      throw new error.UNAUTHORIZED("Only ground owner or manager can perform this action");
    }
    return access;
  }
}
