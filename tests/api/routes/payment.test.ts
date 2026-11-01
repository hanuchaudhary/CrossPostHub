import { expect, mock, spyOn, test } from "bun:test";

import * as dodo from "../../../apps/api/src/lib/dodo";
import payment from "../../../apps/api/src/routes/payment";
import { harness, isolate, json } from "../support";

isolate();

for (const [method, path] of [
  ["GET", "/payment"],
  ["POST", "/payment"],
  ["GET", "/payment/subscription"],
  ["GET", "/payment/usage"],
  ["POST", "/payment/subscribe"],
]) {
  test(`payment requires authentication for ${method} ${path}`, async () => {
    expect(
      (await harness(payment, "/payment", false).request(path!, { method }))
        .status
    ).toBe(401);
  });
}
test("pricing no longer needs a database-backed endpoint", async () => {
  const h = harness(payment, "/payment", false);
  expect((await h.request("/payment/pricing")).status).toBe(404);
});
test("payment lists owned transactions and active subscriptions with legacy order_id", async () => {
  const h = harness(payment, "/payment");
  h.db.transaction.findMany.mockResolvedValue([
    { id: "tx-1", orderId: "order-1" },
  ]);
  h.db.subscription.findMany.mockResolvedValue([{ id: "sub-1" }]);
  expect(await (await h.request("/payment")).json()).toEqual({
    transactions: [{ id: "tx-1", orderId: "order-1", order_id: "order-1" }],
    subscriptions: [{ id: "sub-1" }],
  });
  expect(h.db.transaction.findMany.mock.calls[0]![0]).toMatchObject({
    where: { userId: "user-1" },
    take: 5,
  });
  expect(h.db.subscription.findMany.mock.calls[0]![0].where).toEqual({
    userId: "user-1",
    status: "active",
  });
});
test("payment lookup scopes all supported identifiers to the user", async () => {
  const h = harness(payment, "/payment");
  h.db.transaction.findFirst
    .mockResolvedValueOnce({ orderId: "order-1" })
    .mockResolvedValueOnce(null);
  expect(
    (
      (await (
        await h.request("/payment", json({ order_id: "order-1" }))
      ).json()) as { transaction: { order_id: string } }
    ).transaction.order_id
  ).toBe("order-1");
  expect(h.db.transaction.findFirst.mock.calls[0]![0].where).toEqual({
    userId: "user-1",
    OR: [{ id: "order-1" }, { orderId: "order-1" }, { paymentId: "order-1" }],
  });
  expect(
    await (await h.request("/payment", json({ order_id: "missing" }))).json()
  ).toEqual({ transaction: null });
  expect((await h.request("/payment", json({}))).status).toBe(400);
});
test("payment subscription returns none or the active subscription", async () => {
  const h = harness(payment, "/payment");
  h.db.subscription.findFirst
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce({ id: "sub-1", status: "active" });
  expect(await (await h.request("/payment/subscription")).json()).toEqual({
    status: "none",
  });
  expect(
    (
      (await (await h.request("/payment/subscription")).json()) as {
        subscription: { id: string };
      }
    ).subscription.id
  ).toBe("sub-1");
  expect(h.db.subscription.findFirst.mock.calls[0]![0].where).toEqual({
    userId: "user-1",
    status: "active",
  });
});
test("payment rejects invalid and unconfigured plans", async () => {
  const h = harness(payment, "/payment");
  h.db.subscription.findFirst.mockResolvedValue(null);
  expect(
    (await h.request("/payment/subscribe", json({ planId: "" }))).status
  ).toBe(400);
  h.env.DODO_PRODUCT_PRO = undefined;
  expect(
    (await h.request("/payment/subscribe", json({ planId: "missing" }))).status
  ).toBe(400);
  expect(
    (await h.request("/payment/subscribe", json({ planId: "pro" }))).status
  ).toBe(400);
  expect(h.db.subscription.create).not.toHaveBeenCalled();
});
test("payment activates the free plan locally", async () => {
  const h = harness(payment, "/payment");
  h.db.subscription.findFirst.mockResolvedValue(null);
  h.db.subscription.create.mockResolvedValue({ id: "sub-free" });
  expect(
    await (
      await h.request("/payment/subscribe", json({ planId: "free" }))
    ).json()
  ).toEqual({
    message: "Free plan activated",
    subscriptionId: "sub-free",
    checkout_url: `${h.env.CLIENT_URL}/dashboard`,
  });
  expect(h.db.subscription.create).toHaveBeenCalledWith({
    data: { userId: "user-1", planId: "free", status: "active" },
  });
});
for (const existingCustomer of [true, false]) {
  test(`payment creates checkout for ${existingCustomer ? "existing" : "new"} customers`, async () => {
    const h = harness(payment, "/payment");
    h.db.subscription.findFirst.mockResolvedValue(null);
    h.db.user.findUniqueOrThrow.mockResolvedValue({
      name: "Test",
      email: "test@example.com",
      dodoCustomerId: existingCustomer ? "customer-1" : null,
    });
    const create = mock(async (_input: unknown) => ({
      session_id: "checkout-1",
      checkout_url: "https://checkout.example.com/1",
    }));
    spyOn(dodo, "getDodo").mockReturnValue({
      checkoutSessions: { create },
    } as unknown as ReturnType<typeof dodo.getDodo>);
    expect(
      await (
        await h.request("/payment/subscribe", json({ planId: "pro" }))
      ).json()
    ).toEqual({
      checkout_url: "https://checkout.example.com/1",
      checkout_id: "checkout-1",
    });
    expect(create.mock.calls[0]![0]).toMatchObject({
      product_cart: [{ product_id: "product-pro", quantity: 1 }],
      customer: existingCustomer
        ? { customer_id: "customer-1" }
        : { email: "test@example.com", name: "Test" },
      metadata: {
        better_auth_user_id: "user-1",
        plan_id: "pro",
        reference_id: expect.any(String),
      },
      return_url: `${h.env.CLIENT_URL}/billing`,
    });
  });
}

for (const [planId, postsLimit, scheduledLimit] of [
  ["free", 25, 5],
  ["pro", 60, 20],
  ["premium", null, null],
] as const) {
  test(`billing usage returns accurate monthly counts and ${planId} limits`, async () => {
    const h = harness(payment, "/payment");
    h.db.subscription.findFirst.mockResolvedValue(
      planId === "free" ? null : { planId }
    );
    h.db.post.count.mockResolvedValueOnce(12).mockResolvedValueOnce(3);
    const response = await h.request("/payment/usage");
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      periodStart: string;
      resetsAt: string;
    };
    expect(body).toMatchObject({
      planId,
      posts: { used: 12, limit: postsLimit },
      scheduled: { used: 3, limit: scheduledLimit },
    });
    const start = new Date(body.periodStart);
    const end = new Date(body.resetsAt);
    expect(start.getUTCDate()).toBe(1);
    expect(start.getUTCHours()).toBe(0);
    expect(end.getUTCDate()).toBe(1);
    expect(end.getTime()).toBeGreaterThan(start.getTime());
    expect(h.db.post.count.mock.calls[0]![0].where).toEqual({
      userId: "user-1",
      createdAt: { gte: start, lt: end },
    });
    expect(h.db.post.count.mock.calls[1]![0].where).toEqual({
      userId: "user-1",
      isScheduled: true,
      createdAt: { gte: start, lt: end },
    });
  });
}

for (const planId of ["free", "pro", "premium"]) {
  test(`existing paid subscribers must use the portal to switch to ${planId}`, async () => {
    const h = harness(payment, "/payment");
    h.db.subscription.findFirst.mockResolvedValue({
      id: "sub-paid",
      dodoSubscriptionId: "sub_dodo",
    });
    const response = await h.request("/payment/subscribe", json({ planId }));
    expect(response.status).toBe(409);
    expect(h.db.subscription.create).not.toHaveBeenCalled();
    expect(h.db.subscription.findFirst.mock.calls[0]![0].where).toMatchObject({
      userId: "user-1",
      dodoSubscriptionId: { not: null },
      status: { in: ["active", "on_hold", "pending"] },
    });
  });
}

test("billing retains portal access for a subscription that is on hold", async () => {
  const h = harness(payment, "/payment");
  h.db.subscription.findFirst
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce({
      id: "sub-held",
      planId: "pro",
      status: "on_hold",
    });
  expect(await (await h.request("/payment/subscription")).json()).toMatchObject(
    { status: "on_hold", subscription: { planId: "pro" } }
  );
  expect(h.db.subscription.findFirst.mock.calls[1]![0].where).toEqual({
    userId: "user-1",
    dodoSubscriptionId: { not: null },
  });
});
