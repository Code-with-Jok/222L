import { Injectable } from "@nestjs/common";
import { AuthToken, AuthTokenPurpose, prisma } from "@repo/db";
import {
  CreateAuthTokenData,
  IAuthTokenRepository,
} from "../../application/ports/repositories.interface";

@Injectable()
export class PrismaAuthTokenRepository implements IAuthTokenRepository {
  async create(data: CreateAuthTokenData): Promise<AuthToken> {
    return prisma.authToken.create({
      data,
    });
  }

  async findValidByTokenHashAndPurpose(
    tokenHash: string,
    purpose: AuthTokenPurpose,
  ): Promise<AuthToken | null> {
    return prisma.authToken.findFirst({
      where: {
        tokenHash,
        purpose,
        consumedAt: null,
      },
    });
  }

  async markAsConsumed(id: string): Promise<AuthToken> {
    return prisma.authToken.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }
}
