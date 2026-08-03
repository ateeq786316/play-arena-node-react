import SubscriptionService from "./subscription.service.js";

export default class SubscriptionController {
  constructor() {
    this.service = new SubscriptionService();
  }

  async listPlans(req, res) {
    const result = await this.service.listPlans();
    res.status(200).json(result);
  }

  async mySubscription(req, res) {
    const result = await this.service.mySubscription(req.userId);
    res.status(200).json(result);
  }

  async upgrade(req, res) {
    const { planId } = req.body;
    const result = await this.service.upgrade(req.userId, planId);
    res.status(201).json({ message: "Upgrade requested. Awaiting payment confirmation.", ...result });
  }

  async downgrade(req, res) {
    const { planId } = req.body;
    const subscription = await this.service.downgrade(req.userId, planId);
    res.status(200).json({ message: "Plan downgraded.", subscription });
  }

  async cancel(req, res) {
    const result = await this.service.cancel(req.userId);
    res.status(200).json({ message: "Subscription cancelled.", subscription: result });
  }

  async getInvoices(req, res) {
    const result = await this.service.getInvoices(req.userId);
    res.status(200).json(result);
  }

  async confirmPayment(req, res) {
    const subscription = await this.service.confirmPayment(req.params.id, req.userId);
    res.status(200).json({ message: "Payment confirmed. Subscription activated.", subscription });
  }

  async listExpiring(req, res) {
    const { days } = req.query;
    const subscriptions = await this.service.listExpiring(days);
    res.status(200).json({ subscriptions });
  }
}
