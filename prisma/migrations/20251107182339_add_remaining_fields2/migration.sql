/*
  Warnings:

  - You are about to drop the column `description` on the `job_opening` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "job_opening" DROP COLUMN "description",
ADD COLUMN     "aboutCompany" TEXT,
ADD COLUMN     "companyLogo" TEXT;
