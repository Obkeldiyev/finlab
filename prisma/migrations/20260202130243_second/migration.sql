/*
  Warnings:

  - Added the required column `course_id` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direction_id` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "course_id" INTEGER NOT NULL,
ADD COLUMN     "direction_id" INTEGER NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Courses" (
    "id" SERIAL NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_ru" TEXT NOT NULL,
    "title_uz" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "description_ru" TEXT NOT NULL,
    "description_uz" TEXT NOT NULL,
    "published_at" TEXT NOT NULL,
    "ends_at" TEXT NOT NULL,

    CONSTRAINT "Courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direction" (
    "id" SERIAL NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_ru" TEXT NOT NULL,
    "title_uz" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "description_ru" TEXT NOT NULL,
    "description_uz" TEXT NOT NULL,
    "published_at" TEXT NOT NULL,
    "ends_at" TEXT NOT NULL,

    CONSTRAINT "direction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_direction_id_fkey" FOREIGN KEY ("direction_id") REFERENCES "direction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
