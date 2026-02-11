/*
  Warnings:

  - Added the required column `title` to the `Gallery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Gallery" ADD COLUMN     "title" TEXT NOT NULL;
