import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";
import { createHash, randomBytes } from "node:crypto";
import { IHashService } from "../../application/ports/services.interface";

@Injectable()
export class Argon2HashService implements IHashService {
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  hashOpaqueToken(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }

  generateOpaqueToken(byteLength = 32): string {
    return randomBytes(byteLength).toString("base64url");
  }
}
