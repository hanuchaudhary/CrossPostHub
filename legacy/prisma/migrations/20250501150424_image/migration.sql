/*
  Warnings:

  - You are about to drop the column `caption` on the `GeneratedImage` table. All the data in the column will be lost.
  - Added the required column `userId` to the `GeneratedImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GeneratedImage" DROP COLUMN "caption",
ADD COLUMN     "prompt" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "GeneratedImage" ADD CONSTRAINT "GeneratedImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
