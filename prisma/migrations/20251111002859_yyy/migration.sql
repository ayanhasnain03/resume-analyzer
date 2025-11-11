/*
  Warnings:

  - You are about to drop the `interview_questions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."interview_questions" DROP CONSTRAINT "interview_questions_jobOpeningId_fkey";

-- DropTable
DROP TABLE "public"."interview_questions";

-- CreateTable
CREATE TABLE "interview" (
    "id" TEXT NOT NULL,
    "questions" JSONB NOT NULL DEFAULT '[]',
    "duration" INTEGER NOT NULL DEFAULT 5,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobOpeningId" TEXT NOT NULL,

    CONSTRAINT "interview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interview_jobOpeningId_idx" ON "interview"("jobOpeningId");

-- AddForeignKey
ALTER TABLE "interview" ADD CONSTRAINT "interview_jobOpeningId_fkey" FOREIGN KEY ("jobOpeningId") REFERENCES "job_opening"("id") ON DELETE CASCADE ON UPDATE CASCADE;
