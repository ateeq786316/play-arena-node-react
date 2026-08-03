import { createClient } from "./src/client.js";

for (const email of ["e2e.player.a@example.com", "e2e.owner@example.com", "e2e.j1.signup@example.com"]) {
  const c = createClient();
  const { res, body } = await c.json("POST", "/api/user/login", { body: { email, password: "Fal@2021" } });
  console.log(email.padEnd(32), "login:", res.status, body?.message ?? "");
}
