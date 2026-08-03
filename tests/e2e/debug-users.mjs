import { query } from "./src/db.js";

const rows = await query(
  'SELECT email, "createdAt", "updatedAt", "refreshToken" IS NOT NULL AS has_refresh FROM users WHERE email IN ($1,$2,$3,$4) ORDER BY "createdAt"',
  ["e2e.player.a@example.com", "e2e.owner@example.com", "e2e.staff@example.com", "e2e.j1.signup@example.com"]
);
for (const r of rows) {
  console.log(r.email.padEnd(34), "created:", r.createdAt.toISOString(), "updated:", r.updatedAt.toISOString(), "refresh:", r.has_refresh);
}
