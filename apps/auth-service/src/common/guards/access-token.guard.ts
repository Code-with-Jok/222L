import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthenticatedUser, RequestWithUser } from "../auth.types";

interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  sid: string;
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    const header =
      request.headers?.authorization ?? request.headers?.Authorization;

    if (!header || Array.isArray(header)) {
      throw new UnauthorizedException("Missing bearer token");
    }

    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("Invalid authorization header");
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(token);
      request.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        sessionId: payload.sid,
      } satisfies AuthenticatedUser;

      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired access token");
    }
  }

  private getRequest(context: ExecutionContext): RequestWithUser {
    if (context.getType<string>() === "http") {
      return context.switchToHttp().getRequest<RequestWithUser>();
    }

    const gqlContext = GqlExecutionContext.create(context);
    return gqlContext.getContext<{ req: RequestWithUser }>().req;
  }
}
