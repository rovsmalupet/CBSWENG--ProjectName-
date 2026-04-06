/*
  Warnings:

  - Made the column `postId` on table `Payment` optional.

*/
-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "postId" DROP NOT NULL;
