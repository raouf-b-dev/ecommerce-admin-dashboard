import { describe, expect, it } from 'vitest';
import { AuthRequestError } from '@/features/auth/api/parse-auth-error';
import {
  ApiRequestError,
  getErrorMessage,
  getErrorStatusCode,
  hasHttpStatus,
  isClientError,
  isOptimisticLockConflict,
  isServerError,
  isStatusInRange,
  parseApiErrorBody,
} from '@/lib/api/parse-api-error';

describe('parseApiErrorBody', () => {
  it('parses GlobalExceptionFilter shape with validation errors', () => {
    expect(
      parseApiErrorBody({
        success: false,
        statusCode: 400,
        message: 'Validation failed',
        errors: ['name must be a string', 'price must be a positive number'],
      }),
    ).toEqual({
      statusCode: 400,
      message: 'Validation failed',
      errors: ['name must be a string', 'price must be a positive number'],
    });
  });

  it('parses conflict code', () => {
    expect(
      parseApiErrorBody({
        success: false,
        statusCode: 409,
        message: 'Resource was modified by another request. Please reload and retry.',
        code: 'OPTIMISTIC_LOCK_CONFLICT',
      }),
    ).toEqual({
      statusCode: 409,
      message:
        'Resource was modified by another request. Please reload and retry.',
      code: 'OPTIMISTIC_LOCK_CONFLICT',
    });
  });

  it('returns null for non-object bodies', () => {
    expect(parseApiErrorBody(null)).toBeNull();
    expect(parseApiErrorBody('error')).toBeNull();
  });
});

describe('isOptimisticLockConflict', () => {
  it('detects 409 ApiRequestError', () => {
    expect(
      isOptimisticLockConflict(
        new ApiRequestError({
          statusCode: 409,
          message: 'Conflict',
          code: 'OPTIMISTIC_LOCK_CONFLICT',
        }),
      ),
    ).toBe(true);
  });

  it('returns true for object with 409 status', () => {
    expect(isOptimisticLockConflict({ statusCode: 409 })).toBe(true);
    expect(isOptimisticLockConflict({ status: 409 })).toBe(true);
  });

  it('returns false for other errors', () => {
    expect(
      isOptimisticLockConflict(
        new ApiRequestError({ statusCode: 404, message: 'Not found' }),
      ),
    ).toBe(false);
    expect(isOptimisticLockConflict(new Error('Boom'))).toBe(false);
    expect(isOptimisticLockConflict(null)).toBe(false);
  });
});

describe('getErrorStatusCode', () => {
  it('extracts statusCode from ApiRequestError', () => {
    expect(
      getErrorStatusCode(new ApiRequestError({ statusCode: 429, message: 'Rate limited' })),
    ).toBe(429);
  });

  it('extracts statusCode from AuthRequestError', () => {
    expect(
      getErrorStatusCode(
        new AuthRequestError({ statusCode: 503, message: 'Failed to restore session' }),
      ),
    ).toBe(503);
  });

  it('extracts statusCode from objects with statusCode or status', () => {
    expect(getErrorStatusCode({ statusCode: 404 })).toBe(404);
    expect(getErrorStatusCode({ status: 503 })).toBe(503);
  });

  it('returns null for non-status objects, strings, null, or undefined', () => {
    expect(getErrorStatusCode(new Error('Network error'))).toBeNull();
    expect(getErrorStatusCode('string error')).toBeNull();
    expect(getErrorStatusCode(null)).toBeNull();
    expect(getErrorStatusCode(undefined)).toBeNull();
  });
});

describe('hasHttpStatus', () => {
  it('matches single or multiple status codes', () => {
    const error = new ApiRequestError({ statusCode: 429, message: 'Rate limited' });
    expect(hasHttpStatus(error, 429)).toBe(true);
    expect(hasHttpStatus(error, 401, 403, 429)).toBe(true);
    expect(hasHttpStatus(error, 400, 404)).toBe(false);
  });
});

describe('isStatusInRange', () => {
  it('evaluates status range inclusively', () => {
    const error = { statusCode: 403 };
    expect(isStatusInRange(error, 400, 499)).toBe(true);
    expect(isStatusInRange(error, 403, 403)).toBe(true);
    expect(isStatusInRange(error, 500, 599)).toBe(false);
  });
});

describe('isClientError and isServerError', () => {
  it('correctly identifies 4xx client errors', () => {
    expect(isClientError(new ApiRequestError({ statusCode: 400, message: 'Bad request' }))).toBe(true);
    expect(isClientError(new ApiRequestError({ statusCode: 401, message: 'Unauthorized' }))).toBe(true);
    expect(isClientError(new ApiRequestError({ statusCode: 403, message: 'Forbidden' }))).toBe(true);
    expect(isClientError(new ApiRequestError({ statusCode: 404, message: 'Not found' }))).toBe(true);
    expect(isClientError(new ApiRequestError({ statusCode: 429, message: 'Rate limited' }))).toBe(true);
    expect(isClientError(new ApiRequestError({ statusCode: 500, message: 'Server error' }))).toBe(false);
    expect(isClientError(new ApiRequestError({ statusCode: 200, message: 'OK' }))).toBe(false);
    expect(isClientError({ statusCode: 400 })).toBe(true);
    expect(isClientError({ statusCode: 401 })).toBe(true);
    expect(isClientError({ status: 403 })).toBe(true);
    expect(isClientError({ status: 500 })).toBe(false);
    expect(isClientError(new AuthRequestError({ statusCode: 401, message: 'Unauthorized' }))).toBe(true);
    expect(isClientError(new Error('Network down'))).toBe(false);
    expect(isClientError(null)).toBe(false);
  });

  it('correctly identifies 5xx server errors', () => {
    expect(isServerError(new ApiRequestError({ statusCode: 500, message: 'Internal error' }))).toBe(true);
    expect(isServerError({ status: 503 })).toBe(true);
    expect(isServerError(new AuthRequestError({ statusCode: 503, message: 'Unavailable' }))).toBe(true);
    expect(isServerError({ statusCode: 400 })).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('returns joined errors for validation failure', () => {
    expect(
      getErrorMessage(
        new ApiRequestError({
          statusCode: 400,
          message: 'Validation failed',
          errors: ['First error', 'Second error'],
        }),
        'fallback',
      ),
    ).toBe('First error. Second error');
  });

  it('returns ApiRequestError message', () => {
    expect(
      getErrorMessage(
        new ApiRequestError({
          statusCode: 404,
          message: 'Product not found',
        }),
        'fallback',
      ),
    ).toBe('Product not found');
  });

  it('returns plain Error message', () => {
    expect(getErrorMessage(new Error('network down'), 'fallback')).toBe(
      'network down',
    );
  });

  it('returns fallback for unknown errors', () => {
    expect(getErrorMessage('oops', 'fallback')).toBe('fallback');
  });

  it('returns fallback when ApiRequestError message is whitespace only', () => {
    expect(
      getErrorMessage(
        new ApiRequestError({ statusCode: 500, message: '   ' }),
        'fallback',
      ),
    ).toBe('fallback');
  });
});
