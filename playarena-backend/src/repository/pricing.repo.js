import prisma from "../database/db.js";

export default class PricingRepo {
  async createRule(data) {
    return await prisma.pricingRule.create({ data });
  }

  async findRulesByGround(groundId) {
    return await prisma.pricingRule.findMany({
      where: { groundId },
      orderBy: { priority: "asc" },
    });
  }

  async findRuleById(id) {
    return await prisma.pricingRule.findUnique({ where: { id } });
  }

  async updateRule(id, data) {
    return await prisma.pricingRule.update({ where: { id }, data });
  }

  async deleteRule(id) {
    return await prisma.pricingRule.delete({ where: { id } });
  }

  async createHoliday(data) {
    return await prisma.holidayPricing.create({ data });
  }

  async findHolidaysByGround(groundId) {
    return await prisma.holidayPricing.findMany({ where: { groundId }, orderBy: { date: "asc" } });
  }

  async deleteHoliday(id) {
    return await prisma.holidayPricing.delete({ where: { id } });
  }

  async createCoupon(data) {
    return await prisma.coupon.create({ data });
  }

  async findCouponsByGround(groundId) {
    return await prisma.coupon.findMany({ where: { groundId }, orderBy: { createdAt: "desc" } });
  }

  async findCouponByCode(code) {
    return await prisma.coupon.findUnique({ where: { code } });
  }

  async updateCoupon(id, data) {
    return await prisma.coupon.update({ where: { id }, data });
  }

  async createCouponUsage(data) {
    return await prisma.couponUsage.create({ data });
  }

  async getApplicableRules(groundId, dayOfWeek) {
    return await prisma.pricingRule.findMany({
      where: { groundId, isActive: true, OR: [{ dayOfWeek }, { dayOfWeek: null }] },
      orderBy: { priority: "asc" },
    });
  }
}
