/*
  Warnings:

  - Changed the type of `status` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "STATUS" ADD VALUE 'REFUNDED';
ALTER TYPE "STATUS" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "amount" DOUBLE PRECISION,
ADD COLUMN     "captured" BOOLEAN DEFAULT false,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "invoiceId" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "subscriptionId" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "STATUS" NOT NULL;

-- CreateIndex
CREATE INDEX "Transaction_subscriptionId_idx" ON "Transaction"("subscriptionId");

-- CreateIndex
CREATE INDEX "Transaction_paymentId_idx" ON "Transaction"("paymentId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
