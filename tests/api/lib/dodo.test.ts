import { expect, test } from "bun:test";
import { getDodo, syncDodoWebhook } from "../../../apps/api/src/lib/dodo";
import { asPrisma, bindings, database, isolate } from "../support";
isolate();
type Payload = Parameters<typeof syncDodoWebhook>[1];

test("Dodo client selects the configured environment without making requests", () => {
  const { env } = bindings();
  expect(getDodo(env).baseURL).toContain("test");
  env.DODO_PAYMENTS_ENVIRONMENT = "live_mode";
  expect(getDodo(env).baseURL).not.toContain("test");
});

for (const [type, status] of [
  ["payment.succeeded", "SUCCESS"],
  ["payment.failed", "FAILED"],
  ["payment.cancelled", "CANCELLED"],
  ["payment.processing", "PENDING"],
]) {
  test(`webhook sync maps ${type} to ${status} and upserts by payment ID`, async () => {
    const db = database();
    db.user.findUnique.mockResolvedValue({ id: "user-1" });
    db.subscription.findUnique.mockResolvedValue({ id: "local-sub" });
    db.transaction.upsert.mockResolvedValue({});
    const payload = {
      business_id: "business-test",
      timestamp: new Date("2026-01-01T00:00:00Z"),
      type,
      data: {
        payment_id: "payment-1",
        subscription_id: "dodo-sub",
        customer: { customer_id: "customer-1" },
        total_amount: 1500,
        currency: "USD",
        metadata: { reference_id: "reference-1" },
      },
    } as Payload;
    await syncDodoWebhook(asPrisma(db), payload);
    const input = db.transaction.upsert.mock.calls[0]![0];
    expect(input.where).toEqual({ paymentId: "payment-1" });
    expect(input.create).toMatchObject({
      userId: "user-1",
      subscriptionId: "local-sub",
      orderId: "reference-1",
      amount: 1500,
      currency: "USD",
      status,
      captured: type === "payment.succeeded",
    });
    expect(input.update).toEqual({
      status,
      captured: type === "payment.succeeded",
      subscriptionId: "local-sub",
    });
  });
}

test("webhook sync ignores unknown customers and falls back to payment IDs", async () => {
  const db = database();
  const payload = {
    business_id: "business-test",
    timestamp: new Date("2026-01-01T00:00:00Z"),
    type: "payment.succeeded",
    data: {
      payment_id: "payment-1",
      customer: { customer_id: "unknown" },
      total_amount: 0,
      currency: "USD",
    },
  } as Payload;
  db.user.findUnique
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce({ id: "user-1" });
  await syncDodoWebhook(asPrisma(db), payload);
  expect(db.transaction.upsert).not.toHaveBeenCalled();
  db.transaction.upsert.mockResolvedValue({});
  await syncDodoWebhook(asPrisma(db), payload);
  expect(db.transaction.upsert.mock.calls[0]![0].create.orderId).toBe(
    "payment-1",
  );
  expect(db.subscription.findUnique).not.toHaveBeenCalled();
});

for (const status of ["active", "on_hold", "cancelled"]) {
  test(`webhook sync updates ${status} subscription lifecycle`, async () => {
    const db = database();
    db.user.findUnique.mockResolvedValue({ id: "user-1" });
    db.plan.findUnique.mockResolvedValue({ id: "pro" });
    db.subscription.upsert.mockResolvedValue({});
    const payload = {
      business_id: "business-test",
      timestamp: new Date("2026-01-01T00:00:00Z"),
      type: `subscription.${status}`,
      data: {
        subscription_id: "dodo-sub",
        product_id: "product-pro",
        customer: { customer_id: "customer-1" },
        status,
        next_billing_date: "2026-12-01T00:00:00Z",
      },
    } as Payload;
    await syncDodoWebhook(asPrisma(db), payload);
    expect(db.subscription.upsert.mock.calls[0]![0]).toEqual({
      where: { dodoSubscriptionId: "dodo-sub" },
      create: {
        userId: "user-1",
        planId: "pro",
        dodoSubscriptionId: "dodo-sub",
        status,
        nextBillingAt: new Date("2026-12-01T00:00:00Z"),
      },
      update: {
        planId: "pro",
        status,
        nextBillingAt: new Date("2026-12-01T00:00:00Z"),
      },
    });
  });
}

test("webhook sync skips unmapped subscriptions and clears missing billing dates", async () => {
  const db = database();
  const payload = {
    business_id: "business-test",
    timestamp: new Date("2026-01-01T00:00:00Z"),
    type: "subscription.active",
    data: {
      subscription_id: "sub-1",
      product_id: "product-1",
      customer: { customer_id: "customer-1" },
      status: "active",
    },
  } as Payload;
  db.user.findUnique.mockResolvedValue({ id: "user-1" });
  db.plan.findUnique
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce({ id: "pro" });
  await syncDodoWebhook(asPrisma(db), payload);
  expect(db.subscription.upsert).not.toHaveBeenCalled();
  db.subscription.upsert.mockResolvedValue({});
  await syncDodoWebhook(asPrisma(db), payload);
  expect(
    db.subscription.upsert.mock.calls[0]![0].update.nextBillingAt,
  ).toBeNull();
});

test("webhook sync ignores unrelated events", async () => {
  const db = database();
  await syncDodoWebhook(asPrisma(db), {
    type: "refund.succeeded",
    data: {},
  } as Payload);
  expect(db.user.findUnique).not.toHaveBeenCalled();
  expect(db.transaction.upsert).not.toHaveBeenCalled();
});
