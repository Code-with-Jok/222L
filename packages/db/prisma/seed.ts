import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  NodeStatus,
  NodeType,
  PrismaClient,
  ProgressStatus,
  ResourceType,
  RoadmapStatus,
  RoadmapVersionStatus,
  Role,
} from "../src/generated/client/index.js";

const connectionString = process.env.DATABASE_URL;

console.log("Using DATABASE_URL:", connectionString);
console.log(
  "Using DATABASE_URL:",
  connectionString?.replace(/:[^:@]+@/, ":****@")
);

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const sessionExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

async function main() {
  console.log("Starting database seed...");

  await prisma.tagsOnNodes.deleteMany();
  await prisma.tagsOnRoadmaps.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.roadmapNode.deleteMany();
  await prisma.roadmapVersion.deleteMany();
  await prisma.topicResource.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.roadmap.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "System Admin",
      displayName: "Roadmap Hub Admin",
      passwordHash: "hashed_password_here",
      role: Role.ADMIN,
      sessions: {
        create: [
          {
            expiresAt: sessionExpiresAt,
            tokenHash: "seed-admin-session-token",
            userAgent: "seed-script",
            ipAddress: "127.0.0.1",
          },
        ],
      },
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      name: "Normal User",
      displayName: "Roadmap Learner",
      passwordHash: "hashed_password_here",
      role: Role.USER,
      sessions: {
        create: [
          {
            expiresAt: sessionExpiresAt,
          },
        ],
      },
    },
  });

  const backendCategory = await prisma.category.create({
    data: {
      name: "Backend Development",
      slug: "backend-development",
      children: {
        create: [
          { name: "Node.js", slug: "node-js" },
          { name: "Databases", slug: "databases" },
        ],
      },
    },
    include: { children: true },
  });

  const [nodeTag, postgresTag, apiTag] = await Promise.all([
    prisma.tag.create({
      data: {
        name: "Node.js",
        slug: "node-js",
        description: "JavaScript runtime for backend services.",
        color: "#539E43",
      },
    }),
    prisma.tag.create({
      data: {
        name: "PostgreSQL",
        slug: "postgresql",
        description: "Relational database for transactional workloads.",
        color: "#336791",
      },
    }),
    prisma.tag.create({
      data: {
        name: "API Design",
        slug: "api-design",
        description: "Principles for building web APIs.",
        color: "#7C3AED",
      },
    }),
  ]);

  const roadmap = await prisma.roadmap.create({
    data: {
      title: "Backend Developer",
      slug: "backend-developer",
      description:
        "A practical roadmap covering server-side fundamentals, APIs, databases, caching, and deployment.",
      status: RoadmapStatus.PUBLISHED,
      authorId: admin.id,
      ownerId: admin.id,
      tags: {
        create: [
          { tagId: nodeTag.id },
          { tagId: postgresTag.id },
          { tagId: apiTag.id },
        ],
      },
    },
  });

  const fundamentalsTopic = await prisma.topic.create({
    data: {
      title: "HTTP Fundamentals",
      description:
        "Learn request-response flow, methods, status codes, and headers.",
      resources: {
        create: [
          {
            title: "MDN HTTP Overview",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
            description: "A solid primer on how HTTP works.",
            type: ResourceType.ARTICLE,
          },
          {
            title: "HTTP Crash Course",
            url: "https://www.youtube.com/watch?v=iYM2zFP3Zn0",
            description: "Video refresher for the HTTP protocol.",
            type: ResourceType.VIDEO,
          },
        ],
      },
    },
    include: { resources: true },
  });

  const databaseTopic = await prisma.topic.create({
    data: {
      title: "Relational Database Basics",
      description:
        "Model data, normalize tables, and use indexes intentionally.",
      resources: {
        create: [
          {
            title: "PostgreSQL Tutorial",
            url: "https://www.postgresql.org/docs/current/tutorial.html",
            description: "Official PostgreSQL tutorial.",
            type: ResourceType.ARTICLE,
          },
        ],
      },
    },
    include: { resources: true },
  });

  const rootNode = await prisma.roadmapNode.create({
    data: {
      roadmapId: roadmap.id,
      title: "Backend Fundamentals",
      slug: "backend-fundamentals",
      description: "Core concepts every backend engineer should master first.",
      type: NodeType.TECHSTACK,
      status: NodeStatus.PUBLISHED,
      order: 0,
      topicId: fundamentalsTopic.id,
      tags: {
        create: [{ tagId: apiTag.id }],
      },
    },
  });

  const databaseNode = await prisma.roadmapNode.create({
    data: {
      roadmapId: roadmap.id,
      title: "Databases",
      slug: "databases",
      description: "Understand relational modeling, SQL, and indexing.",
      type: NodeType.TECHSTACK,
      status: NodeStatus.PUBLISHED,
      parentId: rootNode.id,
      order: 1,
      topicId: databaseTopic.id,
      tags: {
        create: [{ tagId: postgresTag.id }],
      },
    },
  });

  const apiNode = await prisma.roadmapNode.create({
    data: {
      roadmapId: roadmap.id,
      title: "Build APIs",
      slug: "build-apis",
      description:
        "Design RESTful APIs, validation layers, and error handling.",
      type: NodeType.PROJECT,
      status: NodeStatus.PUBLISHED,
      parentId: rootNode.id,
      order: 2,
      tags: {
        create: [{ tagId: nodeTag.id }, { tagId: apiTag.id }],
      },
    },
  });

  const version = await prisma.roadmapVersion.create({
    data: {
      roadmapId: roadmap.id,
      versionNumber: 1,
      title: roadmap.title,
      description: roadmap.description,
      status: RoadmapVersionStatus.PUBLISHED,
      changelog: "Initial public release of the backend roadmap.",
      createdById: admin.id,
      publishedById: admin.id,
      publishedAt: new Date(),
      snapshotData: {
        roadmap: {
          id: roadmap.id,
          title: roadmap.title,
          slug: roadmap.slug,
          status: roadmap.status,
        },
        categories: [
          {
            id: backendCategory.id,
            slug: backendCategory.slug,
            children: backendCategory.children.map((child) => ({
              id: child.id,
              slug: child.slug,
            })),
          },
        ],
        nodes: [
          {
            id: rootNode.id,
            slug: rootNode.slug,
            children: [databaseNode.id, apiNode.id],
          },
          {
            id: databaseNode.id,
            slug: databaseNode.slug,
            children: [],
          },
          {
            id: apiNode.id,
            slug: apiNode.slug,
            children: [],
          },
        ],
      },
    },
  });

  const draftVersion = await prisma.roadmapVersion.create({
    data: {
      roadmapId: roadmap.id,
      versionNumber: 2,
      title: `${roadmap.title} Draft`,
      description: "Upcoming additions around caching and message queues.",
      status: RoadmapVersionStatus.DRAFT,
      createdById: admin.id,
      snapshotData: {
        roadmap: {
          id: roadmap.id,
          title: roadmap.title,
          slug: roadmap.slug,
          status: RoadmapStatus.DRAFT,
        },
        plannedNodes: ["caching", "message-queues"],
      },
    },
  });

  await prisma.roadmap.update({
    where: { id: roadmap.id },
    data: {
      currentVersionId: version.id,
    },
  });

  await prisma.bookmark.create({
    data: {
      userId: user.id,
      roadmapId: roadmap.id,
    },
  });

  await prisma.userProgress.createMany({
    data: [
      {
        userId: user.id,
        roadmapId: roadmap.id,
        roadmapNodeId: rootNode.id,
        status: ProgressStatus.IN_PROGRESS,
        lastVisitedAt: new Date(),
      },
      {
        userId: user.id,
        roadmapId: roadmap.id,
        roadmapNodeId: databaseNode.id,
        status: ProgressStatus.COMPLETED,
        completedAt: new Date(),
        lastVisitedAt: new Date(),
      },
      {
        userId: user.id,
        roadmapId: roadmap.id,
        roadmapNodeId: apiNode.id,
        status: ProgressStatus.NOT_STARTED,
      },
    ],
  });

  console.log("Seed completed successfully.", {
    users: [admin.email, user.email],
    roadmap: roadmap.slug,
    version: version.versionNumber,
    draftVersion: draftVersion.versionNumber,
    nodes: [rootNode.slug, databaseNode.slug, apiNode.slug],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
