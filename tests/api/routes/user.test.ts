import { expect, spyOn, test } from "bun:test";
import user from "../../../apps/api/src/routes/user";
import { harness, isolate, json } from "../support";
isolate();
for (const method of ["GET", "POST"]) {
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
test("user validates GitHub usernames and returns the fetched profile", async () => {
  const h = harness(user);
  expect(
    (await h.request("/user", json({ githubUsername: "../invalid" }))).status,
  ).toBe(400);
  const fetch = spyOn(globalThis, "fetch").mockResolvedValue(
    Response.json({ login: "octocat" }),
  );
  expect(
    await (
      await h.request("/user", json({ githubUsername: "octocat" }))
    ).json(),
  ).toEqual({ login: "octocat" });
  expect(fetch).toHaveBeenCalledWith("https://api.github.com/users/octocat", {
    headers: { "User-Agent": "CrossPostHub" },
  });
});
for (const [upstream, expected] of [
  [404, 404],
  [429, 502],
  [500, 502],
]) {
  test(`user maps GitHub ${upstream} to HTTP ${expected}`, async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: upstream }),
    );
    expect(
      (
        await harness(user).request(
          "/user",
          json({ githubUsername: "octocat" }),
        )
      ).status,
    ).toBe(expected);
  });
}
