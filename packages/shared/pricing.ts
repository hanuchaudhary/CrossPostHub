export type PlanId = "free" | "pro" | "premium";
export type PricingPlan = {
  id: PlanId;
  title: string;
  price: number;
  description: string;
  cta: string;
  popular: boolean;
  features: readonly string[];
  limits: { posts: number | null; scheduled: number | null };
};

export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    id: "free",
    title: "Free",
    price: 0,
    description: "For finding your rhythm.",
    cta: "Start for free",
    popular: false,
    features: [
      "25 posts per month",
      "5 scheduled posts per month",
      "Connect your social accounts",
      "One workspace for your content",
    ],
    limits: { posts: 25, scheduled: 5 },
  },
  {
    id: "pro",
    title: "Pro",
    price: 10,
    description: "For keeping the good ideas going.",
    cta: "Find your flow",
    popular: true,
    features: [
      "60 posts per month",
      "20 scheduled posts per month",
      "Connect your social accounts",
      "One workspace for your content",
    ],
    limits: { posts: 60, scheduled: 20 },
  },
  {
    id: "premium",
    title: "Premium",
    price: 20,
    description: "For your next big chapter.",
    cta: "Make more happen",
    popular: false,
    features: [
      "Unlimited posts",
      "Unlimited scheduled posts",
      "Connect your social accounts",
      "One workspace for your content",
    ],
    limits: { posts: null, scheduled: null },
  },
];

export function findPlan(id: string | null | undefined) {
  return PRICING_PLANS.find((plan) => plan.id === id);
}

export function getPlan(id: string | null | undefined): PricingPlan {
  return findPlan(id) ?? PRICING_PLANS[0]!;
}

export function exceedsPostLimits(
  plan: PricingPlan,
  posts: number,
  scheduled: number
) {
  return (
    (plan.limits.posts !== null && posts > plan.limits.posts) ||
    (plan.limits.scheduled !== null && scheduled > plan.limits.scheduled)
  );
}

export type ProductEnvironment = {
  DODO_PRODUCT_PRO?: string;
  DODO_PRODUCT_PREMIUM?: string;
};
export function productIdForPlan(id: PlanId, env: ProductEnvironment) {
  return id === "pro"
    ? env.DODO_PRODUCT_PRO
    : id === "premium"
      ? env.DODO_PRODUCT_PREMIUM
      : undefined;
}
export function planForProduct(productId: string, env: ProductEnvironment) {
  return PRICING_PLANS.find(
    (plan) => plan.id !== "free" && productIdForPlan(plan.id, env) === productId
  );
}
