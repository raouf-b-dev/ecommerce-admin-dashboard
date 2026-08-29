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
    error instanceof ApiRequestError &&
    (error.statusCode === 409 || error.code === 'OPTIMISTIC_LOCK_CONFLICT')
  );
}
