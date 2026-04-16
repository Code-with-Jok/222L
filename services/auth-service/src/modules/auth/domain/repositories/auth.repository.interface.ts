import { User } from "../entities/user.entity";
import { Session, NewSessionData } from "../types/session.types";

export interface IAuthRepository {
  createUser(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  
  // Session management
  createSession(data: NewSessionData): Promise<Session>;
  findSessionById(id: string): Promise<Session | null>;
  revokeSession(id: string, reason?: string): Promise<void>;
  replaceSession(oldSessionId: string, newSessionData: NewSessionData): Promise<Session>;
}
