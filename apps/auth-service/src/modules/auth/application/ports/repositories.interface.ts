import type {
  User,
  Session,
  AuthToken,
  AuthAuditLog,
  AuditEventType,
  AuthTokenPurpose,
  Role,
} from "@repo/db";

export interface CreateUserData {
  email: string;
  passwordHash: string;
  name: string | null;
  displayName: string | null;
  role: Role;
}

export const IUserRepository = Symbol("IUserRepository");

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
}

export interface CreateSessionData {
  userId: string;
  tokenHash: string;
  refreshFamilyId: string;
  expiresAt: Date;
  userAgent: string | null;
  ipAddress: string | null;
  lastSeenAt: Date;
}

export const ISessionRepository = Symbol("ISessionRepository");

export interface ISessionRepository {
  create(data: CreateSessionData): Promise<Session>;
  findByTokenHash(
    tokenHash: string,
  ): Promise<(Session & { user: User }) | null>;
  findByIdAndUserId(id: string, userId: string): Promise<Session | null>;
  findManyByUserId(userId: string): Promise<Session[]>;
  update(id: string, data: Partial<Session>): Promise<Session>;
  revokeFamily(refreshFamilyId: string, reason: string): Promise<number>;
  revokeAllForUser(userId: string, reason: string): Promise<number>;
  revokeByUserId(userId: string, reason: string): Promise<number>;
}

export interface CreateAuthTokenData {
  userId: string;
  purpose: AuthTokenPurpose;
  tokenHash: string;
  expiresAt: Date;
}

export const IAuthTokenRepository = Symbol("IAuthTokenRepository");

export interface IAuthTokenRepository {
  create(data: CreateAuthTokenData): Promise<AuthToken>;
  findValidByTokenHashAndPurpose(
    tokenHash: string,
    purpose: AuthTokenPurpose,
  ): Promise<AuthToken | null>;
  markAsConsumed(id: string): Promise<AuthToken>;
}

export interface CreateAuditLogData {
  userId?: string | null;
  sessionId?: string | null;
  eventType: AuditEventType;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  metadata?: Record<string, unknown>;
}

export const IAuditLogRepository = Symbol("IAuditLogRepository");

export interface IAuditLogRepository {
  create(data: CreateAuditLogData): Promise<AuthAuditLog>;
}
