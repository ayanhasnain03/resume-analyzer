-- CreateEnum
CREATE TYPE "JobApplicantStatus" AS ENUM ('SELECTED', 'REJECTED', 'PENDING');

-- CreateEnum
CREATE TYPE "JobOpeningLocation" AS ENUM ('OFFICE', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'RECUITER');

-- AlterTable
ALTER TABLE "account" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "github" TEXT,
ADD COLUMN     "linkdinUrl" TEXT,
ADD COLUMN     "portfolio" TEXT,
ADD COLUMN     "resume" JSONB,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "job_opening" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "requiredSkills" JSONB NOT NULL,
    "location" "JobOpeningLocation" NOT NULL DEFAULT 'OFFICE',
    "experienceLevel" TEXT NOT NULL,
    "postedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_opening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applicant" (
    "id" TEXT NOT NULL,
    "resume" TEXT NOT NULL,
    "feedbackResume" JSONB NOT NULL,
    "status" "JobApplicantStatus" NOT NULL DEFAULT 'PENDING',
    "jobOpeningId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_applicant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_opening_title_idx" ON "job_opening"("title");

-- CreateIndex
CREATE INDEX "job_opening_department_location_experienceLevel_idx" ON "job_opening"("department", "location", "experienceLevel");

-- CreateIndex
CREATE INDEX "job_opening_postedBy_idx" ON "job_opening"("postedBy");

-- CreateIndex
CREATE INDEX "job_applicant_jobOpeningId_idx" ON "job_applicant"("jobOpeningId");

-- CreateIndex
CREATE INDEX "job_applicant_userId_idx" ON "job_applicant"("userId");

-- CreateIndex
CREATE INDEX "job_applicant_status_idx" ON "job_applicant"("status");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "account_providerId_accountId_idx" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "session_expiresAt_idx" ON "session"("expiresAt");

-- CreateIndex
CREATE INDEX "user_name_idx" ON "user"("name");

-- CreateIndex
CREATE INDEX "user_name_emailVerified_idx" ON "user"("name", "emailVerified");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "verification_expiresAt_idx" ON "verification"("expiresAt");

-- AddForeignKey
ALTER TABLE "job_opening" ADD CONSTRAINT "job_opening_postedBy_fkey" FOREIGN KEY ("postedBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applicant" ADD CONSTRAINT "job_applicant_jobOpeningId_fkey" FOREIGN KEY ("jobOpeningId") REFERENCES "job_opening"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applicant" ADD CONSTRAINT "job_applicant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
