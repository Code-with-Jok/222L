import { Role } from "@repo/db";

export const IHashService = Symbol("IHashService");

export interface IHashService {
  hashPassword(password: string): Promise<string>;
  verifyPassword(hash: string, password: string): Promise<boolean>;
  hashOpaqueToken(value: string): string;
  generateOpaqueToken(byteLength?: number): string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  sid: string;
}

export const ITokenService = Symbol("ITokenService");

export interface ITokenService {
  signAccessToken(
    payload: JwtPayload,
    expiresInSeconds: number,
  ): Promise<string>;
}
