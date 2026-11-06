/*
  Warnings:

  - Made the column `age` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "age" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

ALTER TABLE "users"
    ADD CONSTRAINT "users_age_range_check"
        CHECK ("age" BETWEEN 1 AND 120);
