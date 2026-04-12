# Hướng dẫn thiết lập Prisma cho Phase 1 (Auth) trong Monorepo (Turborepo + pnpm)

Tài liệu này dựa trên [Best Practices mới nhất của Prisma cho Turborepo](https://www.prisma.io/docs/guides/deployment/turborepo) để đảm bảo type-safety và caching hoạt động hoàn hảo trong môi trường pnpm workspaces.

## Bước 1: Cài đặt Dependencies

Mở terminal và di chuyển vào thư mục `packages/db` của dự án, sau đó chạy các lệnh sau:

```bash
cd packages/db

# Cài đặt Prisma CLI (dùng trong môi trường dev) và tsx để chạy file seed
pnpm add -D prisma tsx

# Cài đặt Prisma Client
pnpm add @prisma/client
```

Khởi tạo Prisma với PostgreSQL:

```bash
npx prisma init --datasource-provider postgresql
```

## Bước 2: Thiết lập kết nối Database

Mở file `packages/db/.env` và cập nhật đường dẫn đến database PostgreSQL của bạn:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/your_database_name?schema=public"
```

## Bước 3: Định nghĩa Schema và Custom Output (QUAN TRỌNG)

Trong môi trường Monorepo/Turborepo, việc để Prisma generate client vào thư mục mặc định (`node_modules/.prisma/client`) có thể gây lỗi type và cache. Chúng ta cần cấu hình Prisma sinh code trực tiếp vào trong package của mình.

Mở file `packages/db/prisma/schema.prisma` và thay thế bằng nội dung sau:

```prisma
generator client {
  provider = "prisma-client-js"
  // Đặt output vào một thư mục cụ thể để dễ dàng export trong monorepo
  output   = "../src/generated/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enum cho Role
enum Role {
  USER
  ADMIN
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  name         String?
  passwordHash String    @map("password_hash")
  role         Role      @default(USER)

  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  // Quan hệ 1-N với Session
  sessions     Session[]

  @@map("users")
}

model Session {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  expiresAt DateTime @map("expires_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}
```

## Bước 4: Tạo file Seed Data

Tạo một file có tên `seed.ts` bên trong thư mục `packages/db/prisma/`:

```typescript
// packages/db/prisma/seed.ts
import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu seeding data...');

  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'System Admin',
      passwordHash: 'hashed_password_here',
      role: 'ADMIN',
      sessions: {
        create: [ { expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) } ],
      },
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Normal User',
      passwordHash: 'hashed_password_here',
      role: 'USER',
      sessions: {
        create: [ { expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) } ],
      },
    },
  });

  console.log('Seeding thành công!');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Sau đó, mở file `packages/db/package.json` và thêm lệnh cấu hình sau:

```json
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
```

*(Lưu ý: Bạn cũng nên thêm thư mục `"src/generated"` vào file `.gitignore` của package hoặc root).*

## Bước 5: Generate Client và Chạy Seed

Chạy lần lượt các lệnh sau trong thư mục `packages/db`:

```bash
# Cập nhật schema lên database
npx prisma db push

# Generate Prisma Client (nó sẽ được tạo tại packages/db/src/generated/client)
npx prisma generate

# Chạy file seed
npx prisma db seed
```

## Bước 6: Export Prisma Client an toàn

Mở file `packages/db/src/index.ts` và thiết lập kết nối Prisma, nhớ import từ thư mục generated:

```typescript
// packages/db/src/index.ts
import { PrismaClient } from './generated/client';

// Tránh khởi tạo nhiều connection khi dùng trong Next.js / dev mode
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export toàn bộ các type từ client đã được generated
export * from './generated/client';
```

## Bước 7: Cập nhật Turbo Pipeline (Tùy chọn cho Monorepo)

Để đảm bảo Turborepo luôn chạy lệnh `prisma generate` trước khi build các apps khác, bạn nên mở file `turbo.json` ở thư mục root và thêm một task `db:generate` hoặc điều chỉnh task build:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build", "^db:generate"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "db:generate": {
      "cache": false
    }
  }
}
```
Và trong `packages/db/package.json`, thêm `"db:generate": "prisma generate"`.

---
**Hoàn tất!** Setup này đảm bảo Prisma tương thích 100% với Turborepo, tránh mọi rủi ro về caching và type resolution.
