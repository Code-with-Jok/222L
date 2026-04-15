import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AccessTokenGuard } from "../../common/guards/access-token.guard";
import { extractRequestMetadata } from "../../common/request-metadata";
import { RequestWithUser } from "../../common/auth.types";
import {
  AuthPayload,
  ForgotPasswordInput,
  IdentityResponse,
  LoginInput,
  OperationResponse,
  RefreshTokenInput,
  RegisterInput,
  RegisterResponse,
  RequestEmailVerificationInput,
  ResetPasswordInput,
  SessionListResponse,
  VerifyEmailInput,
} from "./auth.dto";
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { RegisterUseCase } from "./application/use-cases/register.use-case";
import { RefreshTokenUseCase } from "./application/use-cases/refresh-token.use-case";
import { SessionUseCase } from "./application/use-cases/session.use-case";
import { VerifyEmailUseCase } from "./application/use-cases/verify-email.use-case";
import { ResetPasswordUseCase } from "./application/use-cases/reset-password.use-case";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly sessionUseCase: SessionUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  // ─── Register ──────────────────────────────────────────────────────────────

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Register a new account",
    description:
      "Creates a new user account and returns the identity object. An email verification link is sent automatically.",
  })
  @ApiResponse({
    status: 201,
    description: "Account created successfully.",
    type: RegisterResponse,
  })
  @ApiResponse({
    status: 400,
    description: "Validation error (invalid email, weak password, etc.).",
  })
  @ApiResponse({ status: 409, description: "Email already in use." })
  register(
    @Body() input: RegisterInput,
    @Req() request: RequestWithUser,
  ): Promise<RegisterResponse> {
    return this.registerUseCase.execute(input, extractRequestMetadata(request));
  }

  // ─── Login ─────────────────────────────────────────────────────────────────

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Login with email and password",
    description:
      "Authenticates the user and returns a short-lived access token plus a long-lived refresh token.",
  })
  @ApiResponse({
    status: 200,
    description: "Login successful. Returns tokens and identity.",
    type: AuthPayload,
  })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 401, description: "Invalid credentials." })
  @ApiResponse({
    status: 423,
    description: "Account locked due to too many failed login attempts.",
  })
  login(
    @Body() input: LoginInput,
    @Req() request: RequestWithUser,
  ): Promise<AuthPayload> {
    return this.loginUseCase.execute(input, extractRequestMetadata(request));
  }

  // ─── Refresh ───────────────────────────────────────────────────────────────

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Rotate a refresh token and issue new credentials",
    description:
      "Exchanges a valid refresh token for a new access/refresh token pair. The old token is immediately invalidated.",
  })
  @ApiResponse({
    status: 200,
    description: "Token rotated successfully.",
    type: AuthPayload,
  })
  @ApiResponse({
    status: 401,
    description: "Refresh token is invalid or expired.",
  })
  refresh(
    @Body() input: RefreshTokenInput,
    @Req() request: RequestWithUser,
  ): Promise<AuthPayload> {
    return this.refreshTokenUseCase.execute(
      input,
      extractRequestMetadata(request),
    );
  }

  // ─── Logout ────────────────────────────────────────────────────────────────

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Logout a single session using its refresh token",
    description:
      "Revokes the session associated with the provided refresh token.",
  })
  @ApiResponse({
    status: 200,
    description: "Session revoked.",
    type: OperationResponse,
  })
  @ApiResponse({
    status: 401,
    description: "Token is invalid or already revoked.",
  })
  logout(
    @Body() input: RefreshTokenInput,
    @Req() request: RequestWithUser,
  ): Promise<OperationResponse> {
    return this.sessionUseCase.logout(input, extractRequestMetadata(request));
  }

  // ─── Logout All ────────────────────────────────────────────────────────────

  @Post("logout-all")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Revoke all active sessions for the current user",
    description:
      "Invalidates every session belonging to the authenticated user. Requires a valid Bearer access token.",
  })
  @ApiResponse({
    status: 200,
    description: "All sessions revoked.",
    type: OperationResponse,
  })
  @ApiResponse({ status: 401, description: "Missing or invalid access token." })
  logoutAll(@Req() request: RequestWithUser): Promise<OperationResponse> {
    return this.sessionUseCase.logoutAll(
      request.user!,
      extractRequestMetadata(request),
    );
  }

  // ─── Me ────────────────────────────────────────────────────────────────────

  @Get("me")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get the current authenticated user",
    description:
      "Returns the full identity object of the user whose Bearer token is supplied.",
  })
  @ApiResponse({
    status: 200,
    description: "Current user identity.",
    type: IdentityResponse,
  })
  @ApiResponse({ status: 401, description: "Missing or invalid access token." })
  me(@Req() request: RequestWithUser): Promise<IdentityResponse> {
    return this.sessionUseCase.me(request.user!);
  }

  // ─── Sessions ──────────────────────────────────────────────────────────────

  @Get("sessions")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "List sessions for the current user",
    description:
      "Returns all active and revoked sessions for the authenticated user.",
  })
  @ApiResponse({
    status: 200,
    description: "List of sessions.",
    type: SessionListResponse,
  })
  @ApiResponse({ status: 401, description: "Missing or invalid access token." })
  sessions(@Req() request: RequestWithUser): Promise<SessionListResponse> {
    return this.sessionUseCase.listSessions(request.user!);
  }

  // ─── Revoke Session ────────────────────────────────────────────────────────

  @Delete("sessions/:sessionId")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Revoke a specific session",
    description:
      "Invalidates a single session by ID. The session must belong to the authenticated user.",
  })
  @ApiParam({
    name: "sessionId",
    description: "The unique session ID to revoke",
    example: "ses-01j9z2xkbf3m8pq4r5t6v7w8y9",
  })
  @ApiResponse({
    status: 200,
    description: "Session revoked.",
    type: OperationResponse,
  })
  @ApiResponse({ status: 401, description: "Missing or invalid access token." })
  @ApiResponse({
    status: 404,
    description: "Session not found or does not belong to the current user.",
  })
  revokeSession(
    @Req() request: RequestWithUser,
    @Param("sessionId") sessionId: string,
  ): Promise<OperationResponse> {
    return this.sessionUseCase.revokeSession(
      request.user!,
      sessionId,
      extractRequestMetadata(request),
    );
  }

  // ─── Email Verification ────────────────────────────────────────────────────

  @Post("verify-email/request")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Create an email verification token",
    description:
      "Sends a verification email to the specified address. Rate-limited per address.",
  })
  @ApiResponse({
    status: 200,
    description: "Verification email sent (or queued).",
    type: OperationResponse,
  })
  @ApiResponse({ status: 400, description: "Invalid email format." })
  @ApiResponse({ status: 404, description: "No account found for this email." })
  requestEmailVerification(
    @Body() input: RequestEmailVerificationInput,
    @Req() request: RequestWithUser,
  ): Promise<OperationResponse> {
    return this.verifyEmailUseCase.requestVerification(
      input,
      extractRequestMetadata(request),
    );
  }

  @Post("verify-email/confirm")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Verify email with a one-time token",
    description:
      "Validates the one-time token from the verification email and marks the account as verified.",
  })
  @ApiResponse({
    status: 200,
    description: "Email verified successfully.",
    type: OperationResponse,
  })
  @ApiResponse({
    status: 400,
    description: "Token is invalid, malformed, or expired.",
  })
  verifyEmail(
    @Body() input: VerifyEmailInput,
    @Req() request: RequestWithUser,
  ): Promise<OperationResponse> {
    return this.verifyEmailUseCase.verify(
      input,
      extractRequestMetadata(request),
    );
  }

  // ─── Password Reset ────────────────────────────────────────────────────────

  @Post("password/forgot")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Create a password reset token",
    description:
      "Sends a password-reset email. Always returns 200 to prevent user enumeration attacks.",
  })
  @ApiResponse({
    status: 200,
    description: "Reset email sent if the account exists.",
    type: OperationResponse,
  })
  @ApiResponse({ status: 400, description: "Invalid email format." })
  forgotPassword(
    @Body() input: ForgotPasswordInput,
    @Req() request: RequestWithUser,
  ): Promise<OperationResponse> {
    return this.resetPasswordUseCase.requestReset(
      input,
      extractRequestMetadata(request),
    );
  }

  @Post("password/reset")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Reset password with a one-time token",
    description:
      "Validates the reset token and updates the user's password. The token is immediately consumed.",
  })
  @ApiResponse({
    status: 200,
    description: "Password updated successfully.",
    type: OperationResponse,
  })
  @ApiResponse({
    status: 400,
    description: "Token is invalid, expired, or new password fails validation.",
  })
  resetPassword(
    @Body() input: ResetPasswordInput,
    @Req() request: RequestWithUser,
  ): Promise<OperationResponse> {
    return this.resetPasswordUseCase.reset(
      input,
      extractRequestMetadata(request),
    );
  }
}
