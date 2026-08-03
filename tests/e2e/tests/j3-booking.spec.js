import { journey } from "../src/journey.js";
import { loginIdentity } from "../src/bootstrap.js";
import { queryOne, count } from "../src/db.js";
import { assertEnvelope, assertStatus, assertOk2xx, assert401, assert409 } from "../src/contract.js";

function nextMondayIso() {
  const now = new Date();
  const day = now.getUTCDay();
  const daysUntilMonday = (8 - day) % 7 || 7;
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday));
  return d.toISOString().slice(0, 10);
}

journey("J3 Booking & Payment", {
  beforeAll: async (ctx) => {
    ctx.playerA = await loginIdentity("PLAYER_A");
    ctx.owner = await loginIdentity("OWNER");
    ctx.playerB = await loginIdentity("PLAYER_B");

    const ground = await queryOne(
      'SELECT id FROM grounds WHERE name = $1 AND "isVerified" = true AND "deletedAt" IS NULL ORDER BY "createdAt" DESC LIMIT 1',
      ["E2E Cricket Ground"]
    );
    if (!ground) throw new Error("J3 requires a verified E2E Cricket Ground (run J2 first)");
    ctx.groundId = ground.id;

    const courts = await queryOne(
      'SELECT c.id FROM courts c WHERE c."groundId" = $1 AND c."deletedAt" IS NULL ORDER BY c."createdAt" ASC',
      [ctx.groundId]
    );
    ctx.courtId = courts?.id;
    if (!ctx.courtId) throw new Error("J3 requires a court (run J2 first)");

    ctx.date = nextMondayIso();
    ctx.startTime = "10:00";
    ctx.endTime = "12:00";
  },
  steps: [
    {
      title: "player loads ground, courts and schedules",
      run: async (ctx) => {
        for (const [path, label] of [
          [`/api/grounds/${ctx.groundId}`, "ground"],
          [`/api/grounds/${ctx.groundId}/courts`, "courts"],
          [`/api/grounds/${ctx.groundId}/schedules`, "schedules"],
        ]) {
          const { res, body } = await ctx.playerA.client.json("GET", path);
          assertEnvelope(res, body, { path, context: label });
        }
      },
    },
    {
      title: "price preview returns direct PricePreview object",
      run: async (ctx) => {
        const qs = `groundId=${ctx.groundId}&courtId=${ctx.courtId}&date=${ctx.date}&startTime=${ctx.startTime}&endTime=${ctx.endTime}`;
        const { res, body } = await ctx.playerA.client.json("GET", `/api/pricing/preview?${qs}`);
        assertEnvelope(res, body, { path: "pricing/preview" });
        for (const k of ["basePrice", "multiplier", "finalPrice", "source"]) {
          if (!(k in body)) throw new Error(`PricePreview missing key ${k}`);
        }
        if (typeof body.finalPrice !== "number") throw new Error("finalPrice should be a number");
        ctx.preview = body;
      },
    },
    {
      title: "coupon validate (E2E10 if it exists, else documented 404)",
      run: async (ctx) => {
        const coupon = await queryOne('SELECT * FROM coupons WHERE code = $1', ["E2E10"]);
        const { res, body } = await ctx.playerA.client.json("POST", "/api/pricing/coupon/validate", {
          body: { code: "E2E10", bookingAmount: ctx.preview.finalPrice },
        });
        if (coupon) {
          assertEnvelope(res, body, { path: "coupon/validate" });
          if (body.valid !== true) throw new Error(`coupon should be valid, got ${JSON.stringify(body)}`);
        } else {
          if (!(res.status === 404 || res.status === 401)) {
            throw new Error(`coupon validate without coupon expected 404/401, got ${res.status}`);
          }
        }
      },
    },
    {
      title: "slot availability returns generated slots",
      run: async (ctx) => {
        const { res, body } = await ctx.playerA.client.json("GET", `/api/bookings/courts/${ctx.courtId}/slots?date=${ctx.date}`);
        assertEnvelope(res, body, { path: "slots" });
        if (!Array.isArray(body.slots)) throw new Error("slots should be an array");
        ctx.slots = body.slots;
      },
    },
    {
      title: "player creates a booking (or reuses an existing one for the slot)",
      run: async (ctx) => {
        const payload = {
          groundId: ctx.groundId,
          courtId: ctx.courtId,
          date: ctx.date,
          startTime: ctx.startTime,
          endTime: ctx.endTime,
        };
        let booking;
        const { res, body } = await ctx.playerA.client.json("POST", "/api/bookings", { body: payload });
        if (res.status === 201) {
          booking = body.booking;
        } else if (res.status === 409) {
          booking = await queryOne(
            `SELECT * FROM bookings WHERE "courtId" = $1 AND date = $2::date
             AND "startTime" = $3 AND "endTime" = $4 AND status IN ('pending_payment_verification','approved')`,
            [ctx.courtId, ctx.date, ctx.startTime, ctx.endTime]
          );
          if (!booking) throw new Error(`409 but no reusable booking for slot ${ctx.date} ${ctx.startTime}`);
        } else {
          throw new Error(`create booking unexpected ${res.status}: ${JSON.stringify(body)}`);
        }
        ctx.bookingId = booking.id;

        const db = await queryOne("SELECT * FROM bookings WHERE id = $1", [ctx.bookingId]);
        if (!db) throw new Error("booking row missing in DB");
        if (db.playerId !== ctx.playerA.userId) throw new Error("booking.playerId mismatch");
        const finance = await queryOne("SELECT * FROM booking_finance WHERE \"bookingId\" = $1", [ctx.bookingId]);
        if (!finance) throw new Error("no booking_finance row");
        if (finance.paymentStatus !== "unpaid") throw new Error(`paymentStatus=${finance.paymentStatus}, expected unpaid`);
        ctx.bookingAmount = db.totalAmount;
      },
    },
    {
      title: "double-booking the same slot is rejected (409)",
      run: async (ctx) => {
        const { res, body } = await ctx.playerA.client.json("POST", "/api/bookings", {
          body: {
            groundId: ctx.groundId,
            courtId: ctx.courtId,
            date: ctx.date,
            startTime: ctx.startTime,
            endTime: ctx.endTime,
          },
        });
        assertStatus(res, 409, { path: "double book", context: `date=${ctx.date}` });
      },
    },
    {
      title: "owner records payment (idempotent by idempotencyKey)",
      run: async (ctx) => {
        const amount = String(ctx.bookingAmount);
        const key = `e2e-j3-pay-${ctx.bookingId}`;
        const body1 = {
          amount,
          channel: "offline",
          paymentMethod: "cash",
          idempotencyKey: key,
        };
        const first = await ctx.owner.client.json("POST", `/api/bookings/${ctx.bookingId}/payment`, { body: body1 });
        assertStatus(first.res, 201, { path: "record payment" });

        const second = await ctx.owner.client.json("POST", `/api/bookings/${ctx.bookingId}/payment`, { body: body1 });
        assertStatus(second.res, 201, { path: "record payment (repeat)" });
        if (first.body?.payment?.id !== second.body?.payment?.id) {
          throw new Error("idempotent payment re-POST returned a different payment");
        }

        const n = await count("booking_payments", 'WHERE "bookingId" = $1', [ctx.bookingId]);
        if (n !== 1) throw new Error(`booking_payments count=${n}, expected 1`);
        const finance = await queryOne("SELECT \"paymentStatus\" FROM booking_finance WHERE \"bookingId\" = $1", [ctx.bookingId]);
        if (finance.paymentStatus !== "paid") throw new Error(`paymentStatus=${finance.paymentStatus}, expected paid`);
      },
    },
    {
      title: "owner approves the booking",
      run: async (ctx) => {
        const db = await queryOne("SELECT status FROM bookings WHERE id = $1", [ctx.bookingId]);
        if (db.status === "approved") {
          console.log("  (already approved — re-run)");
          return;
        }
        const { res, body } = await ctx.owner.client.json("PATCH", `/api/bookings/${ctx.bookingId}/status`, {
          body: { status: "approved" },
        });
        assertOk2xx(res, { path: "approve booking" });
        const after = await queryOne("SELECT status FROM bookings WHERE id = $1", [ctx.bookingId]);
        if (after.status !== "approved") throw new Error("booking not approved in DB");
      },
    },
    {
      title: "player lists their bookings including this one",
      run: async (ctx) => {
        const { res, body } = await ctx.playerA.client.json("GET", "/api/bookings/my");
        assertEnvelope(res, body, { path: "bookings/my" });
        if (!body.bookings.some((b) => b.id === ctx.bookingId)) throw new Error("booking missing from /bookings/my");
      },
    },
    {
      title: "player reads booking detail with paid finance",
      run: async (ctx) => {
        const { res, body } = await ctx.playerA.client.json("GET", `/api/bookings/${ctx.bookingId}`);
        assertEnvelope(res, body, { path: "booking detail" });
        if (body.booking.finance?.paymentStatus !== "paid") {
          throw new Error(`finance.paymentStatus=${body.booking.finance?.paymentStatus}, expected paid`);
        }
      },
    },
    {
      title: "player cancels the booking (soft close-out)",
      run: async (ctx) => {
        const db = await queryOne('SELECT status, "cancelledAt" FROM bookings WHERE id = $1', [ctx.bookingId]);
        if (db.status === "cancelled") {
          console.log("  (already cancelled — re-run)");
          return;
        }
        const { res, body } = await ctx.playerA.client.json("PATCH", `/api/bookings/${ctx.bookingId}/cancel`, {});
        assertOk2xx(res, { path: "cancel booking" });
        const after = await queryOne('SELECT status, "cancelledAt" FROM bookings WHERE id = $1', [ctx.bookingId]);
        if (after.status !== "cancelled") throw new Error("booking not cancelled in DB");
        if (!after.cancelledAt) throw new Error("cancelledAt not set");
      },
    },
    {
      title: "walk-in booking route is missing (documented gap, 404)",
      run: async (ctx) => {
        const otherDate = await queryOne("SELECT $1::date + 2 AS d", [ctx.date]).then((r) => {
          const d = new Date(r.d + "T00:00:00Z");
          return d.toISOString().slice(0, 10);
        });
        const { res, body } = await ctx.owner.client.json("POST", `/api/grounds/${ctx.groundId}/walkin`, {
          body: {
            courtId: ctx.courtId,
            date: otherDate,
            startTime: "09:00",
            endTime: "10:00",
            playerName: "Walk-in Player",
            playerPhone: "+92111111111",
          },
        });
        if (res.status !== 404) {
          throw new Error(`walkin route expected 404 (no route registered), got ${res.status}`);
        }
      },
    },
    {
      title: "non-owner (PLAYER_B) cannot cancel the booking (401)",
      run: async (ctx) => {
        const { res, body } = await ctx.playerB.client.json("PATCH", `/api/bookings/${ctx.bookingId}/cancel`, {});
        assertStatus(res, 401, { path: "cancel as PLAYER_B" });
      },
    },
  ],
});
