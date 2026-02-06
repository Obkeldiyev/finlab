/*
  Warnings:

  - A unique constraint covering the columns `[phone_number]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_course_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_direction_id_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "workplace" TEXT,
ALTER COLUMN "middle_name" DROP NOT NULL,
ALTER COLUMN "course_id" DROP NOT NULL,
ALTER COLUMN "direction_id" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_number_key" ON "User"("phone_number");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_direction_id_fkey" FOREIGN KEY ("direction_id") REFERENCES "direction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
