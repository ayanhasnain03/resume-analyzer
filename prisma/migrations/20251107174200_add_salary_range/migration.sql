-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY');

-- AlterTable
ALTER TABLE "job_opening" ADD COLUMN     "jobType" "JobType" NOT NULL DEFAULT 'FULL_TIME',
ADD COLUMN     "salaryRange" JSONB,
ALTER COLUMN "requiredSkills" SET DEFAULT '[]';
