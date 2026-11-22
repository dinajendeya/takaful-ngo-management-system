/*
  Warnings:

  - Added the required column `titl` to the `family_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "family_requests" ADD COLUMN     "titl" VARCHAR(200) NOT NULL;
