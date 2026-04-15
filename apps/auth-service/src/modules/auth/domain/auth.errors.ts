export class AuthDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidCredentialsError extends AuthDomainError {
  constructor(message = "Invalid email or password") {
    super(message);
  }
}

export class AccountDisabledError extends AuthDomainError {
  constructor(message = "Account is disabled") {
    super(message);
  }
}

export class AccountLockedError extends AuthDomainError {
  constructor(message = "Account is temporarily locked") {
    super(message);
  }
}

export class EmailAlreadyRegisteredError extends AuthDomainError {
  constructor(message = "Email is already registered") {
    super(message);
  }
}

export class InvalidOrExpiredTokenError extends AuthDomainError {
  constructor(message = "Token is invalid or expired") {
    super(message);
  }
}

export class InvalidRefreshTokenError extends AuthDomainError {
  constructor(message = "Invalid refresh token") {
    super(message);
  }
}

export class TokenCompromisedError extends AuthDomainError {
  constructor(message = "Refresh token reuse detected") {
    super(message);
  }
}

export class UserNotFoundError extends AuthDomainError {
  constructor(message = "User not found") {
    super(message);
  }
}

export class ForbiddenSessionError extends AuthDomainError {
  constructor(message = "You cannot manipulate this session") {
    super(message);
  }
}
