import DodoPayments from "dodopayments";
import type { Payment, Subscription, WebhookPayload } from "@dodopayments/core";
import type { PrismaClient } from "../../generated/prisma/client";
import type { Bindings } from "../types";

export function getDodo(env: Bindings) {
  return new DodoPayments({
    bearerToken: env.DODO_PAYMENTS_API_KEY,
    environment:
      env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode",
    webhookKey: env.DODO_PAYMENTS_WEBHOOK_KEY,
  });
}

function statusForPayment(type: WebhookPayload["type"]) {
  if (type === "payment.succeeded") return "SUCCESS" as const;
  if (type === "payment.failed") return "FAILED" as const;
  if (type === "payment.cancelled") return "CANCELLED" as const;
  return "PENDING" as const;
}

export async function syncDodoWebhook(
  db: PrismaClient,
  payload: WebhookPayload,
) {
  if (payload.type.startsWith("payment.")) {
    const data = payload.data as Payment;
    const user = await db.user.findUnique({
      where: { dodoCustomerId: data.customer.customer_id },
    });
    if (!user) return;
    const dodoSubscriptionId = data.subscription_id ?? undefined;
    const subscription = dodoSubscriptionId
      ? await db.subscription.findUnique({ where: { dodoSubscriptionId } })
      : null;
    await db.transaction.upsert({
      where: { paymentId: data.payment_id },
      create: {
        userId: user.id,
        subscriptionId: subscription?.id,
        orderId: String(data.metadata?.reference_id ?? data.payment_id),
        paymentId: data.payment_id,
        amount: data.total_amount,
        currency: data.currency,
        status: statusForPayment(payload.type),
        captured: payload.type === "payment.succeeded",
      },
      update: {
        status: statusForPayment(payload.type),
        captured: payload.type === "payment.succeeded",
        subscriptionId: subscription?.id,
      },
    });
    return;
  }

  if (payload.type.startsWith("subscription.")) {
    const data = payload.data as Subscription;
    const [user, plan] = await Promise.all([
      db.user.findUnique({
        where: { dodoCustomerId: data.customer.customer_id },
      }),
      db.plan.findUnique({ where: { dodoProductId: data.product_id } }),
    ]);
    if (!user || !plan) return;
    await db.subscription.upsert({
      where: { dodoSubscriptionId: data.subscription_id },
      create: {
        userId: user.id,
        planId: plan.id,
        dodoSubscriptionId: data.subscription_id,
        status: data.status,
        nextBillingAt: data.next_billing_date
          ? new Date(data.next_billing_date)
          : null,
      },
      update: {
        planId: plan.id,
        status: data.status,
        nextBillingAt: data.next_billing_date
          ? new Date(data.next_billing_date)
          : null,
      },
    });
  }
}
