import { Field, InputType, ObjectType } from "@nestjs/graphql";
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
} from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

// ─── Input DTOs ────────────────────────────────────────────────────────────────

@InputType()
export class RegisterInput {
  @Field()
  @ApiProperty({
    example: "alice@example.com",
    description: "Valid email address",
  })
  @IsEmail()
  email!: string;

  @Field()
  @ApiProperty({
    example: "Secret@123",
    description: "Min 8 chars, max 128 chars",
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({
    example: "Alice Nguyen",
    description: "Optional display name",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;
}

@InputType()
export class LoginInput {
  @Field()
  @ApiProperty({
    example: "alice@example.com",
    description: "Registered email address",
  })
  @IsEmail()
  email!: string;

  @Field()
  @ApiProperty({
    example: "Secret@123",
    description: "Account password",
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}

@InputType()
export class RefreshTokenInput {
  @Field()
  @ApiProperty({
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItMDAxIiwic2Vzc2lvbiI6InNlcy0wMDEiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDYwNDgwMH0.mock_refresh_signature",
    description: "JWT refresh token received from /auth/login or /auth/refresh",
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

@InputType()
export class RequestEmailVerificationInput {
  @Field()
  @ApiProperty({
    example: "alice@example.com",
    description: "Email to send verification link to",
  })
  @IsEmail()
  email!: string;
}

@InputType()
export class VerifyEmailInput {
  @Field()
  @ApiProperty({
    example: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
    description: "One-time verification token from the email link",
  })
  @IsString()
  @IsNotEmpty()
  token!: string;
}

@InputType()
export class ForgotPasswordInput {
  @Field()
  @ApiProperty({
    example: "alice@example.com",
    description: "Email linked to the account",
  })
  @IsEmail()
  email!: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  @ApiProperty({
    example: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
    description: "One-time password-reset token from the email link",
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @Field()
  @ApiProperty({
    example: "NewSecret@456",
    description: "New password, min 8 chars",
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}

// ─── Response DTOs ─────────────────────────────────────────────────────────────

@ObjectType()
export class IdentityResponse {
  @Field()
  @ApiResponseProperty({ example: "usr-01j9z2xkbf3m8pq4r5t6v7w8y9" })
  id!: string;

  @Field()
  @ApiResponseProperty({ example: "alice@example.com" })
  email!: string;

  @Field(() => String, { nullable: true })
  @ApiPropertyOptional({ example: "Alice Nguyen" })
  displayName?: string | null;

  @Field()
  @ApiResponseProperty({
    example: "USER",
    enum: ["USER", "ADMIN", "MODERATOR"],
  })
  role!: string;

  @Field()
  @ApiResponseProperty({ example: true })
  isActive!: boolean;

  @Field(() => Date, { nullable: true })
  @ApiPropertyOptional({ example: "2026-04-01T08:00:00.000Z" })
  emailVerifiedAt?: Date | null;

  @Field()
  @ApiResponseProperty({ example: "2026-04-01T07:30:00.000Z" })
  createdAt!: Date;

  @Field()
  @ApiResponseProperty({ example: "2026-04-15T11:00:00.000Z" })
  updatedAt!: Date;
}

@ObjectType()
export class SessionResponse {
  @Field()
  @ApiResponseProperty({ example: "ses-01j9z2xkbf3m8pq4r5t6v7w8y9" })
  id!: string;

  @Field(() => String, { nullable: true })
  @ApiPropertyOptional({
    example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  })
  userAgent?: string | null;

  @Field(() => String, { nullable: true })
  @ApiPropertyOptional({ example: "192.168.1.100" })
  ipAddress?: string | null;

  @Field(() => Date, { nullable: true })
  @ApiPropertyOptional({ example: "2026-04-15T10:55:00.000Z" })
  lastSeenAt?: Date | null;

  @Field(() => Date, { nullable: true })
  @ApiPropertyOptional({ example: null })
  revokedAt?: Date | null;

  @Field()
  @ApiResponseProperty({ example: "2026-04-22T07:30:00.000Z" })
  expiresAt!: Date;

  @Field()
  @ApiResponseProperty({ example: "2026-04-15T07:30:00.000Z" })
  createdAt!: Date;
}

@ObjectType()
export class AuthPayload {
  @Field()
  @ApiResponseProperty({
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItMDAxIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwMDM2MDB9.mock_access_signature",
  })
  accessToken!: string;

  @Field()
  @ApiResponseProperty({ example: "Bearer" })
  tokenType!: string;

  @Field()
  @ApiResponseProperty({ example: 3600 })
  expiresIn!: number;

  @Field()
  @ApiResponseProperty({
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItMDAxIiwic2Vzc2lvbiI6InNlcy0wMDEiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDYwNDgwMH0.mock_refresh_signature",
  })
  refreshToken!: string;

  @Field(() => IdentityResponse)
  @ApiResponseProperty({ type: IdentityResponse })
  identity!: IdentityResponse;

  @Field(() => SessionResponse)
  @ApiResponseProperty({ type: SessionResponse })
  session!: SessionResponse;
}

@ObjectType()
export class OperationResponse {
  @Field()
  @ApiResponseProperty({ example: true })
  success!: boolean;

  @Field()
  @ApiResponseProperty({ example: "Operation completed successfully." })
  message!: string;

  @Field(() => String, { nullable: true })
  @ApiPropertyOptional({
    example: "tok_debug_a1b2c3",
    description: "Debug token — only present in development mode",
  })
  debugToken?: string;
}

@ObjectType()
export class RegisterResponse extends OperationResponse {
  @Field(() => IdentityResponse)
  @ApiResponseProperty({ type: IdentityResponse })
  identity!: IdentityResponse;
}

@ObjectType()
export class SessionListResponse {
  @Field(() => [SessionResponse])
  @ApiResponseProperty({ type: [SessionResponse] })
  items!: SessionResponse[];
}
