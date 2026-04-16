import { User } from "../../domain/entities/user.entity";

export class AuthResultDto {
  constructor(
    public readonly user: {
      id: string;
      email: string;
      displayName?: string;
      role: string;
    },
    public readonly accessToken: string,
    public readonly refreshToken?: string
  ) {}
}
