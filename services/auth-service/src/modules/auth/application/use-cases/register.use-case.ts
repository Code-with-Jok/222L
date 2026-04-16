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

  async execute(data: RegisterCredentials) {
    // 1. Kiểm tra user tồn tại
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

    // 4. Lưu vào database
    return this.authRepository.createUser(newUser);
  }
}
