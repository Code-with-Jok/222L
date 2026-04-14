ALTER TABLE "roadmap"
ADD COLUMN "slug" TEXT;

UPDATE "roadmap"
SET "slug" = LOWER(
  REGEXP_REPLACE(
    COALESCE("title", 'roadmap'::TEXT) || '-' || SUBSTRING("id" FROM 1 FOR 8),
    '[^a-zA-Z0-9]+',
    '-',
    'g'
  )
)
WHERE "slug" IS NULL;

ALTER TABLE "roadmap"
ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "roadmap_slug_key" ON "roadmap"("slug");
CREATE INDEX "roadmap_slug_status_deleted_at_idx" ON "roadmap"("slug", "status", "deleted_at");

ALTER TABLE "sessions"
ADD COLUMN "expires_at" TIMESTAMP(3);

UPDATE "sessions"
SET "expires_at" = CURRENT_TIMESTAMP + INTERVAL '30 days'
WHERE "expires_at" IS NULL;

ALTER TABLE "sessions"
ALTER COLUMN "expires_at" SET NOT NULL;

CREATE INDEX "sessions_user_id_revoked_at_expires_at_idx"
ON "sessions"("user_id", "revoked_at", "expires_at");
