/*
  Warnings:

  - You are about to drop the column `userId` on the `job_applicant_interview` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."job_applicant_interview" DROP CONSTRAINT "job_applicant_interview_userId_fkey";

-- AlterTable
ALTER TABLE "job_applicant_interview" DROP COLUMN "userId";
