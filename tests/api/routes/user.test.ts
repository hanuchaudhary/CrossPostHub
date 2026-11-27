import { expect, test } from "bun:test";
import user from "../../../apps/api/src/routes/user";
import { harness, isolate } from "../support";
isolate();
for (const method of ["GET"]) {
  test(`user ${method} requires authentication`, async () => {
    expect(
      (await harness(user, "/", false).request("/user", { method })).status,
    ).toBe(401);
  });
}
test("user aggregates successful posts by UTC month and provider", async () => {
  const h = harness(user);
  h.db.post.findMany.mockResolvedValue([
    { createdAt: new Date("2026-01-01T00:00:00Z"), provider: "twitter" },
    { createdAt: new Date("2026-01-31T23:59:00Z"), provider: "linkedin" },
    { createdAt: new Date("2026-02-01T00:00:00Z"), provider: "instagram" },
  ]);
  expect(
    ((await (await h.request("/user")).json()) as { monthlyData: unknown[] })
      .monthlyData,
  ).toEqual([
    { month: "Jan", twitter: 1, linkedin: 1, instagram: 0 },
    { month: "Feb", twitter: 0, linkedin: 0, instagram: 1 },
  ]);
  expect(h.db.post.findMany.mock.calls[0]![0].where).toMatchObject({
    userId: "user-1",
    status: "SUCCESS",
    createdAt: { gte: expect.any(Date) },
  });
});
