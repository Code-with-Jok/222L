import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuditEventType, AuthTokenPurpose, Role } from "@repo/db";
import { RequestMetadata } from "../../../../common/auth.types";
import { EmailAlreadyRegisteredError } from "../../domain/auth.errors";
import {
  IAuditLogRepository,
  IAuthTokenRepository,
  IUserRepository,
} from "../ports/repositories.interface";
import { IHashService } from "../ports/services.interface";
import {
  RegisterInput,
  RegisterResponse,
  IdentityResponse,
} from "../../auth.dto";

@Injectable()
export class RegisterUseCase {
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

  async execute(
    input: RegisterInput,
    metadata: RequestMetadata,
  ): Promise<RegisterResponse> {
    const email = input.email.trim().toLowerCase();
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new EmailAlreadyRegisteredError();
    }

    const passwordHash = await this.hashService.hashPassword(input.password);

    const user = await this.userRepository.create({
      email,
      name: input.displayName ?? null,
      displayName: input.displayName ?? null,
      passwordHash,
      role: Role.USER,
    });

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
      eventType: AuditEventType.USER_REGISTERED,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      requestId: metadata.requestId,
      metadata: { email: user.email },
    });

    return {
      success: true,
      message:
        "Registration successful. Verify your email to activate the account.",
      debugToken: process.env.NODE_ENV === "production" ? undefined : rawToken,
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
    };
  }
}
