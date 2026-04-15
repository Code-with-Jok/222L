import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthResolver } from "./auth.resolver";
import { AccessTokenGuard } from "../../common/guards/access-token.guard";

// Ports
import {
  IAuditLogRepository,
  IAuthTokenRepository,
  ISessionRepository,
  IUserRepository,
} from "./application/ports/repositories.interface";
import {
  IHashService,
  ITokenService,
} from "./application/ports/services.interface";

// Infra
import { PrismaUserRepository } from "./infrastructure/repositories/prisma-user.repository";
import { PrismaSessionRepository } from "./infrastructure/repositories/prisma-session.repository";
import { PrismaAuthTokenRepository } from "./infrastructure/repositories/prisma-auth-token.repository";
import { PrismaAuditLogRepository } from "./infrastructure/repositories/prisma-audit-log.repository";
import { Argon2HashService } from "./infrastructure/services/argon2-hash.service";
import { JwtTokenService } from "./infrastructure/services/jwt-token.service";

// Use Cases
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { RegisterUseCase } from "./application/use-cases/register.use-case";
import { RefreshTokenUseCase } from "./application/use-cases/refresh-token.use-case";
import { SessionUseCase } from "./application/use-cases/session.use-case";
import { VerifyEmailUseCase } from "./application/use-cases/verify-email.use-case";
import { ResetPasswordUseCase } from "./application/use-cases/reset-password.use-case";

@Module({
  controllers: [AuthController],
  providers: [
    // Presentation
    AuthResolver,
    AccessTokenGuard,

    // Infra Binding
    { provide: IUserRepository, useClass: PrismaUserRepository },
    { provide: ISessionRepository, useClass: PrismaSessionRepository },
    { provide: IAuthTokenRepository, useClass: PrismaAuthTokenRepository },
    { provide: IAuditLogRepository, useClass: PrismaAuditLogRepository },
    { provide: IHashService, useClass: Argon2HashService },
    { provide: ITokenService, useClass: JwtTokenService },

    // Use Cases
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    SessionUseCase,
    VerifyEmailUseCase,
    ResetPasswordUseCase,
  ],
  exports: [
    // Exporting Use Cases if other modules need them
    // (We also export the Guards or Infra if needed)
  ],
})
export class AuthModule {}
