/*
  Warnings:

  - You are about to drop the `Photo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `elonPhoto` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_newsId_fkey";

-- DropForeignKey
ALTER TABLE "elonPhoto" DROP CONSTRAINT "elonPhoto_elonId_fkey";

-- DropTable
DROP TABLE "Photo";

-- DropTable
DROP TABLE "elonPhoto";

-- CreateTable
CREATE TABLE "newsMedia" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "newsId" INTEGER NOT NULL,

    CONSTRAINT "newsMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elonMedia" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "elonId" INTEGER NOT NULL,

    CONSTRAINT "elonMedia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "newsMedia" ADD CONSTRAINT "newsMedia_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elonMedia" ADD CONSTRAINT "elonMedia_elonId_fkey" FOREIGN KEY ("elonId") REFERENCES "elon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
