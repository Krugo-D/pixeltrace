-- AlterTable
ALTER TABLE "analysis_runs" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "statusMessage" TEXT;
