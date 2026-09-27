export type ParsedAuthError = {
  statusCode: number;
  message: string;
  code?: string;
};

export class AuthRequestError extends Error {
  readonly statusCode: number;
  readonly code?: string;

  constructor(parsed: ParsedAuthError) {
    super(parsed.message);
    this.name = 'AuthRequestError';
    this.statusCode = parsed.statusCode;
    this.code = parsed.code;
  }
}

export function parseAuthErrorBody(body: unknown): ParsedAuthError | null {
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

  return {
    statusCode,
    message,
    code: typeof record.code === 'string' ? record.code : undefined,
  };
}

export async function readAuthErrorFromResponse(
  response: Response,
): Promise<ParsedAuthError | null> {
  try {
    const body = await response.clone().json();
    return parseAuthErrorBody(body);
  } catch {
    return null;
  }
}

export function toAuthRequestError(
  response: Response,
  parsed: ParsedAuthError | null,
  fallbackMessage: string,
): AuthRequestError {
  return new AuthRequestError(
    parsed ?? {
      statusCode: response.status,
      message: fallbackMessage,
    },
  );
}
