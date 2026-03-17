/*
  Warnings:

  - The values [povertyAndHunger] on the enum `CauseEnum` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `Organization` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `password` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ASEANCountry" AS ENUM ('Brunei', 'Cambodia', 'Indonesia', 'Laos', 'Malaysia', 'Myanmar', 'Philippines', 'Singapore', 'Thailand', 'Vietnam');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('Pending', 'Approved', 'Rejected', 'Active');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('Pending', 'Confirmed', 'Declined');

-- AlterEnum
BEGIN;
CREATE TYPE "CauseEnum_new" AS ENUM ('educationAndChildren', 'healthAndMedical', 'disasterRelief', 'environmentAndClimate', 'poverty', 'hunger', 'communityDevelopment', 'cleanWater', 'livelihoodAndSkillsTraining', 'animalWelfare', 'others');
ALTER TABLE "Post" ALTER COLUMN "causes" TYPE "CauseEnum_new"[] USING ("causes"::text::"CauseEnum_new"[]);
ALTER TYPE "CauseEnum" RENAME TO "CauseEnum_old";
ALTER TYPE "CauseEnum_new" RENAME TO "CauseEnum";
DROP TYPE "CauseEnum_old";
COMMIT;

-- AlterEnum
ALTER TYPE "SupportType" ADD VALUE 'InKind';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "country" "ASEANCountry" NOT NULL DEFAULT 'Philippines',
ADD COLUMN     "password" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "AccountStatus" NOT NULL DEFAULT 'Pending';

-- CreateTable
CREATE TABLE "Donor" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" "AccountStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "type" "SupportType" NOT NULL,
    "amount" DOUBLE PRECISION,
    "volunteerCount" INTEGER,
    "inKindItemId" TEXT,
    "quantity" DOUBLE PRECISION,
    "status" "ContributionStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonorOrganizationPartner" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DonorOrganizationPartner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Donor_email_key" ON "Donor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DonorOrganizationPartner_donorId_orgId_key" ON "DonorOrganizationPartner"("donorId", "orgId");

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_inKindItemId_fkey" FOREIGN KEY ("inKindItemId") REFERENCES "PostInKindItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorOrganizationPartner" ADD CONSTRAINT "DonorOrganizationPartner_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorOrganizationPartner" ADD CONSTRAINT "DonorOrganizationPartner_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
