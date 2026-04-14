# Hướng dẫn mở rộng Prisma Schema cho Domain Entities

File này cung cấp các bước chi tiết để mở rộng `Prisma Schema` theo các yêu cầu (FR-001 đến FR-015, ADR-006). Bạn chỉ cần copy và paste các đoạn code dưới đây vào file `packages/db/prisma/schema.prisma`.

**Lưu ý quan trọng:** Vì Prisma yêu cầu phải định nghĩa cả hai phía của các quan hệ (relations), bạn nên dán **toàn bộ** các đoạn code từ Bước 1.1 đến Bước 1.11 vào file trước khi lưu và chạy các lệnh kiểm tra của Prisma, để tránh các lỗi "thiếu quan hệ" (missing relation field). Các đoạn code dưới đây đã được thiết kế đầy đủ các trường cơ bản (như `id`, `email`,...) và liên kết hoàn chỉnh với nhau.

---

## Bước 1.1: Tạo `Role` enum và model `User`
Tạo enum `Role` (bao gồm `EDITOR`) và model `User` với đầy đủ các trường mới (`displayName`, `avatarUrl`, `isActive`, `emailVerifiedAt`, `updatedAt`, `deletedAt`). Trong model `User` đã khai báo sẵn các mảng quan hệ để liên kết với các model ở các bước tiếp theo.

```prisma
enum Role {
  USER
  EDITOR
  ADMIN
}

model User {
  id              String         @id @default(uuid())
  email           String         @unique
  passwordHash    String?
  role            Role           @default(USER)
  displayName     String?
  avatarUrl       String?
  isActive        Boolean        @default(true)
  emailVerifiedAt DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  deletedAt       DateTime?

  // Relations
  sessions        Session[]
  roadmaps        Roadmap[]
  bookmarks       Bookmark[]
  progress        UserProgress[]
  auditLogs       AuditLog[]

  @@map("users")
}
```

## Bước 1.2: Tạo model `Session`
Tạo model `Session` để quản lý phiên đăng nhập, bao gồm các trường `tokenHash`, `userAgent`, `ipAddress`, `revokedAt` và `@@map("sessions")`.

```prisma
model Session {
  id        String    @id @default(uuid())
  userId    String
  tokenHash String    @unique
  userAgent String?
  ipAddress String?
  revokedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}
```

## Bước 1.3 & 1.12: Tạo enum cho Roadmap và model `Roadmap`
Tạo `RoadmapType` và `RoadmapStatus`. Tạo model `Roadmap` với các trường, quan hệ cơ bản, định nghĩa `@@map("roadmaps")`, và bổ sung index `(status, deletedAt)` như yêu cầu 1.12.
*(Lưu ý: Model Roadmap có bổ sung thêm mảng quan hệ `referencedByNodes` để liên kết ngược lại khi một Node đóng vai trò là một Roadmap con)*

```prisma
enum RoadmapType {
  OFFICIAL
  COMMUNITY
}

enum RoadmapStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Roadmap {
  id          String        @id @default(uuid())
  title       String
  description String?
  type        RoadmapType   @default(COMMUNITY)
  status      RoadmapStatus @default(DRAFT)
  authorId    String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  deletedAt   DateTime?

  // Relations
  author            User               @relation(fields: [authorId], references: [id])
  versions          RoadmapVersion[]
  nodes             RoadmapNode[]      @relation("RoadmapToNodes")
  tags              TagsOnRoadmaps[]
  progress          UserProgress[]
  referencedByNodes RoadmapNode[]      @relation("NodeToReferencedRoadmap")

  @@index([status, deletedAt])
  @@map("roadmaps")
}
```

## Bước 1.4: Tạo model `RoadmapVersion`
Tạo model `RoadmapVersion` lưu trữ dữ liệu dạng JSON, kèm ràng buộc unique `@@unique([roadmapId, versionNumber])`.

```prisma
model RoadmapVersion {
  id            String   @id @default(uuid())
  roadmapId     String
  versionNumber Int
  snapshotData  Json
  createdAt     DateTime @default(now())

  roadmap       Roadmap  @relation(fields: [roadmapId], references: [id], onDelete: Cascade)

  @@unique([roadmapId, versionNumber])
  @@map("roadmap_versions")
}
```

## Bước 1.5 & 1.12: Tạo enums cho Node và model `RoadmapNode`
Tạo `NodeType` (bao gồm `ROADMAP` và `TECHSTACK`), `NodeStatus` và model `RoadmapNode`. Model này có quan hệ tự tham chiếu cho cấu trúc cha-con, composite index `(roadmapId, parentId, order)` và unique constraint.
Trường `referenceRoadmapId` được thêm vào để trỏ đến một `Roadmap` khác nếu loại node này là `ROADMAP` (tức là node lồng ghép một roadmap khác).

```prisma
enum NodeType {
  CONCEPT
  PRACTICE
  PROJECT
  ROADMAP
  TECHSTACK
}

enum NodeStatus {
  DRAFT
  PUBLISHED
}

model RoadmapNode {
  id                 String      @id @default(uuid())
  roadmapId          String
  title              String
  slug               String
  description        String?
  type               NodeType    @default(CONCEPT)
  status             NodeStatus  @default(DRAFT)
  parentId           String?
  referenceRoadmapId String?
  order              Int         @default(0)
  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt

  // Relations
  roadmap           Roadmap           @relation("RoadmapToNodes", fields: [roadmapId], references: [id], onDelete: Cascade)
  parent            RoadmapNode?      @relation("NodeToNode", fields: [parentId], references: [id])
  children          RoadmapNode[]     @relation("NodeToNode")
  referencedRoadmap Roadmap?          @relation("NodeToReferencedRoadmap", fields: [referenceRoadmapId], references: [id])
  resources         TopicResource[]
  tags              TagsOnNodes[]
  progress          UserProgress[]

  @@unique([roadmapId, slug])
  @@index([roadmapId, parentId, order])
  @@map("roadmap_nodes")
}
```

## Bước 1.6: Tạo `ResourceType` enum và model `TopicResource`

```prisma
enum ResourceType {
  ARTICLE
  VIDEO
  BOOK
  COURSE
}

model TopicResource {
  id        String       @id @default(uuid())
  nodeId    String
  title     String
  url       String
  type      ResourceType @default(ARTICLE)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  node      RoadmapNode  @relation(fields: [nodeId], references: [id], onDelete: Cascade)

  @@map("topic_resources")
}
```

## Bước 1.7: Tạo `Tag`, `TagsOnRoadmaps`, `TagsOnNodes`
Tạo bảng Tag và các bảng trung gian sử dụng khóa chính kết hợp (composite primary keys).

```prisma
model Tag {
  id        String             @id @default(uuid())
  name      String             @unique
  slug      String             @unique
  createdAt DateTime           @default(now())

  roadmaps  TagsOnRoadmaps[]
  nodes     TagsOnNodes[]

  @@map("tags")
}

model TagsOnRoadmaps {
  roadmapId String
  tagId     String
  createdAt DateTime @default(now())

  roadmap   Roadmap  @relation(fields: [roadmapId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([roadmapId, tagId])
  @@map("tags_on_roadmaps")
}

model TagsOnNodes {
  nodeId    String
  tagId     String
  createdAt DateTime @default(now())

  node      RoadmapNode @relation(fields: [nodeId], references: [id], onDelete: Cascade)
  tag       Tag         @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([nodeId, tagId])
  @@map("tags_on_nodes")
}
```

## Bước 1.8: Tạo model `Category` với quan hệ tự tham chiếu

```prisma
model Category {
  id        String     @id @default(uuid())
  name      String
  slug      String     @unique
  parentId  String?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  parent    Category?  @relation("CategoryToCategory", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryToCategory")

  @@map("categories")
}
```

## Bước 1.9: Tạo `BookmarkTargetType` enum và model `Bookmark`

```prisma
enum BookmarkTargetType {
  ROADMAP
  NODE
  RESOURCE
}

model Bookmark {
  id         String             @id @default(uuid())
  userId     String
  targetType BookmarkTargetType
  targetId   String
  createdAt  DateTime           @default(now())

  user       User               @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, targetType, targetId])
  @@map("bookmarks")
}
```

## Bước 1.10: Tạo `ProgressStatus` enum và model `UserProgress`
Đã thực hiện denormalize `roadmapId` vào bảng `UserProgress` theo yêu cầu (ADR-006).

```prisma
enum ProgressStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}

model UserProgress {
  id        String         @id @default(uuid())
  userId    String
  roadmapId String         // Denormalized per ADR-006
  nodeId    String
  status    ProgressStatus @default(NOT_STARTED)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  roadmap   Roadmap        @relation(fields: [roadmapId], references: [id], onDelete: Cascade)
  node      RoadmapNode    @relation(fields: [nodeId], references: [id], onDelete: Cascade)

  @@unique([userId, nodeId])
  @@index([userId, roadmapId])
  @@map("user_progress")
}
```

## Bước 1.11: Tạo model `AuditLog`
Sử dụng index theo `actorId` và `(targetType, targetId)`.

```prisma
model AuditLog {
  id         String   @id @default(uuid())
  actorId    String?
  action     String
  targetType String
  targetId   String
  details    Json?
  createdAt  DateTime @default(now())

  actor      User?    @relation(fields: [actorId], references: [id], onDelete: SetNull)

  @@index([actorId])
  @@index([targetType, targetId])
  @@map("audit_logs")
}
```

---

**Các bước kiểm tra sau khi thêm code:**
1. Di chuyển vào thư mục chứa schema: `cd packages/db`
2. Chạy lệnh định dạng Prisma: `npx prisma format` (hoặc `pnpm dlx prisma format`)
3. Chạy lệnh validate để xác minh schema hợp lệ: `npx prisma validate` (hoặc `pnpm dlx prisma validate`)