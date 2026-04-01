-- AlterTable
ALTER TABLE "Refund" ADD COLUMN "postId" TEXT;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
