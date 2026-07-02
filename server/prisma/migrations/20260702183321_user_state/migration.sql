-- CreateTable
CREATE TABLE "UserState" (
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "profileName" TEXT,
    "profileGoal" TEXT,
    "settings" JSONB,
    "baseline" JSONB,
    "rangeHistory" JSONB,
    "achievements" JSONB,
    "seenOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserState_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "UserState_tenantId_idx" ON "UserState"("tenantId");

-- AddForeignKey
ALTER TABLE "UserState" ADD CONSTRAINT "UserState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
