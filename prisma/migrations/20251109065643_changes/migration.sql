/*
  Warnings:

  - You are about to drop the column `filteringDescription` on the `job_opening` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "job_opening" DROP COLUMN "filteringDescription",
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "interview_questions" (
    "id" TEXT NOT NULL,
    "questions" JSONB NOT NULL DEFAULT '[]',
    "duration" INTEGER NOT NULL DEFAULT 5,
    "status" "InterviewStatus" NOT NULL DEFAULT 'PENDING',
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobOpeningId" TEXT NOT NULL,

    CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interview_questions_jobOpeningId_idx" ON "interview_questions"("jobOpeningId");

-- AddForeignKey
ALTER TABLE "interview_questions" ADD CONSTRAINT "interview_questions_jobOpeningId_fkey" FOREIGN KEY ("jobOpeningId") REFERENCES "job_opening"("id") ON DELETE CASCADE ON UPDATE CASCADE;
