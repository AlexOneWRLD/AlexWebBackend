-- DropIndex
DROP INDEX "users_email_key";

-- DropIndex
DROP INDEX "users_login_key";

CREATE UNIQUE INDEX "users_active_email_unique"
    ON "users" (LOWER("email"))
    WHERE "deleted_at" IS NULL;

CREATE UNIQUE INDEX "users_active_login_unique"
    ON "users" (LOWER("login"))
    WHERE "deleted_at" IS NULL;