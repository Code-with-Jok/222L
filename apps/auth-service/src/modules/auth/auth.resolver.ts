import { UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
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

@Resolver()
export class AuthResolver {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly sessionUseCase: SessionUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Mutation(() => RegisterResponse)
  register(
    @Args("input") input: RegisterInput,
    @Context("req") request: RequestWithUser,
  ): Promise<RegisterResponse> {
    return this.registerUseCase.execute(input, extractRequestMetadata(request));
  }

  @Mutation(() => AuthPayload)
  login(
    @Args("input") input: LoginInput,
    @Context("req") request: RequestWithUser,
  ): Promise<AuthPayload> {
    return this.loginUseCase.execute(input, extractRequestMetadata(request));
  }

  @Mutation(() => AuthPayload)
  refresh(
    @Args("input") input: RefreshTokenInput,
    @Context("req") request: RequestWithUser,
  ): Promise<AuthPayload> {
    return this.refreshTokenUseCase.execute(
      input,
      extractRequestMetadata(request),
    );
  }

  @Mutation(() => OperationResponse)
  logout(
    @Args("input") input: RefreshTokenInput,
    @Context("req") request: RequestWithUser,
  ): Promise<OperationResponse> {
    return this.sessionUseCase.logout(input, extractRequestMetadata(request));
  }

  @Mutation(() => OperationResponse)
  @UseGuards(AccessTokenGuard)
  logoutAll(
    @Context("req") request: RequestWithUser,
  ): Promise<OperationResponse> {
    return this.sessionUseCase.logoutAll(
      request.user!,
      extractRequestMetadata(request),
    );
  }

  @Query(() => IdentityResponse)
  @UseGuards(AccessTokenGuard)
  me(@Context("req") request: RequestWithUser): Promise<IdentityResponse> {
    return this.sessionUseCase.me(request.user!);
  }

  @Query(() => SessionListResponse)
  @UseGuards(AccessTokenGuard)
  sessions(
    @Context("req") request: RequestWithUser,
  ): Promise<SessionListResponse> {
    return this.sessionUseCase.listSessions(request.user!);
  }

  @Mutation(() => OperationResponse)
  @UseGuards(AccessTokenGuard)
  revokeSession(
    @Args("sessionId") sessionId: string,
    @Context("req") request: RequestWithUser,
  ): Promise<OperationResponse> {
    return this.sessionUseCase.revokeSession(
      request.user!,
      sessionId,
      extractRequestMetadata(request),
    );
  }

  @Mutation(() => OperationResponse)
  requestEmailVerification(
    @Args("input") input: RequestEmailVerificationInput,
    @Context("req") request: RequestWithUser,
  ): Promise<OperationResponse> {
    return this.verifyEmailUseCase.requestVerification(
      input,
      extractRequestMetadata(request),
    );
  }

  @Mutation(() => OperationResponse)
  verifyEmail(
    @Args("input") input: VerifyEmailInput,
    @Context("req") request: RequestWithUser,
  ): Promise<OperationResponse> {
    return this.verifyEmailUseCase.verify(
      input,
      extractRequestMetadata(request),
    );
  }

  @Mutation(() => OperationResponse)
  forgotPassword(
    @Args("input") input: ForgotPasswordInput,
    @Context("req") request: RequestWithUser,
  ): Promise<OperationResponse> {
    return this.resetPasswordUseCase.requestReset(
      input,
      extractRequestMetadata(request),
    );
  }

  @Mutation(() => OperationResponse)
  resetPassword(
    @Args("input") input: ResetPasswordInput,
    @Context("req") request: RequestWithUser,
  ): Promise<OperationResponse> {
    return this.resetPasswordUseCase.reset(
      input,
      extractRequestMetadata(request),
    );
  }
}
