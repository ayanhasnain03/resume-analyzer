import { Prisma } from "@/lib/generated/prisma/client";

export type PrismaErrorResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string; statusCode?: number };

/**
 * Custom Prisma error handler that provides user-friendly error messages
 * and standardized error responses.
 */
export class PrismaErrorHandler {
  /**
   * Handles Prisma errors and returns a standardized error response.
   * @param error - The error thrown by Prisma
   * @param defaultMessage - Default error message if error type cannot be determined
   * @returns Standardized error result with user-friendly message
   */
  static handle<T>(
    error: unknown,
    defaultMessage: string = "An unexpected error occurred"
  ): PrismaErrorResult<T> {
    // Handle PrismaClientKnownRequestError
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handleKnownRequestError(error);
    }

    // Handle PrismaClientUnknownRequestError
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      return {
        success: false,
        error: "An unexpected database error occurred. Please try again.",
        code: error.name,
        statusCode: 500,
      };
    }

    // Handle PrismaClientValidationError
    if (error instanceof Prisma.PrismaClientValidationError) {
      return {
        success: false,
        error: "Invalid data provided. Please check your input.",
        code: "VALIDATION_ERROR",
        statusCode: 400,
      };
    }

    // Handle PrismaClientInitializationError
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return {
        success: false,
        error: "Database connection failed. Please try again later.",
        code: "INITIALIZATION_ERROR",
        statusCode: 503,
      };
    }

    // Handle generic errors
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message || defaultMessage,
        statusCode: 500,
      };
    }

    // Fallback for unknown error types
    return {
      success: false,
      error: defaultMessage,
      statusCode: 500,
    };
  }

  /**
   * Handles known Prisma request errors based on error codes.
   */
  private static handleKnownRequestError(
    error: Prisma.PrismaClientKnownRequestError
  ): PrismaErrorResult<never> {
    switch (error.code) {
      case "P2002": // Unique constraint violation
        return this.handleUniqueConstraintError(error);

      case "P2025": // Record not found
        return {
          success: false,
          error: "The requested record was not found.",
          code: error.code,
          statusCode: 404,
        };

      case "P2003": // Foreign key constraint violation
        return {
          success: false,
          error: "Cannot perform this operation due to related records.",
          code: error.code,
          statusCode: 400,
        };

      case "P2000": // Value too long
        return {
          success: false,
          error: "The provided value is too long.",
          code: error.code,
          statusCode: 400,
        };

      case "P2001": // Record does not exist
        return {
          success: false,
          error: "The requested record does not exist.",
          code: error.code,
          statusCode: 404,
        };

      case "P2011": // Null constraint violation
        return {
          success: false,
          error: "A required field cannot be empty.",
          code: error.code,
          statusCode: 400,
        };

      case "P2012": // Missing required value
        return {
          success: false,
          error: "A required field is missing.",
          code: error.code,
          statusCode: 400,
        };

      case "P2013": // Missing required argument
        return {
          success: false,
          error: "A required argument is missing.",
          code: error.code,
          statusCode: 400,
        };

      case "P2014": // Invalid ID provided
        return {
          success: false,
          error: "The provided ID is invalid.",
          code: error.code,
          statusCode: 400,
        };

      case "P2015": // Related record not found
        return {
          success: false,
          error: "A related record was not found.",
          code: error.code,
          statusCode: 404,
        };

      case "P2016": // Query interpretation error
        return {
          success: false,
          error: "Invalid query. Please check your request.",
          code: error.code,
          statusCode: 400,
        };

      case "P2017": // Records for relation not connected
        return {
          success: false,
          error: "The related records are not connected.",
          code: error.code,
          statusCode: 400,
        };

      case "P2018": // Required connected records not found
        return {
          success: false,
          error: "Required connected records were not found.",
          code: error.code,
          statusCode: 404,
        };

      case "P2019": // Input error
        return {
          success: false,
          error: "Invalid input provided.",
          code: error.code,
          statusCode: 400,
        };

      case "P2020": // Value out of range
        return {
          success: false,
          error: "The provided value is out of acceptable range.",
          code: error.code,
          statusCode: 400,
        };

      case "P2021": // Table does not exist
        return {
          success: false,
          error: "Database table not found. Please contact support.",
          code: error.code,
          statusCode: 500,
        };

      case "P2022": // Column does not exist
        return {
          success: false,
          error: "Database column not found. Please contact support.",
          code: error.code,
          statusCode: 500,
        };

      case "P2023": // Inconsistent column data
        return {
          success: false,
          error:
            "Database data inconsistency detected. Please contact support.",
          code: error.code,
          statusCode: 500,
        };

      case "P2024": // Connection timed out
        return {
          success: false,
          error: "Database connection timed out. Please try again.",
          code: error.code,
          statusCode: 503,
        };

      case "P2026": // Unsupported feature
        return {
          success: false,
          error: "This database feature is not supported.",
          code: error.code,
          statusCode: 501,
        };

      case "P2027": // Multiple errors occurred
        return {
          success: false,
          error: "Multiple errors occurred. Please check your input.",
          code: error.code,
          statusCode: 400,
        };

      default:
        return {
          success: false,
          error: `Database error: ${error.message}`,
          code: error.code,
          statusCode: 500,
        };
    }
  }

  /**
   * Handles unique constraint violations with field-specific messages.
   */
  private static handleUniqueConstraintError(
    error: Prisma.PrismaClientKnownRequestError
  ): PrismaErrorResult<never> {
    const target = error.meta?.target as string[] | undefined;
    const field = target?.[0];

    if (field) {
      // Format field name (e.g., "email" -> "Email", "userName" -> "User name")
      const formattedField = field
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

      return {
        success: false,
        error: `${formattedField} already exists.`,
        code: error.code,
        statusCode: 409, // Conflict status code
      };
    }

    return {
      success: false,
      error: "A record with these values already exists.",
      code: error.code,
      statusCode: 409,
    };
  }

  /**
   * Wraps a Prisma operation with automatic error handling.
   * @param operation - The Prisma operation to execute
   * @param defaultError - Default error message if operation fails
   * @returns Promise with standardized result
   */
  static async wrap<T>(
    operation: () => Promise<T>,
    defaultError: string = "Operation failed"
  ): Promise<PrismaErrorResult<T>> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      return this.handle<T>(error, defaultError);
    }
  }

  /**
   * Transforms a PrismaErrorResult to use a custom property name instead of 'data'.
   * Useful for maintaining backward compatibility or matching specific API patterns.
   * @param result - The result to transform
   * @param propertyName - The custom property name (e.g., 'user', 'product', etc.)
   * @returns Transformed result with custom property name
   */
  static transform<T, K extends string>(
    result: PrismaErrorResult<T>,
    propertyName: K
  ):
    | ({ success: true } & Record<K, T>)
    | { success: false; error: string; code?: string; statusCode?: number } {
    if (result.success) {
      return {
        success: true,
        [propertyName]: result.data,
      } as { success: true } & Record<K, T>;
    }
    return result;
  }
}
