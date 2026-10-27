import { expect, test } from "bun:test";
import { getDb } from "../../../apps/api/src/lib/db";

test("database reuses Prisma clients for the same D1 binding and isolates other bindings", () => {
  // Client construction is lazy; this never sends a query to D1.
  const first = {} as D1Database;
  const second = {} as D1Database;
  expect(getDb(first)).toBe(getDb(first));
  expect(getDb(first)).not.toBe(getDb(second));
});
