/**
 * 🔴 CUSTOM ERROR CLASSES
 * Centralized error handling system for better debugging and error tracking
 */

/**
 * Base Application Error
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = "INTERNAL_ERROR",
    statusCode: number = 500,
    isOperational: boolean = true,
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Authentication Error
 */
export class AuthError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, "AUTH_ERROR", 401);
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  public readonly fields: Record<string, string>;

  constructor(
    message: string = "Validation failed",
    fields: Record<string, string> = {},
  ) {
    super(message, "VALIDATION_ERROR", 400);
    this.fields = fields;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      fields: this.fields,
    };
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, "AUTHORIZATION_ERROR", 403);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, "NOT_FOUND_ERROR", 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed") {
    super(message, "DATABASE_ERROR", 500, false);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Network Error
 */
export class NetworkError extends AppError {
  constructor(message: string = "Network request failed") {
    super(message, "NETWORK_ERROR", 500, false);
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Error handler utility
 */
export const handleError = (error: any): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof TypeError) {
    return new ValidationError("Invalid data type");
  }

  if (error instanceof ReferenceError) {
    return new AppError("Reference error occurred", "REF_ERROR", 500, false);
  }

  if (typeof error === "string") {
    return new AppError(error, "UNKNOWN_ERROR", 500);
  }

  return new AppError(
    error?.message || "An unexpected error occurred",
    "UNKNOWN_ERROR",
    500,
  );
};
