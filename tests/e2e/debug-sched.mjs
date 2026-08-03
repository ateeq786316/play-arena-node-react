import { createClient } from "./src/client.js";
import { queryOne } from "./src/db.js";

const client = createClient();
await client.json("POST", "/api/user/login", { body: { email: "e2e.owner@example.com", password: "E2e#pass1" } });

const ground = await queryOne('SELECT id FROM grounds WHERE name = $1 AND "deletedAt" IS NULL ORDER BY "createdAt" ASC LIMIT 1', ["E2E Cricket Ground"]);
console.log("ground:", ground.id);

const { res, body } = await client.json("PUT", `/api/grounds/${ground.id}/schedules/1`, {
  body: { openTime: "08:00", closeTime: "23:00", slotDuration: 60 },
});
console.log("status:", res.status);
console.log("body:", JSON.stringify(body));
