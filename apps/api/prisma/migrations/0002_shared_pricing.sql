-- Preserve subscriptions and transaction references while removing the Plan FK.
PRAGMA defer_foreign_keys=ON;
CREATE TABLE "new_Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "dodoSubscriptionId" TEXT,
    "status" TEXT NOT NULL,
    "nextBillingAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Subscription"
SELECT s."id", s."userId",
  CASE lower(p."title") WHEN 'free' THEN 'free' WHEN 'pro' THEN 'pro' WHEN 'premium' THEN 'premium' ELSE s."planId" END,
  s."dodoSubscriptionId", s."status", s."nextBillingAt", s."createdAt", s."updatedAt"
FROM "Subscription" s LEFT JOIN "Plan" p ON p."id" = s."planId";
-- D1 keeps foreign keys enabled. Copy Transaction out before dropping its parent
-- to avoid ON DELETE SET NULL clearing existing subscription associations.
CREATE TEMP TABLE "_billing_transaction_links" AS SELECT "id", "subscriptionId" FROM "Transaction";
DROP TABLE "Subscription";
ALTER TABLE "new_Subscription" RENAME TO "Subscription";
CREATE UNIQUE INDEX "Subscription_dodoSubscriptionId_key" ON "Subscription"("dodoSubscriptionId");
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");
UPDATE "Transaction" SET "subscriptionId" = (SELECT "subscriptionId" FROM "_billing_transaction_links" WHERE "id" = "Transaction"."id");
DROP TABLE "_billing_transaction_links";
DROP TABLE "Plan";
PRAGMA defer_foreign_keys=OFF;
