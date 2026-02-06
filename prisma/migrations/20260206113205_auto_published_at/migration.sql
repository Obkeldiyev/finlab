/*
  Warnings:

  - The `published_at` column on the `direction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `ends_at` on the `direction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Courses" ALTER COLUMN "published_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "direction" DROP COLUMN "published_at",
ADD COLUMN     "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "ends_at",
ADD COLUMN     "ends_at" TIMESTAMP(3) NOT NULL;
