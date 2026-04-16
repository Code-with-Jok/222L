import { Inject, Injectable, ConflictException } from "@nestjs/common";
import { IAuthRepository } from "../../domain/repositories/auth.repository.interface";
import { IHashService } from "../../domain/services/hash.service.interface";
import { User } from "../../domain/entities/user.entity";
import { RegisterCredentials } from "../dto/register-credentials";

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject("IAuthRepository")
    private readonly authRepository: IAuthRepository,
    @Inject("IHashService")
    private readonly hashService: IHashService
  ) {}

  async execute(data: RegisterCredentials): Promise<User> {
    // 1. Kiểm tra user tồn tại (Optimistic check)
    const existingUser = await this.authRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    // 2. Hash mật khẩu
    const passwordHash = await this.hashService.hash(data.password);

    // 3. Tạo entity
    const newUser = User.create({
      email: data.email,
      passwordHash,
      displayName: data.displayName,
    });

    // 4. Lưu vào database (Handle concurrency)
    try {
      return await this.authRepository.createUser(newUser);
    } catch (error) {
      // In a real application, check for specific DB error codes (e.g., P2002 for Prisma)
      // Here we assume any error during creation related to constraints is a conflict
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException("Registration failed due to a conflict or server error");
    }
  }
}
