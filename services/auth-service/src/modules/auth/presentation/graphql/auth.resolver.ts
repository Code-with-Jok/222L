import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { RegisterUseCase } from "../../application/use-cases/register.use-case";
import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { RegisterInput } from "./dto/register-graphql-request.dto";

@Resolver()
export class AuthResolver {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase
  ) {}

  @Query(() => String)
  hello() {
    return "Hello World";
  }

  @Mutation(() => String)
  async register(@Args("input") input: RegisterInput) {
    await this.registerUseCase.execute(input);
    return "User registered successfully";
  }

  // Lưu ý: Đăng nhập thường được ưu tiên thực hiện qua REST để bảo mật (cookie) 
  // nhưng có thể triển khai mutation ở đây nếu cần.
}
