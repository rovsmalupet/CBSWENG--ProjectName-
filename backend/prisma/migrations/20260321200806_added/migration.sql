/*
  Warnings:

  - You are about to drop the `OrganizationDocument` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `affiliation` to the `Donor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentType" ADD VALUE 'Certificate';
ALTER TYPE "DocumentType" ADD VALUE 'Other';

-- DropForeignKey
ALTER TABLE "OrganizationDocument" DROP CONSTRAINT "OrganizationDocument_orgId_fkey";

-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "proofFileName" TEXT,
ADD COLUMN     "proofFilePath" TEXT,
ADD COLUMN     "proofFileSize" INTEGER,
ADD COLUMN     "proofMimeType" TEXT;

-- AlterTable
ALTER TABLE "Donor" ADD COLUMN     "affiliation" TEXT NOT NULL,
ADD COLUMN     "bio" TEXT;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "bio" TEXT;

-- DropTable
DROP TABLE "OrganizationDocument";

-- CreateTable
CREATE TABLE "DocumentUpload" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" "DocumentType" NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentUpload_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DocumentUpload" ADD CONSTRAINT "DocumentUpload_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
