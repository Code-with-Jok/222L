import { Injectable } from "@nestjs/common";
import { AuthAuditLog, prisma, Prisma } from "@repo/db";
import {
  CreateAuditLogData,
  IAuditLogRepository,
} from "../../application/ports/repositories.interface";

@Injectable()
export class PrismaAuditLogRepository implements IAuditLogRepository {
  async create(data: CreateAuditLogData): Promise<AuthAuditLog> {
    return prisma.authAuditLog.create({
      data: {
        userId: data.userId ?? null,
        sessionId: data.sessionId ?? null,
        eventType: data.eventType,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        requestId: data.requestId ?? null,
        metadata: data.metadata
          ? (data.metadata as unknown as Prisma.InputJsonValue)
          : undefined,
      },
    });
  }
}
