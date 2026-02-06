/*
  Warnings:

  - Added the required column `direction_id` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `published_at` on the `Courses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `ends_at` on the `Courses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Courses" ADD COLUMN     "direction_id" INTEGER NOT NULL,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "published_at",
ADD COLUMN     "published_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "ends_at",
ADD COLUMN     "ends_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Courses" ADD CONSTRAINT "Courses_direction_id_fkey" FOREIGN KEY ("direction_id") REFERENCES "direction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
