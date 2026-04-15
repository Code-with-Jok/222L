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

@InputType()
export class RegisterInput {
  @Field()
  @ApiProperty({ example: "alice@example.com" })
  @IsEmail()
  email!: string;

  @Field()
  @ApiProperty({ example: "Secret@123", minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: "Alice Nguyen", maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;
}

@InputType()
export class LoginInput {
  @Field()
  @ApiProperty({ example: "alice@example.com" })
  @IsEmail()
  email!: string;

  @Field()
  @ApiProperty({ example: "Secret@123", minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}

@InputType()
export class RefreshTokenInput {
  @Field()
  @ApiProperty({ example: "refresh-token" })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

@InputType()
export class RequestEmailVerificationInput {
  @Field()
  @ApiProperty({ example: "alice@example.com" })
  @IsEmail()
  email!: string;
}

@InputType()
export class VerifyEmailInput {
  @Field()
  @ApiProperty({ example: "verification-token" })
  @IsString()
  @IsNotEmpty()
  token!: string;
}

@InputType()
export class ForgotPasswordInput {
  @Field()
  @ApiProperty({ example: "alice@example.com" })
  @IsEmail()
  email!: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  @ApiProperty({ example: "reset-token" })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @Field()
  @ApiProperty({ example: "NewSecret@456", minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}

@ObjectType()
export class IdentityResponse {
  @Field()
  @ApiResponseProperty({ example: "usr-01" })
  id!: string;

  @Field()
  @ApiResponseProperty({ example: "alice@example.com" })
  email!: string;

  @Field(() => String, { nullable: true })
  @ApiPropertyOptional({ example: "Alice Nguyen" })
  displayName?: string | null;

  @Field()
  @ApiResponseProperty({ example: "USER" })
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
  @ApiResponseProperty({ example: "ses-01" })
  id!: string;

  @Field(() => String, { nullable: true })
  @ApiPropertyOptional({ example: "Mozilla/5.0" })
  userAgent?: string | null;

  @Field(() => String, { nullable: true })
  @ApiPropertyOptional({ example: "192.168.1.100" })
  ipAddress?: string | null;

  @Field(() => Date, { nullable: true })
  @ApiPropertyOptional({ example: "2026-04-15T10:55:00.000Z" })
  lastSeenAt?: Date | null;

  @Field(() => Date, { nullable: true })
  @ApiPropertyOptional()
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
  @ApiResponseProperty({ example: "access-token" })
  accessToken!: string;

  @Field()
  @ApiResponseProperty({ example: "Bearer" })
  tokenType!: string;

  @Field()
  @ApiResponseProperty({ example: 900 })
  expiresIn!: number;

  @Field()
  @ApiResponseProperty({ example: "refresh-token" })
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
  @ApiPropertyOptional({ example: "debug-token" })
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
