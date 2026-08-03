import { journey } from "../src/journey.js";
import { loginIdentity } from "../src/bootstrap.js";
import { queryOne, count } from "../src/db.js";
import { assertEnvelope, assertStatus, assertOk2xx, assert401 } from "../src/contract.js";

const GROUND_NAME = "E2E Cricket Ground";

journey("J2 Ground Ownership & Management", {
  beforeAll: async (ctx) => {
    ctx.owner = await loginIdentity("OWNER");
    ctx.superAdmin = await loginIdentity("SUPER_ADMIN");
    ctx.playerB = await loginIdentity("PLAYER_B");
  },
  steps: [
    {
      title: "owner creates ground (or reuses existing E2E Cricket Ground)",
      run: async (ctx) => {
        const existing = await queryOne(
          `SELECT g.* FROM grounds g
           WHERE g.name = $1 AND g."ownerId" = $2 AND g."deletedAt" IS NULL
           ORDER BY g."createdAt" ASC LIMIT 1`,
          [GROUND_NAME, ctx.owner.userId]
        );
        if (existing) {
          ctx.groundId = existing.id;
          ctx.created = false;
        } else {
          const { res, body } = await ctx.owner.client.json("POST", "/api/grounds", {
            body: {
              name: GROUND_NAME,
              address: "123 E2E Avenue, Test City",
              description: "E2E test ground created by journey J2",
              contactPhone: "+92111111111",
            },
          });
          assertEnvelope(res, body, { path: "POST /api/grounds", context: GROUND_NAME });
          ctx.groundId = body.ground?.id;
          ctx.created = true;
        }
        if (!ctx.groundId) throw new Error("no ground id");

        const ground = await queryOne("SELECT * FROM grounds WHERE id = $1", [ctx.groundId]);
        if (ground.ownerId !== ctx.owner.userId) throw new Error("ground.ownerId mismatch");
        if (ground.isVerified !== false) throw new Error("ground should start unverified");
        if (ground.isActive !== true) throw new Error("ground should start active");

        const access = await queryOne(
          'SELECT * FROM ground_access WHERE "groundId" = $1 AND "userId" = $2',
          [ctx.groundId, ctx.owner.userId]
        );
        if (!access) throw new Error("no ground_access owner row");
        if (access.accessRole !== "owner") throw new Error(`accessRole=${access.accessRole}, expected owner`);

        const setting = await queryOne("SELECT * FROM ground_settings WHERE \"groundId\" = $1", [ctx.groundId]);
        if (!setting) throw new Error("no default ground_settings row");
        if (setting.allowOnlineBooking !== true) throw new Error("default allowOnlineBooking should be true");
      },
    },
    {
      title: "GET /api/grounds/my includes the ground",
      run: async (ctx) => {
        const { res, body } = await ctx.owner.client.json("GET", "/api/grounds/my");
        assertEnvelope(res, body, { path: "grounds/my" });
        if (!body.grounds.some((g) => g.id === ctx.groundId)) throw new Error("new ground missing from /grounds/my");
      },
    },
    {
      title: "owner adds two courts",
      run: async (ctx) => {
        const { res: listRes, body: listBody } = await ctx.owner.client.json("GET", `/api/grounds/${ctx.groundId}/courts`);
        assertEnvelope(listRes, listBody, { path: "courts" });
        let courts = listBody.courts ?? [];

        if (courts.length < 1) {
          const { res, body } = await ctx.owner.client.json("POST", `/api/grounds/${ctx.groundId}/courts`, {
            body: { name: "E2E Court 1", sportType: "Cricket", basePrice: 800, pricePerHour: 1000 },
          });
          assertStatus(res, 201, { path: "create court 1" });
          courts.push(body.court);
        }
        if (courts.length < 2) {
          const { res, body } = await ctx.owner.client.json("POST", `/api/grounds/${ctx.groundId}/courts`, {
            body: { name: "E2E Court 2", sportType: "Cricket", basePrice: 800, pricePerHour: 1000 },
          });
          assertStatus(res, 201, { path: "create court 2" });
          courts.push(body.court);
        }

        const n = await count("courts", 'WHERE "groundId" = $1 AND "deletedAt" IS NULL', [ctx.groundId]);
        if (n < 2) throw new Error(`expected >=2 courts, got ${n}`);
        ctx.court1 = courts[0].id;
        ctx.court2 = courts[1].id;
      },
    },
    {
      title: "upsert weekly schedule for Monday",
      run: async (ctx) => {
        const { res, body } = await ctx.owner.client.json("PUT", `/api/grounds/${ctx.groundId}/schedules/1`, {
          body: { openTime: "08:00", closeTime: "23:00", slotDuration: 60 },
        });
        assertEnvelope(res, body, { path: "upsert schedule" });
        const monday = await queryOne(
          'SELECT * FROM ground_schedules WHERE "groundId" = $1 AND "dayOfWeek" = 1 AND "isActive" = true',
          [ctx.groundId]
        );
        if (!monday) throw new Error("Monday schedule not persisted");
        if (monday.openTime !== "08:00") throw new Error("openTime mismatch");
      },
    },
    {
      title: "owner updates ground settings",
      run: async (ctx) => {
        const { res, body } = await ctx.owner.client.json("PATCH", `/api/grounds/${ctx.groundId}/settings`, {
          body: {
            allowOnlineBooking: true,
            allowWalkinBooking: true,
            requireDeposit: true,
            depositPercentage: 50,
          },
        });
        assertEnvelope(res, body, { path: "settings PATCH" });
        const setting = await queryOne("SELECT * FROM ground_settings WHERE \"groundId\" = $1", [ctx.groundId]);
        if (setting.allowOnlineBooking !== true) throw new Error("allowOnlineBooking not persisted");
        if (setting.depositPercentage !== "50" && Number(setting.depositPercentage) !== 50) {
          throw new Error(`depositPercentage=${setting.depositPercentage}, expected 50`);
        }
      },
    },
    {
      title: "owner invites staff (pending invite row)",
      run: async (ctx) => {
        ctx.staff = ctx.staff ?? (await loginIdentity("STAFF"));
        const { res, body } = await ctx.owner.client.json("POST", `/api/grounds/${ctx.groundId}/invites`, {
          body: { accessRole: "staff", userId: ctx.staff.userId },
        });
        assertStatus(res, 201, { path: "invites", context: GROUND_NAME });
        const invite = await queryOne(
          'SELECT * FROM ground_invites WHERE "groundId" = $1 AND "accessRole" = $2 AND "status" = $3 ORDER BY "createdAt" DESC LIMIT 1',
          [ctx.groundId, "staff", "pending"]
        );
        if (!invite) throw new Error("no pending staff invite row");
        ctx.invite = invite;
      },
    },
    {
      title: "no ground-invite accept API — assert invite stays pending (documented gap)",
      run: async (ctx) => {
        const invite = await queryOne("SELECT * FROM ground_invites WHERE id = $1", [ctx.invite.id]);
        if (invite.status !== "pending") throw new Error(`invite status=${invite.status}, expected pending`);
      },
    },
    {
      title: "owner cannot verify own ground (401 super_admin only)",
      run: async (ctx) => {
        const { res, body } = await ctx.owner.client.json("PATCH", `/api/admin/grounds/${ctx.groundId}/verify`, {});
        assertStatus(res, 401, { path: "admin verify as owner" });
      },
    },
    {
      title: "super_admin verifies the ground + audit log",
      run: async (ctx) => {
        const { res, body } = await ctx.superAdmin.client.json("PATCH", `/api/admin/grounds/${ctx.groundId}/verify`, {});
        assertOk2xx(res, { path: "admin verify as super_admin" });
        const ground = await queryOne("SELECT \"isVerified\" FROM grounds WHERE id = $1", [ctx.groundId]);
        if (ground.isVerified !== true) throw new Error("ground not verified in DB");
        const audit = await queryOne(
          'SELECT * FROM audit_logs WHERE action = $1 AND "entityId" = $2 ORDER BY "createdAt" DESC LIMIT 1',
          ["ground_verified", ctx.groundId]
        );
        if (!audit) throw new Error("no audit_logs row for ground_verified");
        ctx.groundVerified = true;
      },
    },
    {
      title: "public GET /api/grounds/:id shows verified ground",
      run: async (ctx) => {
        const { res, body } = await ctx.playerB.client.json("GET", `/api/grounds/${ctx.groundId}`);
        assertEnvelope(res, body, { path: "get ground" });
        if (body.ground.isVerified !== true) throw new Error("public ground should be verified");
      },
    },
    {
      title: "non-owner cannot update the ground (401)",
      run: async (ctx) => {
        const { res, body } = await ctx.playerB.client.json("PATCH", `/api/grounds/${ctx.groundId}`, {
          body: { name: "HACKED NAME" },
        });
        assertStatus(res, 401, { path: "update as PLAYER_B" });
        const ground = await queryOne("SELECT name FROM grounds WHERE id = $1", [ctx.groundId]);
        if (ground.name !== GROUND_NAME) throw new Error("ground name was changed by unauthorized update");
      },
    },
  ],
});
