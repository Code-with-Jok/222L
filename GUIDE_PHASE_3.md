# Hướng dẫn Thiết lập `apps/web` và Cấu trúc Module (Phase 3)

File này cung cấp hướng dẫn chi tiết theo từng bước để khởi tạo ứng dụng Next.js 15 và cấu trúc các module theo chuẩn SOLID (Interface + Class) giống với tư duy của NestJS.

---

## Bước 3.1: Khởi tạo ứng dụng `apps/web` (Next.js 15, App Router, Tailwind v4)

Chúng ta sẽ tạo ứng dụng Next.js trực tiếp bên trong thư mục `apps/` bằng lệnh `create-next-app`.
Chạy lệnh sau tại thư mục gốc của dự án (root folder):

```bash
cd apps
pnpm create next-app web \
  --typescript \
  --eslint \
  --tailwind \
  --src-dir \
  --app \
  --import-alias "@/*" \
  --use-pnpm
cd ..
```

**Cấu hình vào Turborepo và Monorepo:**
Mở file `apps/web/package.json` và thay đổi tên package thành `@222L/web` (nếu dự án dùng prefix này) hoặc giữ nguyên `web`.
Thêm dependency của database `packages/db` vào `apps/web/package.json`:

```json
  "dependencies": {
    // ... các thư viện khác
    "@222L/db": "workspace:*"
  }
```
*(Chạy `pnpm install` ở root folder sau khi sửa để link các workspace).*

---

## Bước 3.2: Tạo các Route Group directories

Chúng ta sử dụng tính năng Route Groups của Next.js (thư mục có dấu ngoặc đơn) để tổ chức layout mà không ảnh hưởng đến URL path.
Chạy chuỗi lệnh sau trong terminal:

```bash
mkdir -p apps/web/src/app/\(public\)
mkdir -p apps/web/src/app/\(auth\)
mkdir -p apps/web/src/app/\(dashboard\)
mkdir -p apps/web/src/app/admin
```

---

## Bước 3.3 & 3.4: Tạo cấu trúc Module và Stub Services theo nguyên tắc SOLID

Để tuân thủ SOLID (đặc biệt là Dependency Inversion và Single Responsibility) và chuẩn bị cho tư duy tương đồng với NestJS, mỗi module sẽ có thư mục riêng chứa `interfaces.ts` và `<module>.service.ts`.

Chạy lệnh sau để tạo sẵn toàn bộ các thư mục và file trống:

```bash
mkdir -p apps/web/src/modules/{auth,roadmap,progress,bookmark,admin,search}

touch apps/web/src/modules/auth/{interfaces.ts,auth.service.ts}
touch apps/web/src/modules/roadmap/{interfaces.ts,roadmap.service.ts}
touch apps/web/src/modules/progress/{interfaces.ts,progress.service.ts}
touch apps/web/src/modules/bookmark/{interfaces.ts,bookmark.service.ts}
touch apps/web/src/modules/admin/{interfaces.ts,admin.service.ts}
touch apps/web/src/modules/search/{interfaces.ts,search.service.ts}
```

Dưới đây là mã nguồn cụ thể cho từng file mà bạn cần copy/paste.

### 1. Module Auth (`apps/web/src/modules/auth/`)

**`interfaces.ts`**
```typescript
export interface IAuthService {
  login(email: string, passwordHash: string): Promise<boolean>;
  logout(userId: string): Promise<void>;
}
```

**`auth.service.ts`**
```typescript
import { PrismaClient } from "@222L/db"; // Giả định alias hoặc export từ package DB
import { IAuthService } from "./interfaces";

export class AuthService implements IAuthService {
  constructor(private readonly prisma: PrismaClient) {}

  public async login(email: string, passwordHash: string): Promise<boolean> {
    // TODO: Implement login logic
    throw new Error("Method not implemented.");
  }

  public async logout(userId: string): Promise<void> {
    // TODO: Implement logout logic
    throw new Error("Method not implemented.");
  }
}
```

### 2. Module Roadmap (`apps/web/src/modules/roadmap/`)

**`interfaces.ts`**
```typescript
export interface IRoadmapService {
  getRoadmapById(id: string): Promise<any>;
  createRoadmap(data: any): Promise<any>;
}
```

**`roadmap.service.ts`**
```typescript
import { PrismaClient } from "@222L/db";
import { IRoadmapService } from "./interfaces";

export class RoadmapService implements IRoadmapService {
  constructor(private readonly prisma: PrismaClient) {}

  public async getRoadmapById(id: string): Promise<any> {
    // TODO: Fetch roadmap with nodes and nested roadmaps
    throw new Error("Method not implemented.");
  }

  public async createRoadmap(data: any): Promise<any> {
    // TODO: Create a new roadmap
    throw new Error("Method not implemented.");
  }
}
```

### 3. Module Progress (`apps/web/src/modules/progress/`)

**`interfaces.ts`**
```typescript
export interface IProgressService {
  updateNodeProgress(userId: string, nodeId: string, status: string): Promise<any>;
  getUserProgress(userId: string, roadmapId: string): Promise<any[]>;
}
```

**`progress.service.ts`**
```typescript
import { PrismaClient } from "@222L/db";
import { IProgressService } from "./interfaces";

export class ProgressService implements IProgressService {
  constructor(private readonly prisma: PrismaClient) {}

  public async updateNodeProgress(userId: string, nodeId: string, status: string): Promise<any> {
    // TODO: Update user progress and validate denormalized roadmapId
    throw new Error("Method not implemented.");
  }

  public async getUserProgress(userId: string, roadmapId: string): Promise<any[]> {
    // TODO: Retrieve progress array
    throw new Error("Method not implemented.");
  }
}
```

### 4. Module Bookmark (`apps/web/src/modules/bookmark/`)

**`interfaces.ts`**
```typescript
export interface IBookmarkService {
  addBookmark(userId: string, targetType: string, targetId: string): Promise<any>;
  removeBookmark(userId: string, targetType: string, targetId: string): Promise<void>;
}
```

**`bookmark.service.ts`**
```typescript
import { PrismaClient } from "@222L/db";
import { IBookmarkService } from "./interfaces";

export class BookmarkService implements IBookmarkService {
  constructor(private readonly prisma: PrismaClient) {}

  public async addBookmark(userId: string, targetType: string, targetId: string): Promise<any> {
    // TODO: Add bookmark logic
    throw new Error("Method not implemented.");
  }

  public async removeBookmark(userId: string, targetType: string, targetId: string): Promise<void> {
    // TODO: Remove bookmark logic
    throw new Error("Method not implemented.");
  }
}
```

### 5. Module Admin (`apps/web/src/modules/admin/`)

**`interfaces.ts`**
```typescript
export interface IAdminService {
  getAuditLogs(): Promise<any[]>;
  manageUsers(): Promise<any>;
}
```

**`admin.service.ts`**
```typescript
import { PrismaClient } from "@222L/db";
import { IAdminService } from "./interfaces";

export class AdminService implements IAdminService {
  constructor(private readonly prisma: PrismaClient) {}

  public async getAuditLogs(): Promise<any[]> {
    // TODO: Implement audit log retrieval
    throw new Error("Method not implemented.");
  }

  public async manageUsers(): Promise<any> {
    // TODO: Implement user management
    throw new Error("Method not implemented.");
  }
}
```

### 6. Module Search (`apps/web/src/modules/search/`)

**`interfaces.ts`**
```typescript
export interface ISearchService {
  searchRoadmaps(query: string): Promise<any[]>;
  searchNodes(query: string): Promise<any[]>;
}
```

**`search.service.ts`**
```typescript
import { PrismaClient } from "@222L/db";
import { ISearchService } from "./interfaces";

export class SearchService implements ISearchService {
  constructor(private readonly prisma: PrismaClient) {}

  public async searchRoadmaps(query: string): Promise<any[]> {
    // TODO: Implement full-text or basic search for roadmaps
    throw new Error("Method not implemented.");
  }

  public async searchNodes(query: string): Promise<any[]> {
    // TODO: Implement search for roadmap nodes
    throw new Error("Method not implemented.");
  }
}
```

---

## Bước 3.5: Cấu hình Prisma Singleton trong `packages/db/src/index.ts`

Trong môi trường dev của Next.js (khi có Hot-Reload), việc khởi tạo `PrismaClient` liên tục sẽ làm cạn kiệt connection pool của Database. Bạn hãy tạo file `packages/db/src/index.ts` (nếu chưa có) và dán đoạn mã chuẩn Singleton sau:

```typescript
import { PrismaClient } from '../prisma/src/generated/prisma';

// Re-export tất cả các types, enums và model được generate bởi Prisma
export * from '../prisma/src/generated/prisma';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Lưu ý:** Đường dẫn import `../prisma/src/generated/prisma` có thể khác biệt đôi chút tùy thuộc vào việc bạn định nghĩa thư mục `output` trong `schema.prisma`. (Trong `GUIDE.md` cũ, output được cấu hình là `"../src/generated/prisma"`).

Sau khi làm xong, ứng dụng web có thể import như sau:
`import { prisma, Role } from '@222L/db';`
