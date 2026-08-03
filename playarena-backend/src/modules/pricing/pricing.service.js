import PricingRepo from "../../repository/pricing.repo.js";
import GroundRepo from "../../repository/ground.repo.js";
import * as error from "../../shared/error/globalError.js";

export default class PricingService {
  constructor() {
    this.repo = new PricingRepo();
    this.groundRepo = new GroundRepo();
  }

  async createRule(userId, data) {
    await this._checkOwnerAccess(data.groundId, userId);
    return await this.repo.createRule(data);
  }

  async getRules(groundId, userId) {
    await this._checkOwnerAccess(groundId, userId);
    const [rules, holidays] = await Promise.all([
      this.repo.findRulesByGround(groundId),
      this.repo.findHolidaysByGround(groundId),
    ]);
    return { rules, holidays };
  }

  async updateRule(ruleId, userId, data) {
    const rule = await this.repo.findRuleById(ruleId);
    if (!rule) throw new error.NOTFOUNDERROR("Pricing rule not found");
    await this._checkOwnerAccess(rule.groundId, userId);
    return await this.repo.updateRule(ruleId, data);
  }

  async deleteRule(ruleId, userId) {
    const rule = await this.repo.findRuleById(ruleId);
    if (!rule) throw new error.NOTFOUNDERROR("Pricing rule not found");
    await this._checkOwnerAccess(rule.groundId, userId);
    return await this.repo.deleteRule(ruleId);
  }

  async createHoliday(userId, data) {
    await this._checkOwnerAccess(data.groundId, userId);
    return await this.repo.createHoliday(data);
  }

  async deleteHoliday(holidayId, userId) {
    const holiday = await this.repo.findHolidaysByGround("").then(h => h.find(hh => hh.id === holidayId));
    if (!holiday) throw new error.NOTFOUNDERROR("Holiday not found");
    return await this.repo.deleteHoliday(holidayId);
  }

  async createCoupon(userId, data) {
    await this._checkOwnerAccess(data.groundId, userId);
    const existing = await this.repo.findCouponByCode(data.code);
    if (existing) throw new error.ALLREADYEXIST("Coupon code already exists");
    return await this.repo.createCoupon(data);
  }

  async getCoupons(groundId, userId) {
    await this._checkOwnerAccess(groundId, userId);
    return await this.repo.findCouponsByGround(groundId);
  }

  async validateCoupon(code, bookingAmount) {
    const coupon = await this.repo.findCouponByCode(code);
    if (!coupon || !coupon.isActive) throw new error.NOTFOUNDERROR("Invalid or expired coupon");
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new error.UNAUTHORIZED("Coupon usage limit reached");
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) throw new error.UNAUTHORIZED("Coupon has expired");
    if (coupon.minBookingAmount && Number(bookingAmount) < Number(coupon.minBookingAmount)) {
      throw new error.UNAUTHORIZED(`Minimum booking amount is ${coupon.minBookingAmount}`);
    }
    const discount = (Number(bookingAmount) * coupon.discountPercent) / 100;
    return { valid: true, coupon, discount, finalAmount: Number(bookingAmount) - discount };
  }

  async pricePreview(groundId, courtId, date, startTime, endTime) {
    const dayOfWeek = new Date(date).getDay();
    const rules = await this.repo.getApplicableRules(groundId, dayOfWeek);
    // Check holiday override first
    const holiday = await this.repo.findHolidaysByGround(groundId).then(h =>
      h.find(hh => hh.date.toISOString().startsWith(date))
    );
    const court = await this.groundRepo.findCourtById(courtId);
    if (!court) throw new error.NOTFOUNDERROR("Court not found");
    const hours = this._hoursBetween(startTime, endTime);
    const basePrice = Number(court.pricePerHour) * hours;
    if (holiday) return { basePrice, multiplier: Number(holiday.multiplier), finalPrice: basePrice * Number(holiday.multiplier), source: "holiday" };
    const rule = rules.find(r => r.startTime && r.endTime && this._timeInRange(startTime, r.startTime, r.endTime));
    const multiplier = rule ? Number(rule.multiplier) : 1;
    return { basePrice, multiplier, finalPrice: basePrice * multiplier, source: rule ? "rule" : "base" };
  }

  _hoursBetween(start, end) {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  }

  _timeInRange(time, start, end) {
    return time >= start && time < end;
  }

  async _checkOwnerAccess(groundId, userId) {
    const ground = await this.groundRepo.findById(groundId);
    if (!ground) throw new error.NOTFOUNDERROR("Ground not found");
    if (ground.ownerId !== userId) {
      const access = await this.groundRepo.findAccess(groundId, userId);
      if (!access) throw new error.UNAUTHORIZED("Not authorized");
    }
  }
}
