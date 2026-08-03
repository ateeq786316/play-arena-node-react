import prisma from "../database/db.js";

const VALID_STATUSES = ["active", "trial"];

export function requirePlan(...features) {
  return async (req, res, next) => {
    try {
      const subscription = await prisma.groundOwnerSubscription.findUnique({
        where: { groundOwnerId: req.userId },
        include: { plan: true },
      });

      if (!subscription || !VALID_STATUSES.includes(subscription.status)) {
        return res.status(403).json({ message: "Active subscription required" });
      }

      const planFeatures = subscription.plan.features || {};
      const missing = features.filter((f) => !planFeatures[f]);

      if (missing.length) {
        return res.status(403).json({
          message: `Your plan does not include: ${missing.join(", ")}`,
          requiredFeatures: missing,
        });
      }

      req.subscription = subscription;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function limitByPlan(groundOwnerId, field) {
  return async (req, res, next) => {
    try {
      const subscription = await prisma.groundOwnerSubscription.findUnique({
        where: { groundOwnerId },
        include: { plan: true },
      });

      if (!subscription || subscription.status !== "active") {
        return res.status(403).json({ message: "Active subscription required" });
      }

      const limit = subscription.plan[field];
      if (limit == null) return next();

      const count = await prisma.ground.count({ where: { ownerId: groundOwnerId } });
      if (count >= limit) {
        return res.status(403).json({ message: `Plan limit reached (max ${limit} ${field.replace("max", "").toLowerCase()})` });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
