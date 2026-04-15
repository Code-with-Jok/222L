import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuditEventType } from "@repo/db";
import { randomUUID } from "node:crypto";
import { RequestMetadata } from "../../../../common/auth.types";
import {
  AccountDisabledError,
  AccountLockedError,
  InvalidCredentialsError,
} from "../../domain/auth.errors";
import {
  IAuditLogRepository,
  ISessionRepository,
  IUserRepository,
} from "../ports/repositories.interface";
import { IHashService, ITokenService } from "../ports/services.interface";
import {
  LoginInput,
  AuthPayload,
  IdentityResponse,
  SessionResponse,
} from "../../auth.dto";

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(ISessionRepository)
    private readonly sessionRepository: ISessionRepository,
    @Inject(IAuditLogRepository)
    private readonly auditLogRepository: IAuditLogRepository,
    @Inject(IHashService) private readonly hashService: IHashService,
    @Inject(ITokenService) private readonly tokenService: ITokenService,
    private readonly configService: ConfigService,
  ) {}

  private get maxFailedLogins(): number {
    return Number(this.configService.get("AUTH_MAX_FAILED_LOGINS") ?? 5);
  }

  private get lockMinutes(): number {
    return Number(this.configService.get("AUTH_LOCK_MINUTES") ?? 15);
  }

  private get refreshTokenTtlDays(): number {
    return Number(this.configService.get("AUTH_REFRESH_TOKEN_TTL_DAYS") ?? 30);
  }

  private get accessTokenTtl(): number {
    return Number(
      this.configService.get("AUTH_ACCESS_TOKEN_TTL_SECONDS") ?? 900,
    );
  }

  async execute(
    input: LoginInput,
    metadata: RequestMetadata,
  ): Promise<AuthPayload> {
    const email = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      await this.auditLogRepository.create({
        eventType: AuditEventType.USER_LOGIN_FAILED,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        requestId: metadata.requestId,
        metadata: { email },
      });
      throw new InvalidCredentialsError();
    }

    if (!user.isActive || user.deletedAt) {
      throw new AccountDisabledError();
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new AccountLockedError();
    }

    const passwordValid = await this.hashService.verifyPassword(
      user.passwordHash,
      input.password,
    );

    if (!passwordValid) {
      const failedAttempts = user.failedLoginAttempts + 1;
      const shouldLock = failedAttempts >= this.maxFailedLogins;

      await this.userRepository.update(user.id, {
        failedLoginAttempts: failedAttempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + this.lockMinutes * 60 * 1000)
          : user.lockedUntil,
      });

      await this.auditLogRepository.create({
        userId: user.id,
        eventType: AuditEventType.USER_LOGIN_FAILED,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        requestId: metadata.requestId,
        metadata: { failedAttempts },
      });

      throw new InvalidCredentialsError();
    }

    // Reset lock
    const updatedUser = await this.userRepository.update(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

    // Create session
    const rawRefreshToken = this.hashService.generateOpaqueToken();
    const session = await this.sessionRepository.create({
      userId: updatedUser.id,
      tokenHash: this.hashService.hashOpaqueToken(rawRefreshToken),
      refreshFamilyId: randomUUID(),
      expiresAt: new Date(
        Date.now() + this.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
      ),
      userAgent: metadata.userAgent ?? null,
      ipAddress: metadata.ipAddress ?? null,
      lastSeenAt: new Date(),
    });

    await this.auditLogRepository.create({
      userId: updatedUser.id,
      sessionId: session.id,
      eventType: AuditEventType.USER_LOGIN_SUCCEEDED,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      requestId: metadata.requestId,
    });

    await this.auditLogRepository.create({
      userId: updatedUser.id,
      sessionId: session.id,
      eventType: AuditEventType.SESSION_CREATED,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      requestId: metadata.requestId,
    });

    const accessToken = await this.tokenService.signAccessToken(
      {
        sub: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        sid: session.id,
      },
      this.accessTokenTtl,
    );

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: this.accessTokenTtl,
      refreshToken: rawRefreshToken,
      identity: {
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        emailVerifiedAt: updatedUser.emailVerifiedAt,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      } as IdentityResponse,
      session: {
        id: session.id,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        lastSeenAt: session.lastSeenAt,
        revokedAt: session.revokedAt,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
      } as SessionResponse,
    };
  }
}
