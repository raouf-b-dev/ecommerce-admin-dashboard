import { describe, expect, it } from 'vitest';
import {
  AuthRequestError,
  parseAuthErrorBody,
} from '@/features/auth/api/parse-auth-error';

describe('parseAuthErrorBody', () => {
  it('parses GlobalExceptionFilter shape', () => {
    expect(
      parseAuthErrorBody({
        success: false,
        statusCode: 401,
        message: 'Current password is incorrect',
        code: 'USE_CASE_ERROR',
      }),
    ).toEqual({
      statusCode: 401,
      message: 'Current password is incorrect',
      code: 'USE_CASE_ERROR',
    });
  });

  it('returns null for non-object bodies', () => {
    expect(parseAuthErrorBody(null)).toBeNull();
    expect(parseAuthErrorBody('error')).toBeNull();
  });

  it('wraps parsed errors in AuthRequestError', () => {
    const error = new AuthRequestError({
      statusCode: 400,
      message: 'New password must differ from current password',
    });

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('New password must differ from current password');
  });
});
