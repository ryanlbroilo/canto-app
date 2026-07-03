-- CreateEnum
CREATE TYPE "VoicePart" AS ENUM ('MELODIA', 'VOZ2', 'VOZ3', 'SOPRANO', 'CONTRALTO', 'TENOR', 'BAIXO', 'UNASSIGNED');

-- CreateTable
CREATE TABLE "MinistryPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Ensaio do ministério',
    "notes" TEXT,
    "warmup" JSONB,
    "harmonySet" JSONB,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MinistryPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MinistryMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "voicePart" "VoicePart" NOT NULL DEFAULT 'UNASSIGNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MinistryMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MinistryPlan_tenantId_key" ON "MinistryPlan"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "MinistryMember_userId_key" ON "MinistryMember"("userId");

-- CreateIndex
CREATE INDEX "MinistryMember_tenantId_idx" ON "MinistryMember"("tenantId");

-- AddForeignKey
ALTER TABLE "MinistryPlan" ADD CONSTRAINT "MinistryPlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinistryMember" ADD CONSTRAINT "MinistryMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
