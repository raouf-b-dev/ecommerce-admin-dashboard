import { describe, expect, it } from 'vitest';
import {
  ApiRequestError,
  isOptimisticLockConflict,
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

  it('returns false for other errors', () => {
    expect(isOptimisticLockConflict(new Error('fail'))).toBe(false);
  });
});
