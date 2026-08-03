import { createClient } from "./src/client.js";
import { query } from "./src/db.js";

const client = createClient();
const login = await client.json("POST", "/api/user/login", { body: { email: "e2e.owner@example.com", password: "E2e#pass1" } });
console.log("owner login:", login.res.status);
const me = await client.json("GET", "/api/user/profile");
const ownerId = me.body.user.id;
console.log("ownerId:", ownerId);

const grounds = await query('SELECT id, name, "ownerId" FROM grounds WHERE name = $1 AND "deletedAt" IS NULL ORDER BY "createdAt" ASC', ["E2E Cricket Ground"]);
console.log("grounds named E2E Cricket Ground:");
for (const g of grounds) console.log("  ", g.id, g.name, "owner:", g.ownerId, g.ownerId === ownerId ? "(ours)" : "(other)");

const mine = grounds.find((g) => g.ownerId === ownerId);
if (mine) {
  const { res, body } = await client.json("PUT", `/api/grounds/${mine.id}/schedules/1`, {
    body: { openTime: "08:00", closeTime: "23:00", slotDuration: 60 },
  });
  console.log("upsert status on ours:", res.status);
  console.log("body:", JSON.stringify(body));
}
