import { ForbiddenException } from "@nestjs/common";
import type { User } from "@repo/db";

export type AuthUserRecord = Pick<
  User,
  | "id"
  | "email"
  | "displayName"
  | "role"
  | "isActive"
  | "emailVerifiedAt"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "passwordHash"
  | "failedLoginAttempts"
  | "lockedUntil"
>;

export interface FailedLoginState {
  failedLoginAttempts: number;
  lockedUntil: Date | null;
}

export function assertUserCanAuthenticate(user: AuthUserRecord): void {
  if (!user.isActive || user.deletedAt) {
    throw new ForbiddenException("Account is disabled");
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    throw new ForbiddenException("Account is temporarily locked");
  }
}

export function buildFailedLoginState(
  user: AuthUserRecord,
  maxFailedLogins: number,
  lockMinutes: number,
): FailedLoginState {
  const failedLoginAttempts = user.failedLoginAttempts + 1;
  const shouldLock = failedLoginAttempts >= maxFailedLogins;

  return {
    failedLoginAttempts,
    lockedUntil: shouldLock
      ? new Date(Date.now() + lockMinutes * 60 * 1000)
      : (user.lockedUntil ?? null),
  };
}
