-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "access_token_iv" TEXT,
ADD COLUMN     "access_token_secret_iv" TEXT;
