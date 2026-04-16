import { Role } from "../../../domain/enums/role.enum";

export class RegisterRestResponseDto {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly role: Role,
    public readonly displayName?: string
  ) {}
}
