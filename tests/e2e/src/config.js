import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.resolve(__dirname, "../../../playarena-backend");
const ENV_FILE = path.join(BACKEND_ROOT, ".env");

function loadBackendEnv() {
  if (!fs.existsSync(ENV_FILE)) return {};
  const out = {};
  for (const rawLine of fs.readFileSync(ENV_FILE, "utf8").split("\n")) {
    const line = rawLine.trim().replace(/\r$/, "");
    const m = line.match(/^([A-Za-z0-9_]+)="?(.*?)"?$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const env = loadBackendEnv();

export const API_URL = process.env.E2E_API_URL ?? "http://localhost:3000";
export const FRONTEND_URL = process.env.E2E_FRONTEND_URL ?? "http://localhost:3001";
export const DATABASE_URL = process.env.E2E_DATABASE_URL ?? env.DATABASE_URL;
export const ACCESS_TOKEN_SECRET = process.env.E2E_ACCESS_TOKEN_SECRET ?? env.ACCESSTOKEN;

export const CREDENTIALS = {
  password: process.env.E2E_PASSWORD ?? "Fal@2021",
  mobile: "+92111111111",
};

export const SEED_BASELINE = {
  subscriptionPlans: 3,
  platformSettings: 4,
};

export const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  max: 500,
};

export const IDENTITIES = [
  { alias: "PLAYER_A", name: "E2E Player A", email: "e2e.player.a@example.com", role: "player", fixedIds: [] },
  { alias: "PLAYER_B", name: "E2E Player B", email: "e2e.player.b@example.com", role: "player", fixedIds: [] },
  { alias: "OWNER", name: "E2E Ground Owner", email: "e2e.owner@example.com", role: "owner", fixedIds: ["ground:E2E Cricket Ground", "court:E2E Court 1"] },
  { alias: "STAFF", name: "E2E Staff", email: "e2e.staff@example.com", role: "staff", fixedIds: [] },
  { alias: "ADMIN", name: "E2E Admin", email: "e2e.admin@example.com", role: "admin", fixedIds: [] },
  { alias: "SUPER_ADMIN", name: "E2E Super Admin", email: "e2e.superadmin@example.com", role: "super_admin", fixedIds: [] },
];

export function identity(alias) {
  const found = IDENTITIES.find((i) => i.alias === alias);
  if (!found) throw new Error(`Unknown identity alias: ${alias}`);
  return { ...found, password: CREDENTIALS.password, mobile: CREDENTIALS.mobile };
}

export function identityByEmail(email) {
  const found = IDENTITIES.find((i) => i.email === email);
  if (!found) throw new Error(`Unknown identity email: ${email}`);
  return { ...found, password: CREDENTIALS.password, mobile: CREDENTIALS.mobile };
}

if (!DATABASE_URL) {
  throw new Error("E2E_DATABASE_URL not set and no DATABASE_URL in playarena-backend/.env");
}
