import type { Request } from "express";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
}

export interface RequestMetadata {
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}

export type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};
