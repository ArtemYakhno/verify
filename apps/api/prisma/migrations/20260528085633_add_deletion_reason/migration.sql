-- CreateEnum
CREATE TYPE "DeletionReason" AS ENUM ('MANUAL', 'INHERIT');

-- AlterTable
ALTER TABLE "Gallery" ADD COLUMN     "deletionReason" "DeletionReason";

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "deletionReason" "DeletionReason";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletionReason" "DeletionReason";
