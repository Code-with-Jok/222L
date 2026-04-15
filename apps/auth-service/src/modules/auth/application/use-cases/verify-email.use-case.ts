import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuditEventType, AuthTokenPurpose } from "@repo/db";
import { RequestMetadata } from "../../../../common/auth.types";
import { InvalidOrExpiredTokenError } from "../../domain/auth.errors";
import {
  IAuditLogRepository,
  IAuthTokenRepository,
  IUserRepository,
} from "../ports/repositories.interface";
import { IHashService } from "../ports/services.interface";
import {
  OperationResponse,
  RequestEmailVerificationInput,
  VerifyEmailInput,
} from "../../auth.dto";

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(IAuthTokenRepository)
    private readonly authTokenRepository: IAuthTokenRepository,
    @Inject(IAuditLogRepository)
    private readonly auditLogRepository: IAuditLogRepository,
    @Inject(IHashService) private readonly hashService: IHashService,
    private readonly configService: ConfigService,
  ) {}

  private get emailVerificationTtlHours(): number {
    return Number(
      this.configService.get("AUTH_EMAIL_VERIFICATION_TTL_HOURS") ?? 24,
    );
  }

  async requestVerification(
    input: RequestEmailVerificationInput,
    metadata: RequestMetadata,
  ): Promise<OperationResponse> {
    const email = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    if (!user || user.emailVerifiedAt) {
      return {
        success: true,
        message:
          "If the account exists, a verification email has been prepared.",
      };
    }

    const rawToken = this.hashService.generateOpaqueToken();
    await this.authTokenRepository.create({
      userId: user.id,
      purpose: AuthTokenPurpose.EMAIL_VERIFICATION,
      tokenHash: this.hashService.hashOpaqueToken(rawToken),
      expiresAt: new Date(
        Date.now() + this.emailVerificationTtlHours * 60 * 60 * 1000,
      ),
    });

    await this.auditLogRepository.create({
      userId: user.id,
      eventType: AuditEventType.USER_EMAIL_VERIFICATION_REQUESTED,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      requestId: metadata.requestId,
    });

    return {
      success: true,
      message: "Verification email token created.",
      debugToken: process.env.NODE_ENV === "production" ? undefined : rawToken,
    };
  }

  async verify(
    input: VerifyEmailInput,
    metadata: RequestMetadata,
  ): Promise<OperationResponse> {
    const tokenHash = this.hashService.hashOpaqueToken(input.token);
    const authToken =
      await this.authTokenRepository.findValidByTokenHashAndPurpose(
        tokenHash,
        AuthTokenPurpose.EMAIL_VERIFICATION,
      );

    if (!authToken || authToken.expiresAt.getTime() <= Date.now()) {
      throw new InvalidOrExpiredTokenError(
        "Verification token is invalid or expired",
      );
    }

    await this.authTokenRepository.markAsConsumed(authToken.id);
    await this.userRepository.update(authToken.userId, {
      emailVerifiedAt: new Date(),
    });

    await this.auditLogRepository.create({
      userId: authToken.userId,
      eventType: AuditEventType.USER_EMAIL_VERIFIED,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      requestId: metadata.requestId,
    });

    return {
      success: true,
      message: "Email verified successfully.",
    };
  }
}
