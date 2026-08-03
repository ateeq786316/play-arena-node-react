import prisma from "../src/database/db.js";

const plans = [
  {
    name: "Free",
    price: 0,
    interval: "monthly",
    maxGrounds: 1,
    maxCourtsPerGround: 2,
    maxBookingsPerMonth: null,
    commissionRate: 0.1,
    analyticsRetentionDays: 7,
    features: { analytics: true, crm: false, advanced_reports: false },
    isActive: true,
    sortOrder: 0,
  },
  {
    name: "Starter",
    price: 5000,
    interval: "monthly",
    maxGrounds: 3,
    maxCourtsPerGround: 5,
    maxBookingsPerMonth: 300,
    commissionRate: 0.05,
    analyticsRetentionDays: 30,
    features: { analytics: true, crm: true, advanced_reports: false },
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Professional",
    price: 15000,
    interval: "monthly",
    maxGrounds: -1,
    maxCourtsPerGround: -1,
    maxBookingsPerMonth: null,
    commissionRate: 0.02,
    analyticsRetentionDays: 365,
    features: { analytics: true, crm: true, advanced_reports: true },
    isActive: true,
    sortOrder: 2,
  },
];

const settings = [
  { key: "trial_enabled", value: "true" },
  { key: "trial_duration_days", value: "14" },
  { key: "variance_threshold", value: "500" },
  { key: "retention_grace_days", value: "0" },
];

async function main() {
  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      create: plan,
      update: plan,
    });
  }
  for (const setting of settings) {
    await prisma.platformSetting.upsert({
      where: { key: setting.key },
      create: setting,
      update: setting,
    });
  }
  console.log(`Seeded ${plans.length} subscription plans and ${settings.length} platform settings`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
