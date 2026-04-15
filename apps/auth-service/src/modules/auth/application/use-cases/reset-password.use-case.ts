import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuditEventType, AuthTokenPurpose } from "@repo/db";
import { RequestMetadata } from "../../../../common/auth.types";
import { InvalidOrExpiredTokenError } from "../../domain/auth.errors";
import {
  IAuditLogRepository,
  IAuthTokenRepository,
  ISessionRepository,
  IUserRepository,
} from "../ports/repositories.interface";
import { IHashService } from "../ports/services.interface";
import {
  ForgotPasswordInput,
  OperationResponse,
  ResetPasswordInput,
} from "../../auth.dto";

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(ISessionRepository)
    private readonly sessionRepository: ISessionRepository,
    @Inject(IAuthTokenRepository)
    private readonly authTokenRepository: IAuthTokenRepository,
    @Inject(IAuditLogRepository)
    private readonly auditLogRepository: IAuditLogRepository,
    @Inject(IHashService) private readonly hashService: IHashService,
    private readonly configService: ConfigService,
  ) {}

  private get passwordResetTtlMinutes(): number {
    return Number(
      this.configService.get("AUTH_PASSWORD_RESET_TTL_MINUTES") ?? 30,
    );
  }

  async requestReset(
    input: ForgotPasswordInput,
    metadata: RequestMetadata,
  ): Promise<OperationResponse> {
    const email = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return {
        success: true,
        message:
          "If the account exists, a password reset token has been prepared.",
      };
    }

    const rawToken = this.hashService.generateOpaqueToken();
    await this.authTokenRepository.create({
      userId: user.id,
      purpose: AuthTokenPurpose.PASSWORD_RESET,
      tokenHash: this.hashService.hashOpaqueToken(rawToken),
      expiresAt: new Date(
        Date.now() + this.passwordResetTtlMinutes * 60 * 1000,
      ),
    });

    await this.auditLogRepository.create({
      userId: user.id,
      eventType: AuditEventType.USER_PASSWORD_RESET_REQUESTED,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      requestId: metadata.requestId,
    });

    return {
      success: true,
      message: "Password reset token created.",
      debugToken: process.env.NODE_ENV === "production" ? undefined : rawToken,
    };
  }

  async reset(
    input: ResetPasswordInput,
    metadata: RequestMetadata,
  ): Promise<OperationResponse> {
    const tokenHash = this.hashService.hashOpaqueToken(input.token);
    const authToken =
      await this.authTokenRepository.findValidByTokenHashAndPurpose(
        tokenHash,
        AuthTokenPurpose.PASSWORD_RESET,
      );

    if (!authToken || authToken.expiresAt.getTime() <= Date.now()) {
      throw new InvalidOrExpiredTokenError(
        "Password reset token is invalid or expired",
      );
    }

    const passwordHash = await this.hashService.hashPassword(input.newPassword);

    await this.authTokenRepository.markAsConsumed(authToken.id);
    await this.userRepository.update(authToken.userId, {
      passwordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
    await this.sessionRepository.revokeAllForUser(
      authToken.userId,
      "password reset",
    );

    await this.auditLogRepository.create({
      userId: authToken.userId,
      eventType: AuditEventType.USER_PASSWORD_RESET_COMPLETED,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      requestId: metadata.requestId,
    });

    return {
      success: true,
      message: "Password reset completed successfully.",
    };
  }
}
