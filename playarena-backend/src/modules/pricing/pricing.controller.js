import PricingService from "./pricing.service.js";

export default class PricingController {
  constructor() {
    this.service = new PricingService();
  }

  async createRule(req, res) {
    const rule = await this.service.createRule(req.userId, req.body);
    res.status(201).json({ message: "Pricing rule created", rule });
  }

  async getRules(req, res) {
    const result = await this.service.getRules(req.params.groundId, req.userId);
    res.status(200).json(result);
  }

  async updateRule(req, res) {
    const rule = await this.service.updateRule(req.params.id, req.userId, req.body);
    res.status(200).json({ message: "Pricing rule updated", rule });
  }

  async deleteRule(req, res) {
    await this.service.deleteRule(req.params.id, req.userId);
    res.status(200).json({ message: "Pricing rule deleted" });
  }

  async createHoliday(req, res) {
    const holiday = await this.service.createHoliday(req.userId, req.body);
    res.status(201).json({ message: "Holiday pricing created", holiday });
  }

  async deleteHoliday(req, res) {
    await this.service.deleteHoliday(req.params.id, req.userId);
    res.status(200).json({ message: "Holiday pricing deleted" });
  }

  async createCoupon(req, res) {
    const coupon = await this.service.createCoupon(req.userId, req.body);
    res.status(201).json({ message: "Coupon created", coupon });
  }

  async getCoupons(req, res) {
    const coupons = await this.service.getCoupons(req.params.groundId, req.userId);
    res.status(200).json({ coupons });
  }

  async validateCoupon(req, res) {
    const { code, bookingAmount } = req.body;
    const result = await this.service.validateCoupon(code, bookingAmount);
    res.status(200).json(result);
  }

  async pricePreview(req, res) {
    const { groundId, courtId, date, startTime, endTime } = req.query;
    const result = await this.service.pricePreview(groundId, courtId, date, startTime, endTime);
    res.status(200).json(result);
  }
}
