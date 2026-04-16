import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiResponse } from "@nestjs/swagger";
import { RegisterRestRequestDto } from "./dto/register-rest-request.dto";
import { RegisterRestResponseDto } from "./dto/register-rest-response.dto";
import { RegisterUseCase } from "../../application/use-cases/register.use-case";
import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { LoginCredentials } from "../../application/dto/login-credentials.dto";
import { AuthResultDto } from "../../application/dto/auth-result.dto";

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
    description: "Creates a new user account and returns the minimal public profile.",
  })
  @ApiResponse({ type: RegisterRestResponseDto })
  async register(@Body() dto: RegisterRestRequestDto): Promise<RegisterRestResponseDto> {
    const user = await this.registerUseCase.execute(dto);
    
    // Manual mapping to prevent leaking sensitive data (passwordHash, etc.)
    return new RegisterRestResponseDto(
      user.id!,
      user.email,
      user.role,
      user.displayName
    );
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Login to account",
    description: "Validates credentials and returns an access token and refresh token.",
  })
  @ApiResponse({ type: AuthResultDto })
  async login(@Body() credentials: LoginCredentials): Promise<AuthResultDto> {
    return this.loginUseCase.execute(credentials);
  }
}
