import { RequestMetadata, RequestWithUser } from "./auth.types";

function getHeader(
  headers: RequestWithUser["headers"] | undefined,
  name: string,
): string | null {
  const value = headers?.[name.toLowerCase() as keyof typeof headers];
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return typeof value === "string" ? value : null;
}

export function extractRequestMetadata(
  request: RequestWithUser | undefined,
): RequestMetadata {
  if (!request) {
    return {};
  }

  return {
    ipAddress:
      request.ip ??
      getHeader(request.headers, "x-forwarded-for") ??
      getHeader(request.headers, "x-real-ip"),
    userAgent: getHeader(request.headers, "user-agent"),
    requestId: getHeader(request.headers, "x-request-id"),
  };
}
