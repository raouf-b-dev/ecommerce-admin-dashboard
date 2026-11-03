import { HttpResponse } from 'msw/http';

/**
 * Nest-shaped shared error body for MSW handlers (mirrors API ErrorResponseDto).
 */
export function apiErrorResponse(
  statusCode: number,
  code: string,
  message: string,
) {
  return HttpResponse.json(
    {
      success: false,
      statusCode,
      message,
      code,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode },
  );
}
