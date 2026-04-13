import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Bắt đầu seeding data...");

  // Xóa tất cả dữ liệu cũ để tránh xung đột
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Tạo tài khoản admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "System Admin",
      passwordHash: "hashed_password_here",
      role: "ADMIN",
      sessions: {
        create: [
          {
            // Tạo session tồn tại trong 1 ngày
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
          },
        ],
      },
    },
  });

  console.log("Admin created:", admin);

  // Tạo tài khoản user
  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      name: "Normal User",
      passwordHash: "hashed_password_here",
      role: "USER",
      sessions: {
        create: [{ expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) }],
      },
    },
  });

  console.log("User created:", user);

  console.log({ admin, user }, "Seeding thành công!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
