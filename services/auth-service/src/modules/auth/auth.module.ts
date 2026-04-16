import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./presentation/rest/auth.controller";
import { AuthResolver } from "./presentation/graphql/auth.resolver";
import { RegisterUseCase } from "./application/use-cases/register.use-case";
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { PrismaAuthRepository } from "./infrastructure/persistence/prisma-auth.repository";
import { BcryptHashService } from "./infrastructure/security/bcrypt-hash.service";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "default_secret_for_dev_only",
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthResolver,
    RegisterUseCase,
    LoginUseCase,
    {
      provide: "IAuthRepository",
      useClass: PrismaAuthRepository,
    },
    {
      provide: "IHashService",
      useClass: BcryptHashService,
    },
  ],
  exports: [RegisterUseCase, LoginUseCase],
})
export class AuthModule {}
