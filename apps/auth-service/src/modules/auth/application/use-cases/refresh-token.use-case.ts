import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuditEventType, User } from "@repo/db";
import { RequestMetadata } from "../../../../common/auth.types";
import {
  InvalidRefreshTokenError,
  TokenCompromisedError,
} from "../../domain/auth.errors";
import {
  IAuditLogRepository,
  ISessionRepository,
} from "../ports/repositories.interface";
import { IHashService, ITokenService } from "../ports/services.interface";
import {
  AuthPayload,
  RefreshTokenInput,
  IdentityResponse,
  SessionResponse,
} from "../../auth.dto";

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(ISessionRepository)
    private readonly sessionRepository: ISessionRepository,
    @Inject(IAuditLogRepository)
    private readonly auditLogRepository: IAuditLogRepository,
    @Inject(IHashService) private readonly hashService: IHashService,
    @Inject(ITokenService) private readonly tokenService: ITokenService,
    private readonly configService: ConfigService,
  ) {}

  private get refreshTokenTtlDays(): number {
    return Number(this.configService.get("AUTH_REFRESH_TOKEN_TTL_DAYS") ?? 30);
  }

  private get accessTokenTtl(): number {
    return Number(
      this.configService.get("AUTH_ACCESS_TOKEN_TTL_SECONDS") ?? 900,
    );
  }

  async execute(
    input: RefreshTokenInput,
    metadata: RequestMetadata,
  ): Promise<AuthPayload> {
    const tokenHash = this.hashService.hashOpaqueToken(input.refreshToken);
    const session = await this.sessionRepository.findByTokenHash(tokenHash);

    if (!session) {
      throw new InvalidRefreshTokenError();
    }

    if (session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
      if (session.refreshFamilyId) {
        await this.sessionRepository.revokeFamily(
          session.refreshFamilyId,
          "refresh token reuse detected",
        );
      }

      await this.auditLogRepository.create({
        userId: session.userId,
        sessionId: session.id,
        eventType: AuditEventType.SESSION_REVOKED,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        requestId: metadata.requestId,
        metadata: { reason: "refresh token reuse detected" },
      });

      throw new TokenCompromisedError();
    }

    // Rotate session
    const rawRefreshToken = this.hashService.generateOpaqueToken();
    const rotatedSession = await this.sessionRepository.create({
      userId: session.userId,
      tokenHash: this.hashService.hashOpaqueToken(rawRefreshToken),
      refreshFamilyId: session.refreshFamilyId ?? session.id,
      expiresAt: new Date(
        Date.now() + this.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
      ),
      userAgent: metadata.userAgent ?? null,
      ipAddress: metadata.ipAddress ?? null,
      lastSeenAt: new Date(),
    });

    await this.sessionRepository.update(session.id, {
      revokedAt: new Date(),
      revokeReason: "rotated",
      replacedBySessionId: rotatedSession.id,
      lastSeenAt: new Date(),
    });

    await this.auditLogRepository.create({
      userId: session.userId,
      sessionId: rotatedSession.id,
      eventType: AuditEventType.SESSION_REFRESHED,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      requestId: metadata.requestId,
      metadata: { previousSessionId: session.id },
    });

    const user: User = session.user;
    const accessToken = await this.tokenService.signAccessToken(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        sid: rotatedSession.id,
      },
      this.accessTokenTtl,
    );

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: this.accessTokenTtl,
      refreshToken: rawRefreshToken,
      identity: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isActive: user.isActive,
        emailVerifiedAt: user.emailVerifiedAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      } as IdentityResponse,
      session: {
        id: rotatedSession.id,
        userAgent: rotatedSession.userAgent,
        ipAddress: rotatedSession.ipAddress,
        lastSeenAt: rotatedSession.lastSeenAt,
        revokedAt: rotatedSession.revokedAt,
        expiresAt: rotatedSession.expiresAt,
        createdAt: rotatedSession.createdAt,
      } as SessionResponse,
    };
  }
}
