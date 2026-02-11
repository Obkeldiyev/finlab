/*
  Warnings:

  - You are about to drop the column `title_en` on the `Gallery` table. All the data in the column will be lost.
  - You are about to drop the column `title_ru` on the `Gallery` table. All the data in the column will be lost.
  - You are about to drop the column `title_uz` on the `Gallery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Gallery" DROP COLUMN "title_en",
DROP COLUMN "title_ru",
DROP COLUMN "title_uz";
