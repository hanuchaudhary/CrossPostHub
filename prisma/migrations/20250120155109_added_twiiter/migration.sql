-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "oauth_consumer_key" TEXT,
ADD COLUMN     "oauth_consumer_secret" TEXT,
ADD COLUMN     "oauth_token" TEXT,
ADD COLUMN     "oauth_token_secret" TEXT;
