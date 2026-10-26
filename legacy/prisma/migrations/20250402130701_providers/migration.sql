/*
  Warnings:

  - You are about to drop the column `provider` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "provider",
ADD COLUMN     "providers" TEXT;
