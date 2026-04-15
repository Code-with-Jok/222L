import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { prisma } from "@repo/db";
import type { PrismaClient } from "@repo/db";

/**
 * Wraps the shared Prisma singleton as a NestJS injectable service.
 * Using a service instead of calling `prisma` directly ensures:
 *  - Proper lifecycle management (connect on init, disconnect on shutdown)
 *  - Easy mocking in unit tests via NestJS DI
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly client: PrismaClient = prisma;

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
