import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
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
    if (!user) {
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

    // 3. Tạo JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    // 4. Tạo session (Tùy chọn: có thể tích hợp Refresh Token ở đây)
    await this.authRepository.createSession({
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 ngày
      tokenHash: "initial-login-session", // Trong thực tế nên là hash của refresh token
    });

    return new AuthResultDto(
      {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
      accessToken
    );
  }
}
