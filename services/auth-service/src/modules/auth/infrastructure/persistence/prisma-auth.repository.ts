import { Injectable } from "@nestjs/common";
import { prisma, Session, Prisma } from "@repo/db";
import { IAuthRepository } from "../../domain/repositories/auth.repository.interface";
import { User } from "../../domain/entities/user.entity";

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
  private mapToEntity(model: any): User {
    return new User(
      model.id,
      model.email,
      model.passwordHash,
      model.role,
      model.displayName || undefined,
      model.avatarUrl || undefined,
      model.isActive,
      model.emailVerifiedAt || undefined,
      model.createdAt,
      model.updatedAt
    );
  }

  async createUser(user: User): Promise<User> {
    const created = await prisma.user.create({
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        displayName: user.displayName,
        role: user.role,
      },
    });
    return this.mapToEntity(created);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user ? this.mapToEntity(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user ? this.mapToEntity(user) : null;
  }

  async createSession(data: {
    userId: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
    tokenHash?: string;
    refreshFamilyId?: string;
  }): Promise<Session> {
    return prisma.session.create({
      data: {
        userId: data.userId,
        expiresAt: data.expiresAt,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        tokenHash: data.tokenHash,
        refreshFamilyId: data.refreshFamilyId,
      },
    });
  }

  async findSessionById(id: string): Promise<Session | null> {
    return prisma.session.findUnique({
      where: { id },
    });
  }

  async revokeSession(id: string, reason?: string): Promise<void> {
    await prisma.session.update({
      where: { id },
      data: {
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });
  }

  async replaceSession(oldSessionId: string, newSessionData: any): Promise<Session> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.session.update({
        where: { id: oldSessionId },
        data: {
          revokedAt: new Date(),
          revokeReason: "REPLACED_BY_NEW_SESSION",
        },
      });

      return tx.session.create({
        data: {
          ...newSessionData,
          replacedBySessionId: oldSessionId, // Note: unique constraint check
        },
      });
    });
  }
}
