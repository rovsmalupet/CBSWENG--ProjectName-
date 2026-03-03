-- CreateEnum
CREATE TYPE "CauseEnum" AS ENUM ('educationAndChildren', 'healthAndMedical', 'disasterRelief', 'environmentAndClimate', 'povertyAndHunger', 'communityDevelopment', 'livelihoodAndSkillsTraining', 'animalWelfare', 'others');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('High', 'Medium', 'Low');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('Draft', 'Published');

-- CreateEnum
CREATE TYPE "SupportStatus" AS ENUM ('Open', 'Closed');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "orgName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT 'tempID',
    "projectName" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "cause" "CauseEnum" NOT NULL,
    "location" TEXT,
    "impactGoals" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'Medium',
    "overallStatus" "PostStatus" NOT NULL DEFAULT 'Draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monetaryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "monetaryTargetAmount" DOUBLE PRECISION,
    "monetaryCurrentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monetaryStatus" "SupportStatus" NOT NULL DEFAULT 'Open',
    "volunteerEnabled" BOOLEAN NOT NULL DEFAULT false,
    "volunteerTargetCount" INTEGER,
    "volunteerCurrentCount" INTEGER NOT NULL DEFAULT 0,
    "volunteerStatus" "SupportStatus" NOT NULL DEFAULT 'Open',

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostInKindItem" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "targetQuantity" DOUBLE PRECISION NOT NULL,
    "currentQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT,
    "status" "SupportStatus" NOT NULL DEFAULT 'Open',

    CONSTRAINT "PostInKindItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_email_key" ON "Organization"("email");

-- AddForeignKey
ALTER TABLE "PostInKindItem" ADD CONSTRAINT "PostInKindItem_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
