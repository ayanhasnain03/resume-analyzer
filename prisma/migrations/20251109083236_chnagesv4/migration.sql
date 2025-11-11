/*
  Warnings:

  - You are about to drop the column `endTime` on the `interview_questions` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `interview_questions` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `interview_questions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "interview_questions" DROP COLUMN "endTime",
DROP COLUMN "startTime",
DROP COLUMN "status";
