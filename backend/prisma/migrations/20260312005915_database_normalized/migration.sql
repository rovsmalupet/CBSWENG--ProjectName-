-- CreateEnum
CREATE TYPE "SupportType" AS ENUM ('Monetary', 'Volunteer');

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "endTime",
DROP COLUMN "monetaryCurrentAmount",
DROP COLUMN "monetaryEnabled",
DROP COLUMN "monetaryStatus",
DROP COLUMN "monetaryTargetAmount",
DROP COLUMN "startTime",
DROP COLUMN "volunteerCurrentCount",
DROP COLUMN "volunteerEnabled",
DROP COLUMN "volunteerStatus",
DROP COLUMN "volunteerTargetCount",
ALTER COLUMN "overallStatus" SET DEFAULT 'Pending',
DROP COLUMN "endDate",
ADD COLUMN     "endDate" TIMESTAMP(3),
DROP COLUMN "startDate",
ADD COLUMN     "startDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PostSupportOption" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "type" "SupportType" NOT NULL,
    "targetAmount" DOUBLE PRECISION,
    "currentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetCount" INTEGER,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "status" "SupportStatus" NOT NULL DEFAULT 'Open',
    CONSTRAINT "PostSupportOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostSupportOption_postId_type_key" ON "PostSupportOption"("postId", "type");

-- AddForeignKey
ALTER TABLE "PostSupportOption" ADD CONSTRAINT "PostSupportOption_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterEnum
BEGIN;
CREATE TYPE "SupportStatus_new" AS ENUM ('Open', 'Closed');
ALTER TABLE "PostSupportOption" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "PostSupportOption" ALTER COLUMN "status" TYPE "SupportStatus_new" USING ("status"::text::"SupportStatus_new");
ALTER TABLE "PostInKindItem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "PostInKindItem" ALTER COLUMN "status" TYPE "SupportStatus_new" USING ("status"::text::"SupportStatus_new");
ALTER TYPE "SupportStatus" RENAME TO "SupportStatus_old";
ALTER TYPE "SupportStatus_new" RENAME TO "SupportStatus";
DROP TYPE "SupportStatus_old";
ALTER TABLE "PostSupportOption" ALTER COLUMN "status" SET DEFAULT 'Open';
ALTER TABLE "PostInKindItem" ALTER COLUMN "status" SET DEFAULT 'Open';
COMMIT;