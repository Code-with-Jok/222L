import { Role } from "@repo/db";

export class User {
  constructor(
    public readonly id: string,
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
      "", // ID sẽ được sinh ra bởi persistence layer hoặc nanoid
      data.email,
      data.passwordHash,
      data.role || Role.USER,
      data.displayName,
      undefined,
      true
    );
  }
}
