-- Add nullable hashed refresh-token storage for one active session per user.
ALTER TABLE "users" ADD COLUMN "refresh_token" TEXT;

CREATE UNIQUE INDEX "users_refresh_token_key" ON "users"("refresh_token");
