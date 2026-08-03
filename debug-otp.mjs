import { chromium } from "@playwright/test";
import { injectSession, setLocalStorage } from "../tests/e2e/src/browser.js";
import { createClient } from "../tests/e2e/src/client.js";
import { queryOne } from "../tests/e2e/src/db.js";

const email = "e2e.j1.signup@example.com";

const client = createClient();
const login = await client.json("POST", "/api/user/login", { body: { email, password: "E2e#pass1" } });
console.log("login status:", login.res.status, "cookies:", client.jar.header());

const otp = await queryOne('SELECT "otpCode", "isVerified" FROM users WHERE email = $1', [email]);
console.log("otp:", otp.otpCode, "verified:", otp.isVerified);

const browser = await chromium.launch();
const page = await browser.newPage();
await setLocalStorage(page, "pendingEmail", email);
await injectSession(page, client.jar);
let resp;
try {
  resp = await page.goto("http://localhost:3001/verify-otp", { waitUntil: "domcontentloaded", timeout: 90000 });
} catch (e) {
  console.log("goto error:", e.message.split("\n")[0]);
}
console.log("final url:", page.url());
console.log("http status:", resp?.status());
const html = await page.content();
console.log("body text snippet:", (await page.textContent("body"))?.slice(0, 200));
console.log("has otp input:", !!(await page.locator('input[placeholder="000000"]').count()));
console.log("has heading:", await page.getByRole("heading").allTextContents().catch(() => []));
await browser.close();
