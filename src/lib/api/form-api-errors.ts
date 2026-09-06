import {
  ApiRequestError,
  getErrorMessage,
  isOptimisticLockConflict,
} from '@/lib/api/parse-api-error';

const DEFAULT_GENERIC_FALLBACK = 'Something went wrong. Please try again.';

export type ApplyApiFormErrorsOptions<TField extends string> = {
  error: unknown;
  setFormError: (message: string) => void;
  setFieldError: (field: TField, message: string) => void;
  matchField?: (validationLine: string) => TField | null;
  genericFallback?: string;
};

export function applyApiFormErrors<TField extends string>({
  error,
  setFormError,
  setFieldError,
  matchField,
  genericFallback = DEFAULT_GENERIC_FALLBACK,
}: ApplyApiFormErrorsOptions<TField>): void {
  if (isOptimisticLockConflict(error)) {
    return;
  }

  if (!(error instanceof ApiRequestError)) {
    setFormError(genericFallback);
    return;
  }

  if (error.errors && error.errors.length > 0) {
    const unmapped: string[] = [];

    for (const line of error.errors) {
      const field = matchField?.(line) ?? null;
      if (field) {
        setFieldError(field, line);
      } else {
        unmapped.push(line);
      }
    }

    if (unmapped.length > 0) {
      setFormError(unmapped.join('. '));
    }

    return;
  }

  setFormError(getErrorMessage(error, genericFallback));
}
