import { Injectable } from "@nestjs/common";
import { prisma, Session, User } from "@repo/db";
import {
  CreateSessionData,
  ISessionRepository,
} from "../../application/ports/repositories.interface";

@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
  async create(data: CreateSessionData): Promise<Session> {
    return prisma.session.create({
      data,
    });
  }

  async findByTokenHash(
    tokenHash: string,
  ): Promise<(Session & { user: User }) | null> {
    return prisma.session.findFirst({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Session | null> {
    return prisma.session.findFirst({
      where: { id, userId },
    });
  }

  async findManyByUserId(userId: string): Promise<Session[]> {
    return prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, data: Partial<Session>): Promise<Session> {
    return prisma.session.update({
      where: { id },
      data,
    });
  }

  async revokeFamily(refreshFamilyId: string, reason: string): Promise<number> {
    const result = await prisma.session.updateMany({
      where: {
        refreshFamilyId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });
    return result.count;
  }

  async revokeAllForUser(userId: string, reason: string): Promise<number> {
    const result = await prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });
    return result.count;
  }

  async revokeByUserId(userId: string, reason: string): Promise<number> {
    const result = await prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });
    return result.count;
  }
}
