import { createClient } from "./src/client.js";
import { queryOne } from "./src/db.js";

const ground = await queryOne('SELECT id FROM grounds WHERE name = $1 AND "isVerified" = true ORDER BY "createdAt" DESC LIMIT 1', ["E2E Cricket Ground"]);
const court = await queryOne('SELECT id FROM courts WHERE "groundId" = $1 ORDER BY "createdAt" ASC LIMIT 1', [ground.id]);
const date = await queryOne("SELECT ($1::date + 7)::text AS d", [new Date().toISOString().slice(0, 10)]);
console.log("ground:", ground.id, "court:", court.id, "date:", date.d);

const c = createClient();
const { res, body } = await c.json("GET", `/api/pricing/preview?groundId=${ground.id}&courtId=${court.id}&date=${date.d}&startTime=10:00&endTime=12:00`);
console.log("status:", res.status);
console.log("body:", JSON.stringify(body));
