/*
  Warnings:

  - You are about to drop the column `district` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `qualification` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Teacher` table. All the data in the column will be lost.
  - Added the required column `highestQualification` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "district",
DROP COLUMN "qualification",
DROP COLUMN "state",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "highestQualification" TEXT NOT NULL;
