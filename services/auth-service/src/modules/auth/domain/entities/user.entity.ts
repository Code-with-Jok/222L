import { Role } from "../enums/role.enum";

export class User {
  constructor(
    public readonly id: string | undefined,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: Role,
    public readonly displayName?: string,
    public readonly avatarUrl?: string,
    public readonly isActive: boolean = true,
    public readonly emailVerifiedAt?: Date,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  public static create(data: {
    email: string;
    passwordHash: string;
    displayName?: string;
    role?: Role;
  }): User {
    return new User(
      undefined,
      data.email,
      data.passwordHash,
      data.role || Role.USER,
      data.displayName,
      undefined,
      true
    );
  }
}
