import { ApiClient, createClient } from "./client.js";
import { identity, IDENTITIES, API_URL } from "./config.js";
import { preservationCheck } from "./preservation.js";
import { query, queryOne } from "./db.js";
import { setRoleIfDifferent } from "./roles.js";
import { assertStatus, assertOk2xx } from "./contract.js";

export async function ensureOtpVerified(client, { email }) {
  const row = await queryOne('SELECT "otpCode" FROM users WHERE email = $1', [email]);
  if (!row) throw new Error(`No user row for ${email} during OTP verify`);
  const { res, body } = await client.json("POST", "/api/user/verify-otp", {
    body: { email, otp: row.otpCode },
  });
  assertOk2xx(res, { path: "verify-otp", context: email });
  return body;
}

export async function resetPasswordToKnown({ email, password }) {
  const jwt = (await import("jsonwebtoken")).default;
  const { ACCESS_TOKEN_SECRET } = await import("./config.js");
  const user = await queryOne("SELECT id FROM users WHERE email = $1", [email]);
  if (!user) throw new Error(`Cannot reset password for missing user ${email}`);
  const token = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: "10m" });
  const client = new ApiClient({ baseUrl: API_URL });
  const { res, body } = await client.json("POST", "/api/user/reset-password/confirm", {
    body: { token, password },
  });
  assertOk2xx(res, { path: "reset-password/confirm", context: email });
  return body;
}

export async function ensureAccountRaw({ email, password, name, mobile }) {
  const client = createClient();
  const { res: loginRes, body: loginBody } = await client.json("POST", "/api/user/login", {
    body: { email, password },
  });

  let status;
  if (loginRes.status === 200) {
    status = "reused";
  } else if (loginRes.status === 404 && loginBody?.message === "user not found") {
    const { res: regRes, body: regBody } = await client.json("POST", "/api/user/register", {
      body: { name, email, password, mobile },
    });
    assertStatus(regRes, 201, { path: "register", context: email });
    await ensureOtpVerified(client, { email });
    status = "created";
  } else if (loginRes.status === 401) {
    await resetPasswordToKnown({ email, password });
    status = "password-recovered";
    const { res: reloginRes } = await client.json("POST", "/api/user/login", {
      body: { email, password },
    });
    assertStatus(reloginRes, 200, { path: "login-after-reset", context: email });
  } else {
    throw new Error(`Unexpected login status ${loginRes.status} for ${email}: ${JSON.stringify(loginBody)}`);
  }

  const profile = await client.json("GET", "/api/user/profile");
  assertStatus(profile.res, 200, { path: "profile", context: email });
  const userId = profile.body?.user?.id;
  if (!userId) throw new Error(`No user.id in profile for ${email}`);

  return { userId, jar: client.jar, status };
}

export async function ensureAccount(identityInfo) {
  const { email, role, alias } = identityInfo;
  const base = await ensureAccountRaw({
    email,
    password: identityInfo.password,
    name: identityInfo.name,
    mobile: identityInfo.mobile,
  });

  let promoted = null;
  if (role !== "player") {
    promoted = await setRoleIfDifferent({ email, role });
  }

  return {
    alias,
    email,
    role,
    userId: base.userId,
    jar: base.jar,
    status: base.status,
    promoted: promoted ? (promoted.changed ? "updated" : "already") : "n/a",
  };
}

export async function loginIdentity(alias) {
  const info = identity(alias);
  const client = createClient();
  const { res, body } = await client.json("POST", "/api/user/login", {
    body: { email: info.email, password: info.password },
  });
  if (res.status !== 200) {
    throw new Error(`login ${alias} (${info.email}) failed: ${res.status} ${JSON.stringify(body)}`);
  }
  return { client, info, userId: body.user.id };
}

export async function bootstrap() {
  await preservationCheck({ label: "bootstrap-start" });
  const results = [];
  for (const item of IDENTITIES) {
    results.push(await ensureAccount(identity(item.alias)));
  }
  const baseline = await preservationCheck({ label: "bootstrap-end" });
  return { results, baseline };
}

if (process.argv[1]?.endsWith("bootstrap.js")) {
  const { results, baseline } = await bootstrap();
  for (const r of results) {
    console.log(`${r.alias.padEnd(12)} ${r.email.padEnd(30)} role=${r.role.padEnd(11)} id=${r.userId} [${r.status}${r.role !== "player" ? `, role:${r.promoted}` : ""}]`);
  }
  console.log(`seed baseline: ${baseline.subscriptionPlans} plans, ${baseline.platformSettings} settings`);
  console.log("BOOTSTRAP OK");
}
