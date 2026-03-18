/**
 * Stable error codes for the financial forecasting system.
 * Used across frontend and backend for consistent error handling.
 */

export const ErrorCodes = {
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_STAGE: 'INVALID_STAGE',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_DATE: 'INVALID_DATE',
  INVALID_ID_FORMAT: 'INVALID_ID_FORMAT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Entity errors
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
  ENTITY_ALREADY_EXISTS: 'ENTITY_ALREADY_EXISTS',
  ENTITY_CONFLICT: 'ENTITY_CONFLICT',

  // Business logic errors
  CAPACITY_GATE: 'CAPACITY_GATE',
  STAGE_TRANSITION_INVALID: 'STAGE_TRANSITION_INVALID',
  SYNC_IN_PROGRESS: 'SYNC_IN_PROGRESS',
  INVOICE_ALREADY_EXISTS: 'INVOICE_ALREADY_EXISTS',
  CUSTOMER_MAPPING_MISSING: 'CUSTOMER_MAPPING_MISSING',

  // Service errors
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  AUTHORIZATION_DENIED: 'AUTHORIZATION_DENIED',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  TIMEOUT: 'TIMEOUT',

  // Data errors
  CSV_PARSE_ERROR: 'CSV_PARSE_ERROR',
  DATA_INTEGRITY_ERROR: 'DATA_INTEGRITY_ERROR',
  ENRICHMENT_FAILED: 'ENRICHMENT_FAILED',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Structured error for consistent error handling.
 */
export interface AppError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Create a structured AppError.
 */
export function createAppError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
): AppError {
  return { code, message, details };
}

/**
 * Check if an error message matches a known error code pattern.
 */
export function extractErrorCode(error: unknown): ErrorCode | null {
  if (error instanceof Error) {
    for (const code of Object.values(ErrorCodes)) {
      if (error.message.includes(code)) return code;
    }
  }
  return null;
}
