import { PRICING_PLANS, productIdForPlan } from "@repo/shared/pricing";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  checkout,
  dodopayments,
  portal,
  webhooks,
} from "@dodopayments/better-auth";
import type { PrismaClient } from "../../generated/prisma/client";
import { getDodo, syncDodoWebhook } from "./dodo";
import type { Bindings } from "../types";

export function createAuth(env: Bindings, db: PrismaClient) {
  const products = PRICING_PLANS.flatMap((plan) => {
    const productId = productIdForPlan(plan.id, env);
    return productId ? [{ productId, slug: plan.id }] : [];
  });

  return betterAuth({
    appName: "CrossPostHub",
    baseURL: env.API_URL,
    basePath: "/api/auth",
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.CLIENT_URL],
    database: prismaAdapter(db, { provider: "sqlite" }),
    emailAndPassword: { enabled: true },
    account: {
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
        requireLocalEmailVerified: true,
      },
      encryptOAuthTokens: true,
    },
    rateLimit: {
      enabled: true,
      window: 10,
      max: 100,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID!,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    plugins: [
      dodopayments({
        client: getDodo(env),
        createCustomerOnSignUp: true,
        getCustomerParams: (user) => ({
          metadata: { better_auth_user_id: user.id },
        }),
        use: [
          checkout({
            products,
            successUrl: `${env.CLIENT_URL}/payment/success`,
            authenticatedUsersOnly: true,
          }),
          portal(),
          webhooks({
            webhookKey: env.DODO_PAYMENTS_WEBHOOK_KEY,
            onPayload: (payload) => syncDodoWebhook(db, payload, env),
          }),
        ],
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
