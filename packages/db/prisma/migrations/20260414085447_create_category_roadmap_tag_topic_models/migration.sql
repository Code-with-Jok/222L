/*
  Warnings:

  - You are about to drop the column `expires_at` on the `sessions` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoadmapStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('PRACTICE', 'PROJECT', 'ROADMAP', 'TECHSTACK');

-- CreateEnum
CREATE TYPE "NodeStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('ARTICLE', 'VIDEO', 'BOOK', 'COURSE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "display_name" TEXT,
ADD COLUMN     "email_verified_at" TIMESTAMP(3),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "expires_at",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "revoked_at" TIMESTAMP(3),
ADD COLUMN     "token_hash" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_agent" TEXT;

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "RoadmapStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,

    CONSTRAINT "roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_versions" (
    "id" TEXT NOT NULL,
    "roadmap_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "snapshotData" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roadmap_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_nodes" (
    "id" TEXT NOT NULL,
    "roadmap_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "NodeType" NOT NULL DEFAULT 'TECHSTACK',
    "status" "NodeStatus" NOT NULL DEFAULT 'DRAFT',
    "parentId" TEXT,
    "referenceRoadmapId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "topicId" TEXT,

    CONSTRAINT "roadmap_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags_on_roadmaps" (
    "roadmap_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "tags_on_nodes" (
    "nodeId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_on_nodes_pkey" PRIMARY KEY ("nodeId","tagId")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "topicId" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL DEFAULT 'ARTICLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topic_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "roadmap_status_deleted_at_idx" ON "roadmap"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_versions_roadmap_id_version_number_key" ON "roadmap_versions"("roadmap_id", "version_number");

-- CreateIndex
CREATE INDEX "roadmap_nodes_roadmap_id_parentId_order_idx" ON "roadmap_nodes"("roadmap_id", "parentId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_nodes_roadmap_id_slug_key" ON "roadmap_nodes"("roadmap_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "tags_name_idx" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_on_roadmaps_roadmap_id_tag_id_key" ON "tags_on_roadmaps"("roadmap_id", "tag_id");

-- CreateIndex
CREATE INDEX "topics_title_idx" ON "topics"("title");

-- CreateIndex
CREATE INDEX "topic_resources_title_idx" ON "topic_resources"("title");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap" ADD CONSTRAINT "roadmap_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_versions" ADD CONSTRAINT "roadmap_versions_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_nodes" ADD CONSTRAINT "roadmap_nodes_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_nodes" ADD CONSTRAINT "roadmap_nodes_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "roadmap_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_nodes" ADD CONSTRAINT "roadmap_nodes_referenceRoadmapId_fkey" FOREIGN KEY ("referenceRoadmapId") REFERENCES "roadmap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_nodes" ADD CONSTRAINT "roadmap_nodes_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_roadmaps" ADD CONSTRAINT "tags_on_roadmaps_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_roadmaps" ADD CONSTRAINT "tags_on_roadmaps_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_nodes" ADD CONSTRAINT "tags_on_nodes_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "roadmap_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_nodes" ADD CONSTRAINT "tags_on_nodes_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_resources" ADD CONSTRAINT "topic_resources_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
