/*
  Warnings:

  - You are about to drop the column `cancelledAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `pausedAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `Transaction` table. All the data in the column will be lost.
  - Changed the type of `status` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_planId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_planId_fkey";

-- DropIndex
DROP INDEX "Transaction_order_id_key";

-- AlterTable
ALTER TABLE "Plan" ALTER COLUMN "razorpayPlanId" DROP NOT NULL,
ALTER COLUMN "razorpayPlanId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "cancelledAt",
DROP COLUMN "pausedAt";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "amount",
DROP COLUMN "planId",
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "order_id" DROP NOT NULL,
ALTER COLUMN "paymentId" DROP NOT NULL,
ALTER COLUMN "paymentId" DROP DEFAULT,
ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "Transaction_id_key";
