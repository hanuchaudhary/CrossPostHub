import { expect, spyOn, test, mock } from "bun:test";
import payment from "../../../apps/api/src/routes/payment";
import * as dodo from "../../../apps/api/src/lib/dodo";
import { harness, isolate, json } from "../support";
isolate();

for (const [method, path] of [
  ["GET", "/payment"],
  ["POST", "/payment"],
  ["GET", "/payment/subscription"],
  ["POST", "/payment/subscribe"],
]) {
  test(`payment requires authentication for ${method} ${path}`, async () => {
    expect(
      (await harness(payment, "/payment", false).request(path!, { method }))
        .status,
    ).toBe(401);
  });
}
test("payment pricing is public and ordered by price", async () => {
  const h = harness(payment, "/payment", false);
  h.db.plan.findMany.mockResolvedValue([{ id: "free", price: 0 }]);
  expect(await (await h.request("/payment/pricing")).json()).toEqual({
    pricingPlans: [{ id: "free", price: 0 }],
  });
  expect(h.db.plan.findMany).toHaveBeenCalledWith({
    orderBy: { price: "asc" },
  });
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
    ).transaction.order_id,
  ).toBe("order-1");
  expect(h.db.transaction.findFirst.mock.calls[0]![0].where).toEqual({
    userId: "user-1",
    OR: [{ id: "order-1" }, { orderId: "order-1" }, { paymentId: "order-1" }],
  });
  expect(
    await (await h.request("/payment", json({ order_id: "missing" }))).json(),
  ).toEqual({ transaction: null });
  expect((await h.request("/payment", json({}))).status).toBe(400);
});
test("payment subscription returns none or the active subscription", async () => {
  const h = harness(payment, "/payment");
  h.db.subscription.findFirst
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
    ).subscription.id,
  ).toBe("sub-1");
  expect(h.db.subscription.findFirst.mock.calls[0]![0].where).toEqual({
    userId: "user-1",
    status: "active",
  });
});
test("payment rejects invalid and unconfigured plans", async () => {
  const h = harness(payment, "/payment");
  expect(
    (await h.request("/payment/subscribe", json({ planId: "" }))).status,
  ).toBe(400);
  h.db.plan.findFirst
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce({ id: "paid", price: 10, dodoProductId: null });
  expect(
    (await h.request("/payment/subscribe", json({ planId: "missing" }))).status,
  ).toBe(400);
  expect(
    (await h.request("/payment/subscribe", json({ planId: "paid" }))).status,
  ).toBe(400);
  expect(h.db.subscription.create).not.toHaveBeenCalled();
});
test("payment activates the free plan locally", async () => {
  const h = harness(payment, "/payment");
  h.db.plan.findFirst.mockResolvedValue({ id: "free", price: 0 });
  h.db.subscription.create.mockResolvedValue({ id: "sub-free" });
  expect(
    await (
      await h.request("/payment/subscribe", json({ planId: "free" }))
    ).json(),
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
    h.db.plan.findFirst.mockResolvedValue({
      id: "pro",
      price: 10,
      dodoProductId: "product-pro",
    });
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
      ).json(),
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
      return_url: `${h.env.CLIENT_URL}/payment/success`,
    });
  });
}
