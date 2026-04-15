import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { createHash, randomBytes } from "node:crypto";
import type { Session } from "@repo/db";
import type { AuthUserRecord } from "../domain/auth-policies";
import type {
  AuthPayload,
  IdentityResponse,
  SessionResponse,
} from "../presentation/auth.dto";

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  get accessTokenTtlSeconds(): number {
    return Number(
      this.configService.get("AUTH_ACCESS_TOKEN_TTL_SECONDS") ?? 900,
    );
  }

  get refreshTokenTtlDays(): number {
    return Number(this.configService.get("AUTH_REFRESH_TOKEN_TTL_DAYS") ?? 30);
  }

  get emailVerificationTtlHours(): number {
    return Number(
      this.configService.get("AUTH_EMAIL_VERIFICATION_TTL_HOURS") ?? 24,
    );
  }

  get passwordResetTtlMinutes(): number {
    return Number(
      this.configService.get("AUTH_PASSWORD_RESET_TTL_MINUTES") ?? 30,
    );
  }

  get maxFailedLogins(): number {
    return Number(this.configService.get("AUTH_MAX_FAILED_LOGINS") ?? 5);
  }

  get lockMinutes(): number {
    return Number(this.configService.get("AUTH_LOCK_MINUTES") ?? 15);
  }

  hashOpaqueToken(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }

  generateOpaqueToken(): string {
    return randomBytes(32).toString("base64url");
  }

  debugToken(rawToken: string): string | undefined {
    return process.env.NODE_ENV === "production" ? undefined : rawToken;
  }

  async createAccessToken(
    user: AuthUserRecord,
    sessionId: string,
  ): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        sid: sessionId,
      },
      {
        expiresIn: `${this.accessTokenTtlSeconds}s`,
      },
    );
  }

  async buildAuthPayload(
    user: AuthUserRecord,
    session: Session,
    refreshToken: string,
    identity: IdentityResponse,
    sessionView: SessionResponse,
  ): Promise<AuthPayload> {
    return {
      accessToken: await this.createAccessToken(user, session.id),
      tokenType: "Bearer",
      expiresIn: this.accessTokenTtlSeconds,
      refreshToken,
      identity,
      session: sessionView,
    };
  }
}
