export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  revokedAt?: Date;
  revokeReason?: string;
  userAgent?: string;
  ipAddress?: string;
  tokenHash?: string;
  refreshFamilyId?: string;
  replacedBySessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewSessionData {
  userId: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
  tokenHash?: string;
  refreshFamilyId?: string;
}
