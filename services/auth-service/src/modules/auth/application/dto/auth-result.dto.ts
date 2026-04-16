import { Role } from "../../domain/enums/role.enum";

export class AuthResultDto {
  constructor(
    public readonly user: {
      id: string;
      email: string;
      role: Role;
      displayName?: string;
    },
    public readonly accessToken: string,
    public readonly refreshToken?: string
  ) {}
}
