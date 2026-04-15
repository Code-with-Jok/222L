import { Inject, Injectable } from "@nestjs/common";
import { AuditEventType } from "@repo/db";
import {
  RequestMetadata,
  AuthenticatedUser,
} from "../../../../common/auth.types";
import {
  OperationResponse,
  RefreshTokenInput,
  SessionListResponse,
  IdentityResponse,
} from "../../auth.dto";
import {
  IAuditLogRepository,
  ISessionRepository,
  IUserRepository,
} from "../ports/repositories.interface";
import { IHashService } from "../ports/services.interface";
import {
  ForbiddenSessionError,
  UserNotFoundError,
} from "../../domain/auth.errors";

@Injectable()
export class SessionUseCase {
  constructor(
    @Inject(ISessionRepository)
    private readonly sessionRepository: ISessionRepository,
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(IAuditLogRepository)
    private readonly auditLogRepository: IAuditLogRepository,
    @Inject(IHashService) private readonly hashService: IHashService,
  ) {}

  async me(currentUser: AuthenticatedUser): Promise<IdentityResponse> {
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      isActive: user.isActive,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async listSessions(
    currentUser: AuthenticatedUser,
  ): Promise<SessionListResponse> {
    const sessions = await this.sessionRepository.findManyByUserId(
      currentUser.userId,
    );
    return {
      items: sessions.map((session) => ({
        id: session.id,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        lastSeenAt: session.lastSeenAt,
        revokedAt: session.revokedAt,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
      })),
    };
  }

  async logout(
    input: RefreshTokenInput,
    metadata: RequestMetadata,
  ): Promise<OperationResponse> {
    const tokenHash = this.hashService.hashOpaqueToken(input.refreshToken);
    const session = await this.sessionRepository.findByTokenHash(tokenHash);

    if (!session) {
      return { success: true, message: "Session already cleared." };
    }

    await this.sessionRepository.update(session.id, {
      revokedAt: new Date(),
      revokeReason: "logout",
      lastSeenAt: new Date(),
    });

    await this.auditLogRepository.create({
      userId: session.userId,
      sessionId: session.id,
      eventType: AuditEventType.USER_LOGOUT,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      requestId: metadata.requestId,
    });

    return { success: true, message: "Logged out successfully." };
  }

  async logoutAll(
    currentUser: AuthenticatedUser,
    metadata: RequestMetadata,
  ): Promise<OperationResponse> {
    const revokedCount = await this.sessionRepository.revokeAllForUser(
      currentUser.userId,
      "logout-all",
    );

    await this.auditLogRepository.create({
      userId: currentUser.userId,
      sessionId: currentUser.sessionId,
      eventType: AuditEventType.USER_LOGOUT_ALL,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      requestId: metadata.requestId,
      metadata: { revokedSessions: revokedCount },
    });

    return {
      success: true,
      message: `Revoked ${revokedCount} active session(s).`,
    };
  }

  async revokeSession(
    currentUser: AuthenticatedUser,
    sessionId: string,
    metadata: RequestMetadata,
  ): Promise<OperationResponse> {
    const session = await this.sessionRepository.findByIdAndUserId(
      sessionId,
      currentUser.userId,
    );

    if (!session) {
      throw new ForbiddenSessionError();
    }

    await this.sessionRepository.update(session.id, {
      revokedAt: new Date(),
      revokeReason: "manual revoke",
    });

    await this.auditLogRepository.create({
      userId: currentUser.userId,
      sessionId: session.id,
      eventType: AuditEventType.SESSION_REVOKED,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      requestId: metadata.requestId,
      metadata: { reason: "manual revoke" },
    });

    return { success: true, message: "Session revoked successfully." };
  }
}
