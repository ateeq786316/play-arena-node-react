import { journey } from "../src/journey.js";
import { createClient, ApiClient } from "../src/client.js";
import { API_URL } from "../src/config.js";
import { ensureAccountRaw } from "../src/bootstrap.js";
import { query, queryOne } from "../src/db.js";
import { setLocalStorage } from "../src/browser.js";
import { assertStatus, assertEnvelope, assertOk2xx, assert401 } from "../src/contract.js";
import jwt from "jsonwebtoken";

const SIGNUP = {
  name: "E2E Journey One",
  email: "e2e.j1.signup@example.com",
  password: "E2e#pass1",
  mobile: "+92111111111",
};

journey("J1 Auth & Onboarding", {
  beforeAll: async (ctx) => {
    ctx.updatedName = "E2E Journey One Updated";
  },
  steps: [
    {
      title: "register creates unverified user row + cookies",
      run: async (ctx) => {
        const client = createClient();
        const { res, body } = await client.json("POST", "/api/user/register", {
          body: {
            name: SIGNUP.name,
            email: SIGNUP.email,
            password: SIGNUP.password,
            mobile: SIGNUP.mobile,
          },
        });
        if (res.status === 201) {
          assertEnvelope(res, body, { path: "register", context: SIGNUP.email });
          if (body.user.isVerified !== false) throw new Error("new user should be isVerified=false");
          if (body.user.email !== SIGNUP.email) throw new Error("user.email mismatch");
          if (!client.jar.has("accessToken")) throw new Error("register did not set accessToken cookie");
          ctx.created = true;
        } else if (res.status === 409 || res.status === 400) {
          const result = await ensureAccountRaw({
            email: SIGNUP.email,
            password: SIGNUP.password,
            name: SIGNUP.name,
            mobile: SIGNUP.mobile,
          });
          ctx.created = false;
          ctx.signupClient = new ApiClient({ baseUrl: API_URL, jar: result.jar });
        } else {
          throw new Error(`register unexpected status ${res.status}: ${JSON.stringify(body)}`);
        }
        ctx.signupClient = ctx.signupClient ?? client;
        ctx.signupEmail = SIGNUP.email;

        const user = await queryOne("SELECT * FROM users WHERE email = $1", [SIGNUP.email]);
        if (!user) throw new Error("no users row after register");
        if (user.authProvider !== "local") throw new Error(`authProvider=${user.authProvider}, expected local`);
        if (user.role !== "player") throw new Error(`role=${user.role}, expected player`);
        ctx.userId = user.id;
        ctx.userVerified = user.isVerified;
      },
    },
    {
      title: "verify OTP through the UI (localStorage.pendingEmail)",
      ui: true,
      run: async (ctx, { page }) => {
        if (ctx.userVerified) {
          console.log("  (account already verified — re-run; UI OTP skipped)");
          return;
        }
        const otpRow = await queryOne("SELECT \"otpCode\" FROM users WHERE email = $1", [ctx.signupEmail]);
        if (!otpRow?.otpCode) throw new Error("no otpCode row for signup email");

        await setLocalStorage(page, "pendingEmail", ctx.signupEmail);
        await page.goto("/verify-otp");
        await page.fill('input[placeholder="000000"]', otpRow.otpCode);
        await Promise.all([
          page.waitForURL((url) => !url.pathname.startsWith("/verify-otp"), { timeout: 20_000 }),
          page.click('button[type="submit"]'),
        ]);

        const user = await queryOne("SELECT \"isVerified\", \"otpCode\" FROM users WHERE email = $1", [ctx.signupEmail]);
        if (user.isVerified !== true) throw new Error("isVerified not true after OTP");
        if (user.otpCode !== null) throw new Error("otpCode not cleared after OTP");
        ctx.userVerified = true;
      },
    },
    {
      title: "login returns user + cookies, no new row",
      run: async (ctx) => {
        const client = createClient();
        const { res, body } = await client.json("POST", "/api/user/login", {
          body: { email: ctx.signupEmail, password: SIGNUP.password },
        });
        assertEnvelope(res, body, { path: "login", context: ctx.signupEmail });
        if (body.user.email !== ctx.signupEmail) throw new Error("login user.email mismatch");
        if (!client.jar.has("accessToken")) throw new Error("login did not set accessToken");
        const n = (await queryOne("SELECT COUNT(*)::int AS n FROM users WHERE email = $1", [ctx.signupEmail])).n;
        if (n !== 1) throw new Error(`user row count = ${n}, expected 1`);
        ctx.client = client;
      },
    },
    {
      title: "GET /api/user/profile returns the user",
      run: async (ctx) => {
        const { res, body } = await ctx.client.json("GET", "/api/user/profile");
        assertEnvelope(res, body, { path: "profile" });
        if (body.user.id !== ctx.userId) throw new Error("profile user.id mismatch");
      },
    },
    {
      title: "PATCH /api/user/profile updates name in DB",
      run: async (ctx) => {
        const { res, body } = await ctx.client.json("PATCH", "/api/user/profile", {
          body: { name: ctx.updatedName },
        });
        assertEnvelope(res, body, { path: "profile PATCH" });
        const user = await queryOne("SELECT name FROM users WHERE email = $1", [ctx.signupEmail]);
        if (user.name !== ctx.updatedName) throw new Error(`DB name=${user.name}, expected ${ctx.updatedName}`);
      },
    },
    {
      title: "logout clears cookies; protected call then 401s",
      run: async (ctx) => {
        const { res, body } = await ctx.client.json("POST", "/api/user/logout", {});
        assertOk2xx(res, { path: "logout" });
        if (ctx.client.jar.has("accessToken")) throw new Error("accessToken cookie not cleared");
        const { res: res2 } = await ctx.client.json("GET", "/api/user/profile");
        assertStatus(res2, 401, { path: "profile after logout" });
      },
    },
    {
      title: "protected route 401s without any cookie",
      run: async () => {
        const anon = createClient();
        const { res, body } = await anon.json("GET", "/api/bookings/my");
        assert401(res, body, { path: "bookings/my" });
      },
    },
    {
      title: "login with wrong password is 401",
      run: async (ctx) => {
        const client = createClient();
        const { res, body } = await client.json("POST", "/api/user/login", {
          body: { email: ctx.signupEmail, password: "Wrong#12" },
        });
        assertStatus(res, 401, { path: "login wrong password" });
        if (!body?.message) throw new Error("expected message on failed login");
      },
    },
    {
      title: "duplicate register is rejected, no second row",
      run: async (ctx) => {
        const client = createClient();
        const { res } = await client.json("POST", "/api/user/register", {
          body: { name: SIGNUP.name, email: ctx.signupEmail, password: SIGNUP.password, mobile: SIGNUP.mobile },
        });
        if (!(res.status === 409 || res.status === 400)) {
          throw new Error(`duplicate register expected 409/400, got ${res.status}`);
        }
        const n = (await queryOne("SELECT COUNT(*)::int AS n FROM users WHERE email = $1", [ctx.signupEmail])).n;
        if (n !== 1) throw new Error(`user row count = ${n}, expected 1`);
      },
    },
    {
      title: "forgot-password returns 200",
      run: async (ctx) => {
        const client = createClient();
        const { res, body } = await client.json("POST", "/api/user/forgot-password", {
          body: { email: ctx.signupEmail },
        });
        assertEnvelope(res, body, { path: "forgot-password" });
      },
    },
    {
      title: "reset-password token flow changes the password hash",
      run: async (ctx) => {
        const { ACCESS_TOKEN_SECRET } = await import("../src/config.js");
        const before = await queryOne("SELECT password FROM users WHERE email = $1", [ctx.signupEmail]);
        const token = jwt.sign({ id: ctx.userId }, ACCESS_TOKEN_SECRET, { expiresIn: "10m" });

        const client = createClient();
        const { res: res1, body: body1 } = await client.json("GET", `/api/user/reset-password/${token}`);
        assertOk2xx(res1, { path: "reset-password/:token" });
        if (body1.userId !== ctx.userId) throw new Error("reset token userId mismatch");

        const newPassword = "E2e#new1";
        const { res: res2, body: body2 } = await client.json("POST", "/api/user/reset-password/confirm", {
          body: { token, password: newPassword },
        });
        assertOk2xx(res2, { path: "reset-password/confirm" });

        const after = await queryOne("SELECT password FROM users WHERE email = $1", [ctx.signupEmail]);
        if (before.password === after.password) throw new Error("password hash did not change");
      },
    },
  ],
});
