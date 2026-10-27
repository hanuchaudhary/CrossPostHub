import { Hono, type Context } from "hono";
import { z } from "zod";
import { getDodo } from "../lib/dodo";
import { dbFor, requireUser, type AppEnv } from "./shared";

function transactionJson(transaction: Record<string, unknown>) {
  return { ...transaction, order_id: transaction.orderId };
}

const app = new Hono<AppEnv>();

app.get("/pricing", async (c) => {
  try {
    const pricingPlans = await dbFor(c).plan.findMany({
      orderBy: { price: "asc" },
    });
    return c.json({ pricingPlans });
  } catch (error) {
    c.json(error)
    console.log(error)
  }
});

app.get("", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ message: "Unauthorized" }, 401);
  const db = dbFor(c);
  const [transactions, subscriptions] = await Promise.all([
    db.transaction.findMany({
      where: { userId: user.id },
      include: { subscription: { include: { plan: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.subscription.findMany({
      where: { userId: user.id, status: "active" },
      include: { plan: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  return c.json({
    transactions: transactions.map((item) =>
      transactionJson(item as unknown as Record<string, unknown>),
    ),
    subscriptions,
  });
});

app.post("", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ message: "Unauthorized" }, 401);
  const { order_id } = z
    .object({ order_id: z.string() })
    .parse(await c.req.json());
    const transaction = await dbFor(c).transaction.findFirst({
    where: {
      userId: user.id,
      OR: [{ id: order_id }, { orderId: order_id }, { paymentId: order_id }],
    },
  });
  return c.json({
    transaction: transaction
      ? transactionJson(transaction as unknown as Record<string, unknown>)
      : null,
  });
});

app.get("/subscription", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ message: "Unauthorized" }, 401);
    const subscription = await dbFor(c).subscription.findFirst({
    where: { userId: user.id, status: "active" },
    include: { plan: true },
    orderBy: { updatedAt: "desc" },
  });
  return subscription
    ? c.json({ status: subscription.status, subscription })
    : c.json({ status: "none" });
});

app.post("/subscribe", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ message: "Unauthorized" }, 401);
  const { planId } = z
    .object({ planId: z.string().min(1) })
    .parse(await c.req.json());
    const db = dbFor(c);
  const plan = await db.plan.findFirst({
    where: { OR: [{ id: planId }, { dodoProductId: planId }] },
  });
  if (!plan) return c.json({ error: "Invalid plan" }, 400);
  if (plan.price === 0) {
    const subscription = await db.subscription.create({
      data: { userId: user.id, planId: plan.id, status: "active" },
    });
    return c.json({
      message: "Free plan activated",
      subscriptionId: subscription.id,
      checkout_url: `${c.env.CLIENT_URL}/dashboard`,
    });
  }
  if (!plan.dodoProductId)
    return c.json(
      { error: "This plan is not configured in Dodo Payments" },
      400,
    );
  const dbUser = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  const checkout = await getDodo(c.env).checkoutSessions.create({
    product_cart: [{ product_id: plan.dodoProductId, quantity: 1 }],
    customer: dbUser.dodoCustomerId
      ? { customer_id: dbUser.dodoCustomerId }
      : { email: dbUser.email, name: dbUser.name },
    metadata: {
      better_auth_user_id: user.id,
      plan_id: plan.id,
      reference_id: crypto.randomUUID(),
    },
    return_url: `${c.env.CLIENT_URL}/payment/success`,
  });
  return c.json({
    checkout_url: checkout.checkout_url,
    checkout_id: checkout.session_id,
  });
});

export default app;
