/*
  Warnings:

  - The `status` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "POST_STATUS" AS ENUM ('PENDING', 'FAILED', 'SUCCESS');

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "status",
ADD COLUMN     "status" "POST_STATUS" NOT NULL DEFAULT 'PENDING';
