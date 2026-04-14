import "dotenv/config";
import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("no db url");
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    await prisma.user.create({
      data: {
        email: "test@example.com",
        passwordHash: "123",
        sessions: {
          create: [{}]
        }
      }
    });
  } catch (e) {
    console.error(e);
  }
}
main().catch(console.error);
