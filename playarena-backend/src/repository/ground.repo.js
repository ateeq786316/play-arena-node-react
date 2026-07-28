import prisma from "../database/db.js";

export default class GroundRepo {
  async create(data) {
    return await prisma.ground.create({
      data: {
        ownerId: data.ownerId,
        name: data.name,
        address: data.address,
        cityId: data.cityId,
        regionId: data.regionId,
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description,
        contactPhone: data.contactPhone,
      },
      include: { setting: true },
    });
  }

  async findById(id) {
    return await prisma.ground.findUnique({
      where: { id, deletedAt: null },
      include: {
        setting: true,
        images: { orderBy: { displayOrder: "asc" } },
        courts: { where: { isActive: true, deletedAt: null } },
        schedules: { where: { isActive: true } },
      },
    });
  }

  async findAll(filters = {}) {
    const where = { deletedAt: null, ...filters };
    return await prisma.ground.findMany({
      where,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        courts: { where: { isActive: true, deletedAt: null }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findFeatured(limit = 10) {
    return await prisma.ground.findMany({
      where: { isVerified: true, isActive: true, deletedAt: null },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  async findManagedByUser(userId) {
    return await prisma.ground.findMany({
      where: {
        deletedAt: null,
        OR: [
          { ownerId: userId },
          { access: { some: { userId, isActive: true } } },
        ],
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        access: { where: { userId, isActive: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id, data) {
    return await prisma.ground.update({
      where: { id },
      data,
    });
  }

  async softDelete(id) {
    return await prisma.ground.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async findAccess(groundId, userId) {
    return await prisma.groundAccess.findUnique({
      where: { groundId_userId: { groundId, userId } },
    });
  }

  async createAccess(data) {
    return await prisma.groundAccess.create({ data });
  }

  async updateAccess(id, data) {
    return await prisma.groundAccess.update({ where: { id }, data });
  }

  async findInviteById(id) {
    return await prisma.groundInvite.findUnique({ where: { id } });
  }

  async createInvite(data) {
    return await prisma.groundInvite.create({ data });
  }

  async updateInvite(id, data) {
    return await prisma.groundInvite.update({ where: { id }, data });
  }

  async createCourt(data) {
    return await prisma.court.create({ data });
  }

  async findCourtById(id) {
    return await prisma.court.findUnique({
      where: { id, deletedAt: null },
      include: { ground: true },
    });
  }

  async findCourtsByGround(groundId) {
    return await prisma.court.findMany({
      where: { groundId, isActive: true, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });
  }

  async updateCourt(id, data) {
    return await prisma.court.update({ where: { id }, data });
  }

  async softDeleteCourt(id) {
    return await prisma.court.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async upsertSchedule(groundId, dayOfWeek, data) {
    return await prisma.groundSchedule.upsert({
      where: { groundId_dayOfWeek: { groundId, dayOfWeek } },
      create: { groundId, dayOfWeek, ...data },
      update: data,
    });
  }

  async findSchedulesByGround(groundId) {
    return await prisma.groundSchedule.findMany({
      where: { groundId, isActive: true },
      orderBy: { dayOfWeek: "asc" },
    });
  }

  async deleteSchedule(groundId, dayOfWeek) {
    return await prisma.groundSchedule.update({
      where: { groundId_dayOfWeek: { groundId, dayOfWeek } },
      data: { isActive: false },
    });
  }

  async upsertSetting(groundId, data) {
    return await prisma.groundSetting.upsert({
      where: { groundId },
      create: { groundId, ...data },
      update: data,
    });
  }

  async addImage(data) {
    return await prisma.groundImage.create({ data });
  }

  async removeImage(id) {
    return await prisma.groundImage.delete({ where: { id } });
  }

  async findImagesByGround(groundId) {
    return await prisma.groundImage.findMany({
      where: { groundId },
      orderBy: { displayOrder: "asc" },
    });
  }

  async findRegions() {
    return await prisma.region.findMany({
      where: { isActive: true },
      include: { cities: { where: { isActive: true }, orderBy: { displayOrder: "asc" } } },
      orderBy: { name: "asc" },
    });
  }

  async findCitiesByRegion(regionId) {
    return await prisma.city.findMany({
      where: { regionId, isActive: true },
      orderBy: { displayOrder: "asc" },
    });
  }
}
