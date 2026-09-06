import { AuthRequestError } from '@/features/auth/api/parse-auth-error';

export type ParsedApiError = {
  statusCode: number;
  message: string;
  code?: string;
  errors?: string[];
};

export class ApiRequestError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly errors?: string[];

  constructor(parsed: ParsedApiError) {
    super(parsed.message);
    this.name = 'ApiRequestError';
    this.statusCode = parsed.statusCode;
    this.code = parsed.code;
    this.errors = parsed.errors;
  }
}

export function parseApiErrorBody(body: unknown): ParsedApiError | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const record = body as Record<string, unknown>;
  const statusCode =
    typeof record.statusCode === 'number' ? record.statusCode : null;
  const message =
    typeof record.message === 'string' ? record.message : null;

  if (statusCode === null || message === null) {
    return null;
  }

  const errors = Array.isArray(record.errors)
    ? record.errors.filter((item): item is string => typeof item === 'string')
    : undefined;

  return {
    statusCode,
    message,
    code: typeof record.code === 'string' ? record.code : undefined,
    errors: errors && errors.length > 0 ? errors : undefined,
  };
}

export async function readApiErrorFromResponse(
  response: Response,
): Promise<ParsedApiError | null> {
  try {
    const body = await response.clone().json();
    return parseApiErrorBody(body);
  } catch {
    return null;
  }
}

export function toApiRequestError(
  response: Response,
  parsed: ParsedApiError | null,
  fallbackMessage: string,
): ApiRequestError {
  return new ApiRequestError(
    parsed ?? {
      statusCode: response.status,
      message: fallbackMessage,
    },
  );
}

export function isOptimisticLockConflict(error: unknown): boolean {
  return (
    hasHttpStatus(error, 409) ||
    (error instanceof ApiRequestError && error.code === 'OPTIMISTIC_LOCK_CONFLICT')
  );
}

/**
 * Safely extracts the HTTP status code from any error shape
 * (ApiRequestError, AuthRequestError, Response-like objects, or generic error objects).
 */
export function getErrorStatusCode(error: unknown): number | null {
  if (error instanceof ApiRequestError) {
    return error.statusCode;
  }
  if (error instanceof AuthRequestError) {
    return error.statusCode;
  }
  if (error && typeof error === 'object') {
    if (
      'statusCode' in error &&
      typeof (error as { statusCode: unknown }).statusCode === 'number'
    ) {
      return (error as { statusCode: number }).statusCode;
    }
    if (
      'status' in error &&
      typeof (error as { status: unknown }).status === 'number'
    ) {
      return (error as { status: number }).status;
    }
  }
  return null;
}

/**
 * Checks if an error's HTTP status code falls within an inclusive [min, max] range.
 */
export function isStatusInRange(
  error: unknown,
  min: number,
  max: number,
): boolean {
  const status = getErrorStatusCode(error);
  return status !== null && status >= min && status <= max;
}

/**
 * Checks if an error has any of the specified HTTP status codes.
 * Example: hasHttpStatus(error, 401, 403) or hasHttpStatus(error, 429)
 */
export function hasHttpStatus(
  error: unknown,
  ...statusCodes: number[]
): boolean {
  const status = getErrorStatusCode(error);
  return status !== null && statusCodes.includes(status);
}

/**
 * Semantic RFC 9110 client error check (HTTP 400–499).
 */
export const isClientError = (error: unknown): boolean =>
  isStatusInRange(error, 400, 499);

/**
 * Semantic RFC 9110 server error check (HTTP 500–599).
 */
export const isServerError = (error: unknown): boolean =>
  isStatusInRange(error, 500, 599);

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    if (error.errors && error.errors.length > 0) {
      return error.errors.join('. ');
    }
    if (error.message?.trim()) return error.message;
  }
  if (error instanceof Error && error.message?.trim()) {
    return error.message;
  }
  return fallback;
}
