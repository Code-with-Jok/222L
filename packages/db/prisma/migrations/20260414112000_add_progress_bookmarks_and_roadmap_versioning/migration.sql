CREATE TYPE "RoadmapVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED');
CREATE TYPE "RoadmapVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

ALTER TABLE "roadmap"
ADD COLUMN "visibility" "RoadmapVisibility" NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN "current_version_id" TEXT,
ADD COLUMN "owner_id" TEXT;

UPDATE "roadmap"
SET "owner_id" = "author_id"
WHERE "owner_id" IS NULL;

ALTER TABLE "roadmap"
ALTER COLUMN "owner_id" SET NOT NULL;

ALTER TABLE "roadmap_versions"
ADD COLUMN "title" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "status" "RoadmapVersionStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "changelog" TEXT,
ADD COLUMN "created_by_id" TEXT,
ADD COLUMN "published_by_id" TEXT,
ADD COLUMN "published_at" TIMESTAMP(3);

UPDATE "roadmap_versions" rv
SET
  "title" = r."title",
  "description" = r."description",
  "created_by_id" = r."author_id"
FROM "roadmap" r
WHERE rv."roadmap_id" = r."id";

ALTER TABLE "roadmap_versions"
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "created_by_id" SET NOT NULL;

CREATE TABLE "bookmarks" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "roadmap_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_progress" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "roadmap_id" TEXT NOT NULL,
  "roadmap_node_id" TEXT NOT NULL,
  "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "completed_at" TIMESTAMP(3),
  "last_visited_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "roadmap_current_version_id_key" ON "roadmap"("current_version_id");
CREATE INDEX "roadmap_owner_id_status_deleted_at_idx" ON "roadmap"("owner_id", "status", "deleted_at");
CREATE INDEX "roadmap_versions_roadmap_id_status_created_at_idx" ON "roadmap_versions"("roadmap_id", "status", "created_at");
CREATE UNIQUE INDEX "bookmarks_user_id_roadmap_id_key" ON "bookmarks"("user_id", "roadmap_id");
CREATE INDEX "bookmarks_roadmap_id_created_at_idx" ON "bookmarks"("roadmap_id", "created_at");
CREATE UNIQUE INDEX "user_progress_user_id_roadmap_node_id_key" ON "user_progress"("user_id", "roadmap_node_id");
CREATE INDEX "user_progress_user_id_roadmap_id_status_idx" ON "user_progress"("user_id", "roadmap_id", "status");
CREATE INDEX "user_progress_roadmap_id_status_idx" ON "user_progress"("roadmap_id", "status");

ALTER TABLE "roadmap"
ADD CONSTRAINT "roadmap_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "roadmap"
ADD CONSTRAINT "roadmap_current_version_id_fkey" FOREIGN KEY ("current_version_id") REFERENCES "roadmap_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "roadmap_versions"
ADD CONSTRAINT "roadmap_versions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "roadmap_versions"
ADD CONSTRAINT "roadmap_versions_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "bookmarks"
ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bookmarks"
ADD CONSTRAINT "bookmarks_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_progress"
ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_progress"
ADD CONSTRAINT "user_progress_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_progress"
ADD CONSTRAINT "user_progress_roadmap_node_id_fkey" FOREIGN KEY ("roadmap_node_id") REFERENCES "roadmap_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
