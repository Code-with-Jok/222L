# Hướng dẫn thiết lập Prisma cho Phase 1 (Auth)

Tài liệu này hướng dẫn bạn từng bước tự tay thiết lập Prisma ORM với PostgreSQL, tạo schema cho Auth (Users & Sessions) và seed data cho dự án.

## Bước 1: Cài đặt Dependencies

Mở terminal và di chuyển vào thư mục `packages/db` của dự án, sau đó chạy các lệnh sau:

```bash
cd packages/db

# Cài đặt Prisma CLI (dùng trong môi trường dev) và tsx để chạy file seed
pnpm add -D prisma tsx

# Cài đặt Prisma Client (cần cho runtime)
pnpm add @prisma/client
```

Khởi tạo Prisma với PostgreSQL:

```bash
npx prisma init --datasource-provider postgresql
```

Lệnh trên sẽ tạo ra thư mục `prisma` chứa file `schema.prisma` và một file `.env` mẫu.

## Bước 2: Thiết lập kết nối Database

Mở file `.env` trong thư mục `packages/db` (hoặc ở root nếu bạn cấu hình biến môi trường chung) và cập nhật đường dẫn đến database PostgreSQL của bạn:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/your_database_name?schema=public"
```

## Bước 3: Định nghĩa Schema

Mở file `packages/db/prisma/schema.prisma` và thay thế bằng nội dung sau. Schema này định nghĩa 2 bảng: `User` và `Session` cho Phase 1.

```prisma
generator client {
  provider = "prisma-client-js"
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

  @@map("users") // Đổi tên bảng trong DB thành "users"
}

model Session {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  expiresAt DateTime @map("expires_at")

  // Khóa ngoại trỏ tới User
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions") // Đổi tên bảng trong DB thành "sessions"
}
```

## Bước 4: Tạo Seed Data

Tạo một file có tên `seed.ts` bên trong thư mục `packages/db/prisma/`:

```typescript
// packages/db/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu seeding data...');

  // 1. Xóa data cũ (tùy chọn)
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // 2. Tạo Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'System Admin',
      passwordHash: 'hashed_password_here', // Phase này cứ điền dummy text
      role: 'ADMIN',
      sessions: {
        create: [
          {
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // Hết hạn sau 1 ngày
          },
        ],
      },
    },
  });

  // 3. Tạo Normal User
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Normal User',
      passwordHash: 'hashed_password_here',
      role: 'USER',
      sessions: {
        create: [
          {
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
          },
        ],
      },
    },
  });

  console.log('Seeding thành công!');
  console.log({ admin, user });
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

Sau đó, mở file `packages/db/package.json` và thêm đoạn sau để cấu hình lệnh chạy seed:

```json
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
```

## Bước 5: Đẩy Schema lên DB, Generate Client & Chạy Seed

Chạy lần lượt các lệnh sau trong thư mục `packages/db`:

```bash
# Đẩy schema lên database (sử dụng lúc đang dev, nó sẽ trực tiếp thay đổi DB)
npx prisma db push

# Generate Prisma Client (tạo type an toàn)
npx prisma generate

# Chạy file seed
npx prisma db seed
```
*(Sau này khi code lên production, bạn nên dùng `npx prisma migrate dev` để tạo file migration).*

## Bước 6: Export Prisma Client

Để NestJS và các packages khác trong monorepo có thể sử dụng Prisma Client vừa tạo, bạn mở file `packages/db/src/index.ts` và thêm nội dung sau:

```typescript
// packages/db/src/index.ts
import { PrismaClient } from '@prisma/client';

// Khởi tạo một instance toàn cục để tránh tạo quá nhiều connection khi hot-reload (đặc biệt nếu dùng Next.js)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export toàn bộ các type được Prisma tạo ra
export * from '@prisma/client';
```

## Hoàn tất!
Bây giờ từ các thư mục apps khác (ví dụ NestJS), bạn chỉ cần cài đặt `@repo/db` là có thể import `prisma` để dùng.
