import { Injectable } from "@nestjs/common";
import {
  Prisma,
  Role,
  type Session,
  type User,
  type AuthToken,
  type AuthAuditLog,
} from "@repo/db";
import { PrismaService } from "../../../common/prisma.service";

export type SessionWithUser = Prisma.SessionGetPayload<{
  include: { user: true };
}>;

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.client.user.findUnique({ where: { email } });
  }

  findUserById(id: string): Promise<User | null> {
    return this.prisma.client.user.findUnique({ where: { id } });
  }

  createUser(params: {
    email: string;
    displayName?: string;
    passwordHash: string;
    role?: Role;
  }): Promise<User> {
    return this.prisma.client.user.create({
      data: {
        email: params.email,
        name: params.displayName ?? null,
        displayName: params.displayName ?? null,
        passwordHash: params.passwordHash,
        role: params.role ?? Role.USER,
      },
    });
  }

  resetFailedLogins(userId: string): Promise<User> {
    return this.prisma.client.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  updateFailedLoginState(
    userId: string,
    data: { failedLoginAttempts: number; lockedUntil: Date | null },
  ): Promise<User> {
    return this.prisma.client.user.update({
      where: { id: userId },
      data,
    });
  }

  createSession(data: Prisma.SessionUncheckedCreateInput): Promise<Session> {
    return this.prisma.client.session.create({ data });
  }

  findSessionByTokenHash(tokenHash: string): Promise<SessionWithUser | null> {
    return this.prisma.client.session.findFirst({
      where: { tokenHash },
      include: { user: true },
    });
  }

  revokeSession(
    sessionId: string,
    params: {
      reason: string;
      revokedAt?: Date;
      lastSeenAt?: Date;
      replacedBySessionId?: string;
    },
  ): Promise<Session> {
    return this.prisma.client.session.update({
      where: { id: sessionId },
      data: {
        revokedAt: params.revokedAt ?? new Date(),
        revokeReason: params.reason,
        lastSeenAt: params.lastSeenAt,
        replacedBySessionId: params.replacedBySessionId,
      },
    });
  }

  revokeSessionsByRefreshFamily(
    refreshFamilyId: string,
    reason: string,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.client.session.updateMany({
      where: {
        refreshFamilyId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });
  }

  revokeAllUserSessions(
    userId: string,
    reason: string,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.client.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
        revokeReason: reason,
        lastSeenAt: new Date(),
      },
    });
  }

  listUserSessions(userId: string): Promise<Session[]> {
    return this.prisma.client.session.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  findUserSession(userId: string, sessionId: string): Promise<Session | null> {
    return this.prisma.client.session.findFirst({
      where: { id: sessionId, userId },
    });
  }

  createOneTimeToken(
    data: Prisma.AuthTokenUncheckedCreateInput,
  ): Promise<AuthToken> {
    return this.prisma.client.authToken.create({ data });
  }

  findActiveOneTimeToken(
    tokenHash: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    purpose: Prisma.AuthTokenScalarFieldEnum | any,
  ): Promise<AuthToken | null> {
    return this.prisma.client.authToken.findFirst({
      where: {
        tokenHash,
        purpose,
        consumedAt: null,
      },
    });
  }

  async consumeEmailVerificationToken(
    authTokenId: string,
    userId: string,
  ): Promise<void> {
    await this.prisma.client.$transaction([
      this.prisma.client.authToken.update({
        where: { id: authTokenId },
        data: { consumedAt: new Date() },
      }),
      this.prisma.client.user.update({
        where: { id: userId },
        data: { emailVerifiedAt: new Date() },
      }),
    ]);
  }

  async completePasswordReset(
    authTokenId: string,
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    await this.prisma.client.$transaction([
      this.prisma.client.authToken.update({
        where: { id: authTokenId },
        data: { consumedAt: new Date() },
      }),
      this.prisma.client.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      this.prisma.client.session.updateMany({
        where: { userId, revokedAt: null },
        data: {
          revokedAt: new Date(),
          revokeReason: "password reset",
        },
      }),
    ]);
  }

  createAuditLog(
    data: Prisma.AuthAuditLogUncheckedCreateInput,
  ): Promise<AuthAuditLog> {
    return this.prisma.client.authAuditLog.create({ data });
  }
}
