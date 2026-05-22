-- AlterTable
ALTER TABLE "Gallery" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "deletedAt" TIMESTAMP(3);
