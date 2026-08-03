import { query, queryOne, count } from "./db.js";
import { SEED_BASELINE } from "./config.js";

export async function seedBaseline() {
  const plans = await count("subscription_plans");
  const settings = await count("platform_settings");
  return { subscriptionPlans: plans, platformSettings: settings };
}

export function assertSeedBaseline(baseline) {
  const errors = [];
  if (baseline.subscriptionPlans !== SEED_BASELINE.subscriptionPlans) {
    errors.push(`subscription_plans=${baseline.subscriptionPlans}, expected ${SEED_BASELINE.subscriptionPlans}`);
  }
  if (baseline.platformSettings !== SEED_BASELINE.platformSettings) {
    errors.push(`platform_settings=${baseline.platformSettings}, expected ${SEED_BASELINE.platformSettings}`);
  }
  return errors;
}

export async function snapshotDomainState() {
  const [grounds, bookings, teams] = await Promise.all([
    count("grounds"),
    count("bookings"),
    count("teams"),
  ]);
  return { grounds, bookings, teams };
}

export async function preservationCheck({ label = "check" } = {}) {
  const baseline = await seedBaseline();
  const errors = assertSeedBaseline(baseline);
  if (errors.length > 0) {
    throw new Error(`PRESERVATION VIOLATION (${label}): seed baseline changed — ${errors.join("; ")}`);
  }
  return baseline;
}

export async function assertRow(table, whereSql, params) {
  const row = await queryOne(`SELECT * FROM ${table} WHERE ${whereSql} LIMIT 1`, params);
  return row;
}

export async function rowCount(table, whereSql = "TRUE", params = []) {
  return count(table, `WHERE ${whereSql}`, params);
}
