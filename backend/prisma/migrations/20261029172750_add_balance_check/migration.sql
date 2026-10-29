-- AlterTable
ALTER TABLE "users" ALTER COLUMN "balance" SET DEFAULT 0;

ALTER TABLE "users"
    ADD CONSTRAINT "users_balance_nonnegative_check"
        CHECK ("balance" >= 0);
