/*
  Warnings:

  - You are about to drop the column `category` on the `Post` table. All the data in the column will be lost.
  - Added the required column `representativePerson` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SupportStatus" ADD VALUE 'Edited';
ALTER TYPE "SupportStatus" ADD VALUE 'Deleted';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "representativePerson" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "category";
