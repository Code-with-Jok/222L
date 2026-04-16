import { User } from "../entities/user.entity";
import { Session } from "@repo/db";

export interface IAuthRepository {
  createUser(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  
  // Session management
  createSession(data: {
    userId: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
    tokenHash?: string;
    refreshFamilyId?: string;
  }): Promise<Session>;
  
  findSessionById(id: string): Promise<Session | null>;
  revokeSession(id: string, reason?: string): Promise<void>;
  replaceSession(oldSessionId: string, newSessionData: any): Promise<Session>;
}
