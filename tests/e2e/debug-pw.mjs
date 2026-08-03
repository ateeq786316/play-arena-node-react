import { createClient } from "./src/client.js";

const emails = ["e2e.player.a@example.com", "e2e.owner@example.com", "e2e.j1.signup@example.com"];
const candidates = ["E2e#pass1", "E2e#new1", "e2e#Passw0rd!", "E2e#Pass1"];

for (const email of emails) {
  for (const pw of candidates) {
    const c = createClient();
    const { res, body } = await c.json("POST", "/api/user/login", { body: { email, password: pw } });
    if (res.status === 200) console.log(`${email}  ->  ${pw}  OK`);
    else console.log(`${email}  ->  ${pw}  ${res.status}`);
  }
}
