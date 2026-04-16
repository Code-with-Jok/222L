import { Injectable, ConflictException } from "@nestjs/common";
import { prisma, Prisma, Role as DbRole, Session as DbSession } from "@repo/db";
import { IAuthRepository } from "../../domain/repositories/auth.repository.interface";
import { User } from "../../domain/entities/user.entity";
import { Role as DomainRole } from "../../domain/enums/role.enum";
import { Session as DomainSession, NewSessionData } from "../../domain/types/session.types";

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
  private mapToRole(dbRole: DbRole): DomainRole {
    return dbRole === DbRole.ADMIN ? DomainRole.ADMIN : DomainRole.USER;
  }

  private mapFromRole(domainRole: DomainRole): DbRole {
    return domainRole === DomainRole.ADMIN ? DbRole.ADMIN : DbRole.USER;
  }

  private mapToEntity(model: Prisma.UserGetPayload<{}>): User {
    return new User(
      model.id,
      model.email,
      model.passwordHash,
      this.mapToRole(model.role),
      model.displayName || undefined,
      model.avatarUrl || undefined,
      model.isActive,
      model.emailVerifiedAt || undefined,
      model.createdAt,
      model.updatedAt
    );
  }

  private mapToSession(model: DbSession): DomainSession {
    return {
      id: model.id,
      userId: model.userId,
      expiresAt: model.expiresAt,
      revokedAt: model.revokedAt || undefined,
      revokeReason: model.revokeReason || undefined,
      userAgent: model.userAgent || undefined,
      ipAddress: model.ipAddress || undefined,
      tokenHash: model.tokenHash || undefined,
      refreshFamilyId: model.refreshFamilyId || undefined,
      replacedBySessionId: model.replacedBySessionId || undefined,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }

  async createUser(user: User): Promise<User> {
    try {
      const created = await prisma.user.create({
        data: {
          email: user.email,
          passwordHash: user.passwordHash,
          displayName: user.displayName,
          role: this.mapFromRole(user.role),
        },
      });
      return this.mapToEntity(created);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Email already registered");
      }
      throw error;
    }
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

  async createSession(data: NewSessionData): Promise<DomainSession> {
    const session = await prisma.session.create({
      data: {
        userId: data.userId,
        expiresAt: data.expiresAt,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        tokenHash: data.tokenHash,
        refreshFamilyId: data.refreshFamilyId,
      },
    });
    return this.mapToSession(session);
  }

  async findSessionById(id: string): Promise<DomainSession | null> {
    const session = await prisma.session.findUnique({
      where: { id },
    });
    return session ? this.mapToSession(session) : null;
  }

  async revokeSession(id: string, reason?: string): Promise<void> {
    // Idempotent revoke using updateMany (won't throw if ID not found)
    await prisma.session.updateMany({
      where: { id },
      data: {
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });
  }

  async replaceSession(oldSessionId: string, newSessionData: NewSessionData): Promise<DomainSession> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create the new session first
      const newSession = await tx.session.create({
        data: {
          userId: newSessionData.userId,
          expiresAt: newSessionData.expiresAt,
          userAgent: newSessionData.userAgent,
          ipAddress: newSessionData.ipAddress,
          tokenHash: newSessionData.tokenHash,
          refreshFamilyId: newSessionData.refreshFamilyId,
        },
      });

      // 2. Update the old session to point to the new one (Idempotent update)
      await tx.session.updateMany({
        where: { id: oldSessionId },
        data: {
          revokedAt: new Date(),
          revokeReason: "REPLACED_BY_NEW_SESSION",
          replacedBySessionId: newSession.id,
        },
      });

      return this.mapToSession(newSession);
    });
  }
}
