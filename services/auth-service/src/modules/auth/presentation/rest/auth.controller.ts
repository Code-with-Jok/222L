import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { RegisterRestRequestDto } from "./dto/register-rest-request.dto";
import { RegisterUseCase } from "../../application/use-cases/register.use-case";
import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { LoginCredentials } from "../../application/dto/login-credentials.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase
  ) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Register a new account",
    description: "Creates a new user account using Clean Architecture layers.",
  })
  async register(@Body() dto: RegisterRestRequestDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Login to account",
    description: "Validates credentials and returns an access token.",
  })
  async login(@Body() credentials: LoginCredentials) {
    return this.loginUseCase.execute(credentials);
  }
}
