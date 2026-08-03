import { API_URL } from "./config.js";
import { createClient } from "./client.js";

export async function loginAs(email, password) {
  const client = createClient();
  const { res, body } = await client.json("POST", "/api/user/login", {
    body: { email, password },
  });
  if (res.status !== 200) {
    throw new Error(`login as ${email} failed: ${res.status} ${JSON.stringify(body)}`);
  }
  return client.jar;
}

export async function injectSession(page, jar) {
  const cookie = jar.header();
  const pairs = cookie.split("; ").filter(Boolean);
  const ctx = page.context();
  const cookies = pairs.map((pair) => {
    const [name, ...rest] = pair.split("=");
    return {
      name,
      value: rest.join("="),
      domain: new URL(API_URL).hostname,
      path: "/",
      httpOnly: true,
    };
  });
  await ctx.addCookies(cookies);
}

export async function setLocalStorage(page, key, value) {
  await page.addInitScript(
    ([k, v]) => {
      localStorage.setItem(k, v);
    },
    [key, value]
  );
}

export async function loginViaUi(page, { email, password }) {
  await page.goto("/login");
  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);
  await page.click('button[type="submit"]');
}
