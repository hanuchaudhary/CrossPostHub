CREATE TABLE "SocialConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "platformUserId" TEXT,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "scopes" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SocialConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "SocialConnection_userId_provider_externalId_key" ON "SocialConnection"("userId", "provider", "externalId");
CREATE INDEX "SocialConnection_userId_idx" ON "SocialConnection"("userId");
CREATE INDEX "SocialConnection_provider_platformUserId_idx" ON "SocialConnection"("provider", "platformUserId");

CREATE TABLE "SocialConnectState" (
    "state" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "codeVerifier" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "SocialConnectState_expiresAt_idx" ON "SocialConnectState"("expiresAt");
