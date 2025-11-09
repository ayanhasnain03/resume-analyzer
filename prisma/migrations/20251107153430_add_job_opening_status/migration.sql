-- CreateEnum
CREATE TYPE "JobOpeningStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CLOSED');

-- AlterTable
ALTER TABLE "job_opening" ADD COLUMN     "status" "JobOpeningStatus" NOT NULL DEFAULT 'ACTIVE';
