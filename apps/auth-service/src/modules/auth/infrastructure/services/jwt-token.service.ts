import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  ITokenService,
  JwtPayload,
} from "../../application/ports/services.interface";

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  async signAccessToken(
    payload: JwtPayload,
    expiresInSeconds: number,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: `${expiresInSeconds}s`,
    });
  }
}
