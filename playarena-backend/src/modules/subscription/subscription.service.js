import SubscriptionRepo from "../../repository/subscription.repo.js";
import * as error from "../../shared/error/globalError.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function planLimitLabel(field) {
  return field.replace("max", "").replace(/PerGround$/, "").toLowerCase();
}

export default class SubscriptionService {
  constructor() {
    this.repo = new SubscriptionRepo();
  }

  async listPlans() {
    const plans = await this.repo.findAllPlans(true);
    const current = null; // no user context at this point
    return { plans, current };
  }

  async mySubscription(userId) {
    const [subscription, grounds, courts, staff, settings] = await Promise.all([
      this.repo.findSubscriptionByOwner(userId),
      this.repo.countApprovedGrounds(userId),
      this.repo.countCourts(userId),
      this.repo.countStaff(userId),
      this.repo.findPlatformSettings(),
    ]);
    const plan = subscription ? subscription.plan : await this.repo.findAllPlans(true).then(plans => plans.find(p => p.name === "Free"));
    return {
      subscription: subscription || null,
      plan: plan || null,
      usage: this._buildUsage(plan, grounds, courts, staff),
      trial: this._buildTrial(subscription, settings),
    };
  }

  _buildUsage(plan, grounds, courts, staff) {
    if (!plan) return { grounds, courts, staff, groundsLimit: 0, courtsLimit: 0, staffLimit: 0 };
    return {
      grounds,
      courts,
      staff,
      groundsLimit: plan.maxGrounds ?? 0,
      courtsLimit: plan.maxCourtsPerGround ?? 0,
      staffLimit: plan.maxStaff ?? 0,
    };
  }

  _buildTrial(subscription, settings) {
    const get = (key) => (settings || []).find(s => s.key === key)?.value;
    if (get("trial_enabled") !== "true") return null;
    if (!subscription || subscription.status !== "trial") return null;
    const endsAt = new Date(subscription.currentPeriodEnd);
    return { enabled: true, endsAt: endsAt.toISOString(), daysRemaining: Math.max(0, Math.round((endsAt - Date.now()) / 86400000)) };
  }

  _resolvePlan(planId) {
    return this.repo.findPlanById(planId);
  }

  async _checkPlanLimits(plan, userId) {
    const [grounds, courts, bookings] = await Promise.all([
      this.repo.countApprovedGrounds(userId),
      this.repo.countCourts(userId),
      this.repo.countBookingsThisMonth(userId),
    ]);
    const checks = [
      { field: "maxGrounds", used: grounds },
      { field: "maxCourtsPerGround", used: courts },
      { field: "maxBookingsPerMonth", used: bookings },
    ];
    for (const { field, used } of checks) {
      const limit = plan[field];
      if (limit == null || limit < 0) continue;
      if (used > limit) {
        throw new error.FORBIDDEN(`Plan limit reached: ${planLimitLabel(field)}`);
      }
    }
  }

  async upgrade(userId, planId) {
    const plan = await this._resolvePlan(planId);
    if (!plan) throw new error.NOTFOUNDERROR("Plan not found");
    if (!plan.isActive) throw new error.UNAUTHORIZED("Plan is not available");

    const existing = await this.repo.findSubscriptionByOwner(userId);
    if (existing) {
      if (existing.plan.sortOrder >= plan.sortOrder) {
        throw new error.FORBIDDEN("Cannot downgrade. Use the downgrade action instead.");
      }
      await this._checkPlanLimits(plan, userId);
      const subscription = await this.repo.updateSubscription(existing.id, {
        planId,
        status: "pending_payment",
      });
      const invoice = await this.repo.createInvoice({
        subscriptionId: subscription.id,
        amount: plan.price,
        status: "unpaid",
        dueDate: new Date(Date.now() + 7 * DAY_MS),
      });
      return { subscription, invoice };
    }

    await this._checkPlanLimits(plan, userId);
    const subscription = await this.repo.createSubscription({
      groundOwnerId: userId,
      planId,
      status: "pending_payment",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * DAY_MS),
    });
    const invoice = await this.repo.createInvoice({
      subscriptionId: subscription.id,
      amount: plan.price,
      status: "unpaid",
      dueDate: new Date(Date.now() + 7 * DAY_MS),
    });
    return { subscription, invoice };
  }

  async downgrade(userId, planId) {
    const plan = await this._resolvePlan(planId);
    if (!plan) throw new error.NOTFOUNDERROR("Plan not found");
    if (!plan.isActive) throw new error.UNAUTHORIZED("Plan is not available");

    const existing = await this.repo.findSubscriptionByOwner(userId);
    if (!existing) throw new error.NOTFOUNDERROR("No active subscription");
    if (existing.plan.sortOrder <= plan.sortOrder) {
      throw new error.FORBIDDEN("Cannot upgrade via downgrade. Use the upgrade action instead.");
    }

    const subscription = await this.repo.updateSubscription(existing.id, { planId });
    return subscription;
  }

  async cancel(userId) {
    const sub = await this.repo.findSubscriptionByOwner(userId);
    if (!sub) throw new error.NOTFOUNDERROR("No active subscription");
    return await this.repo.updateSubscription(sub.id, {
      status: "cancelled",
      cancelledAt: new Date(),
    });
  }

  async confirmPayment(subscriptionId, adminId) {
    const sub = await this.repo.findPendingPaymentById(subscriptionId);
    if (!sub) throw new error.NOTFOUNDERROR("Subscription not found");
    if (sub.status !== "pending_payment") {
      throw new error.ALLREADYEXIST("Subscription is not awaiting payment");
    }

    const intervalMs = sub.plan.interval === "yearly" ? 365 * DAY_MS : 30 * DAY_MS;
    const now = new Date();
    const subscription = await this.repo.updateSubscription(sub.id, {
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + intervalMs),
    });

    const unpaid = await this.repo.findUnpaidInvoiceBySubscription(sub.id);
    if (unpaid) {
      await this.repo.markInvoicePaid(unpaid.id, now);
    }

    return subscription;
  }

  async listExpiring(days = 7) {
    const count = Math.max(1, parseInt(days, 10) || 7);
    return await this.repo.findSubscriptionsExpiringWithin(count);
  }

  async getInvoices(userId) {
    const sub = await this.repo.findSubscriptionByOwner(userId);
    if (!sub) return { invoices: [] };
    const invoices = await this.repo.findInvoicesBySubscription(sub.id);
    return { invoices };
  }
}
