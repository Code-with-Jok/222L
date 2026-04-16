import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { RegisterCredentials } from "../../../application/dto/register-credentials";

export class RegisterRestRequestDto implements RegisterCredentials {
  @ApiProperty({
    example: "alice@example.com",
    description: "Valid email address",
  })
  @IsEmail()
  email!: string;

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
