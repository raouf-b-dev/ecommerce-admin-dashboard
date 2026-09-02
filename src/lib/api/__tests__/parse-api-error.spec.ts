import { describe, expect, it } from 'vitest';
import {
  ApiRequestError,
  getErrorMessage,
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

describe('getErrorMessage', () => {
  it('joins validation errors for ApiRequestError', () => {
    expect(
      getErrorMessage(
        new ApiRequestError({
          statusCode: 400,
          message: 'Validation failed',
          errors: ['Code must be uppercase', 'Name is required'],
        }),
        'fallback',
      ),
    ).toBe('Code must be uppercase. Name is required');
  });

  it('returns message when no validation errors', () => {
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
