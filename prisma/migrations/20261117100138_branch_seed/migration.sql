/*
  Warnings:

  - Changed the type of `governorate` on the `branches` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "GazaGovernorate" AS ENUM ('NORTH_GAZA', 'GAZA', 'DEIR_AL_BALAH', 'KHAN_YOUNIS', 'RAFAH');

-- AlterTable
ALTER TABLE "branches" DROP COLUMN "governorate",
ADD COLUMN     "governorate" "GazaGovernorate" NOT NULL;
