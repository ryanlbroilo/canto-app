-- AlterTable
ALTER TABLE "UserState" ADD COLUMN     "freeze" JSONB,
ADD COLUMN     "reminder" JSONB,
ADD COLUMN     "weeklyGoal" JSONB;
