/*
  Warnings:

  - You are about to drop the column `cause` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `impactGoals` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "cause",
DROP COLUMN "impactGoals",
ADD COLUMN     "causes" "CauseEnum"[],
ADD COLUMN     "endDate" TEXT,
ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "startDate" TEXT,
ADD COLUMN     "startTime" TEXT;
