-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'NZD');

-- AlterTable
ALTER TABLE "job_opening" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'USD',
ADD COLUMN     "currencySymbol" TEXT NOT NULL DEFAULT '$';
