/*
  Warnings:

  - You are about to drop the column `facebookId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `firebaseUid` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `instagramId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twitterId` on the `User` table. All the data in the column will be lost.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_facebookId_key";

-- DropIndex
DROP INDEX "User_firebaseUid_key";

-- DropIndex
DROP INDEX "User_instagramId_key";

-- DropIndex
DROP INDEX "User_twitterId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "facebookId",
DROP COLUMN "firebaseUid",
DROP COLUMN "instagramId",
DROP COLUMN "twitterId",
ADD COLUMN     "password" TEXT NOT NULL;
