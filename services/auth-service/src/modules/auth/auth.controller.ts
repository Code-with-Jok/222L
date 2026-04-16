import { Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  // REGISTER
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Register a new account",
    description:
      "Creates a new user account and returns the identity object. An email verification link is sent automatically.",
  })

  // LOGIN
  @Post("login")
  login() {
    return "Login";
  }
}
