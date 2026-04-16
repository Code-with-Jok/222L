import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomBytes, createHash } from "node:crypto";
import { authConfig } from "../../../../config/auth.config";
import { IAuthRepository } from "../../domain/repositories/auth.repository.interface";
import { IHashService } from "../../domain/services/hash.service.interface";
import { AuthResultDto } from "../dto/auth-result.dto";
import { LoginCredentials } from "../dto/login-credentials.dto";

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject("IAuthRepository")
    private readonly authRepository: IAuthRepository,
    @Inject("IHashService")
    private readonly hashService: IHashService,
    private readonly jwtService: JwtService
  ) {}

  async execute(data: LoginCredentials): Promise<AuthResultDto> {
    // 1. Tìm user
    const user = await this.authRepository.findByEmail(data.email);
    if (!user || !user.id) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // 2. Kiểm tra mật khẩu
    const isPasswordValid = await this.hashService.compare(
      data.password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // 3. Tạo JWT Access Token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    // 4. Tạo Refresh Token và lưu Session
    const refreshToken = randomBytes(40).toString("hex");
    const tokenHash = createHash("sha256").update(refreshToken).digest("hex");
    const expiresAt = new Date(Date.now() + authConfig.refreshTokenTtl);

    await this.authRepository.createSession({
      userId: user.id,
      expiresAt,
      tokenHash,
    });

    return new AuthResultDto(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
      },
      accessToken,
      refreshToken
    );
  }
}
