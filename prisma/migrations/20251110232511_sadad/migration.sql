-- CreateTable
CREATE TABLE "job_applicant_interview" (
    "id" TEXT NOT NULL,
    "jobApplicantId" TEXT NOT NULL,
    "jobOpeningId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "InterviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_applicant_interview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_applicant_interview_jobApplicantId_idx" ON "job_applicant_interview"("jobApplicantId");

-- AddForeignKey
ALTER TABLE "job_applicant_interview" ADD CONSTRAINT "job_applicant_interview_jobApplicantId_fkey" FOREIGN KEY ("jobApplicantId") REFERENCES "job_applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applicant_interview" ADD CONSTRAINT "job_applicant_interview_jobOpeningId_fkey" FOREIGN KEY ("jobOpeningId") REFERENCES "job_opening"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applicant_interview" ADD CONSTRAINT "job_applicant_interview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
