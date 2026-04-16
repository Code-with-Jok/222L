import { Field, InputType } from "@nestjs/graphql";
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { RegisterCredentials } from "../../../application/dto/register-credentials";

@InputType()
export class RegisterInput implements RegisterCredentials {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;
}
