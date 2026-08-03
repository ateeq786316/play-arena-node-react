import { test } from "@playwright/test";
import { preservationCheck } from "./preservation.js";

export function journey(name, { beforeAll, afterAll, steps }) {
  test.describe.serial(name, () => {
    const ctx = { name, api: null, jars: {} };

    test.beforeAll(async () => {
      ctx.preservationStart = await preservationCheck({ label: `start:${name}` });
      if (beforeAll) await beforeAll(ctx);
    });

    test.afterAll(async () => {
      try {
        if (afterAll) await afterAll(ctx);
      } finally {
        await preservationCheck({ label: `end:${name}` });
      }
    });

    for (const step of steps) {
      test(step.title, async ({ page, context, request }) => {
        await step.run(ctx, { page, context, request });
      });
    }
  });
}
