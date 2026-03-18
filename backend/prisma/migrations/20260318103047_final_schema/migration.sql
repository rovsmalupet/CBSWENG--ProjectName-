/*
  Warnings:

  - The values [educationAndChildren,healthAndMedical,disasterRelief,environmentAndClimate,poverty,hunger,communityDevelopment,livelihoodAndSkillsTraining,animalWelfare] on the enum `CauseEnum` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `donorId` on the `Contribution` table. All the data in the column will be lost.
  - Added the required column `donorName` to the `Contribution` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CauseEnum_new" AS ENUM ('noPoverty', 'zeroHunger', 'goodHealth', 'qualityEducation', 'genderEquality', 'cleanWater', 'affordableEnergy', 'decentWork', 'industry', 'reducedInequalities', 'sustainableCities', 'responsibleConsumption', 'climateAction', 'lifeBelowWater', 'lifeOnLand', 'peaceAndJustice', 'partnerships', 'others');
ALTER TABLE "Post" ALTER COLUMN "causes" TYPE "CauseEnum_new"[] USING ("causes"::text::"CauseEnum_new"[]);
ALTER TYPE "CauseEnum" RENAME TO "CauseEnum_old";
ALTER TYPE "CauseEnum_new" RENAME TO "CauseEnum";
DROP TYPE "CauseEnum_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_donorId_fkey";

-- AlterTable
ALTER TABLE "Contribution" DROP COLUMN "donorId",
ADD COLUMN     "donorName" TEXT NOT NULL,
ADD COLUMN     "partnershipId" TEXT;

-- AlterTable
ALTER TABLE "Donor" ADD COLUMN     "country" "ASEANCountry" NOT NULL DEFAULT 'Philippines';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "startTime" TEXT;

-- CreateTable
CREATE TABLE "PostAuditLog" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" "PostStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostAuditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostAuditLog" ADD CONSTRAINT "PostAuditLog_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostAuditLog" ADD CONSTRAINT "PostAuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_partnershipId_fkey" FOREIGN KEY ("partnershipId") REFERENCES "DonorOrganizationPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
