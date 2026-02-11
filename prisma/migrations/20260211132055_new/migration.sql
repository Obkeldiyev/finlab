/*
  Warnings:

  - Added the required column `full_name` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workplace` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "full_name" TEXT NOT NULL,
ADD COLUMN     "is_approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rating" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "workplace" TEXT NOT NULL;
