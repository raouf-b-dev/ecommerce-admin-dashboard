import { describe, expect, it, vi } from 'vitest';
import { ApiRequestError } from '@/lib/api/parse-api-error';
import { applyApiFormErrors } from '@/lib/api/form-api-errors';

type TestField = 'name' | 'email';

describe('applyApiFormErrors', () => {
  it('returns early on optimistic lock conflict', () => {
    const setFormError = vi.fn();
    const setFieldError = vi.fn();

    applyApiFormErrors({
      error: new ApiRequestError({
        statusCode: 409,
        message: 'Conflict',
        code: 'OPTIMISTIC_LOCK_CONFLICT',
      }),
      setFormError,
      setFieldError,
    });

    expect(setFormError).not.toHaveBeenCalled();
    expect(setFieldError).not.toHaveBeenCalled();
  });

  it('sets generic fallback for unknown errors', () => {
    const setFormError = vi.fn();
    const setFieldError = vi.fn();

    applyApiFormErrors({
      error: new Error('boom'),
      setFormError,
      setFieldError,
    });

    expect(setFormError).toHaveBeenCalledWith(
      'Something went wrong. Please try again.',
    );
    expect(setFieldError).not.toHaveBeenCalled();
  });

  it('maps all validation lines to fields when matcher provided', () => {
    const setFormError = vi.fn();
    const setFieldError = vi.fn();

    applyApiFormErrors<TestField>({
      error: new ApiRequestError({
        statusCode: 400,
        message: 'Validation failed',
        errors: ['name is required', 'email is invalid'],
      }),
      setFormError,
      setFieldError,
      matchField: (line) => (line.includes('name') ? 'name' : 'email'),
    });

    expect(setFieldError).toHaveBeenCalledWith('name', 'name is required');
    expect(setFieldError).toHaveBeenCalledWith('email', 'email is invalid');
    expect(setFormError).not.toHaveBeenCalled();
  });

  it('sets unmapped validation lines on form error', () => {
    const setFormError = vi.fn();
    const setFieldError = vi.fn();

    applyApiFormErrors<TestField>({
      error: new ApiRequestError({
        statusCode: 400,
        message: 'Validation failed',
        errors: ['name is required', 'unknown constraint failed'],
      }),
      setFormError,
      setFieldError,
      matchField: (line) => (line.includes('name') ? 'name' : null),
    });

    expect(setFieldError).toHaveBeenCalledWith('name', 'name is required');
    expect(setFormError).toHaveBeenCalledWith('unknown constraint failed');
  });

  it('puts all validation lines on form error when no matcher', () => {
    const setFormError = vi.fn();
    const setFieldError = vi.fn();

    applyApiFormErrors<TestField>({
      error: new ApiRequestError({
        statusCode: 400,
        message: 'Validation failed',
        errors: ['a', 'b'],
      }),
      setFormError,
      setFieldError,
    });

    expect(setFormError).toHaveBeenCalledWith('a. b');
    expect(setFieldError).not.toHaveBeenCalled();
  });

  it('sets message for ApiRequestError without validation array', () => {
    const setFormError = vi.fn();
    const setFieldError = vi.fn();

    applyApiFormErrors({
      error: new ApiRequestError({
        statusCode: 403,
        message: 'Forbidden',
      }),
      setFormError,
      setFieldError,
    });

    expect(setFormError).toHaveBeenCalledWith('Forbidden');
    expect(setFieldError).not.toHaveBeenCalled();
  });
});
