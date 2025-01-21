/*
  Warnings:

  - You are about to drop the column `oauth_consumer_key` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `oauth_consumer_secret` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "oauth_consumer_key",
DROP COLUMN "oauth_consumer_secret";
