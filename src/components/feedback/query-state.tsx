import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';
import { getErrorMessage } from '@/lib/api/parse-api-error';

type QueryStateAlertProps = {
  isError: boolean;
  hasData: boolean;
  error: unknown;
  onRetry: () => void;
  resource: string;
};

export function QueryStateAlert({
  isError,
  hasData,
  error,
  onRetry,
  resource,
}: QueryStateAlertProps) {
  if (!isError) {
    return null;
  }

  const message = getErrorMessage(
    error,
    hasData ? 'Showing the last loaded results.' : 'Unexpected error',
  );

  return (
    <Alert
      variant={hasData ? 'default' : 'destructive'}
      aria-live="polite"
    >
      <AlertTitle>
        {hasData ? `Could not refresh ${resource}` : `Could not load ${resource}`}
      </AlertTitle>
      <AlertDescription className="flex flex-wrap items-center gap-3">
        <span>{message}</span>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export function QueryLoading({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      {children}
    </p>
  );
}

type QueryListRegionProps = {
  isLoading: boolean;
  isFetching: boolean;
  loadingLabel: string;
  hasData: boolean;
  children: ReactNode;
};

export function QueryListRegion({
  isLoading,
  isFetching,
  loadingLabel,
  hasData,
  children,
}: QueryListRegionProps) {
  if (isLoading) {
    return <QueryLoading>{loadingLabel}</QueryLoading>;
  }

  if (!hasData) {
    return null;
  }

  return (
    <div
      aria-busy={isFetching || undefined}
      className={isFetching ? 'opacity-70 transition-opacity' : undefined}
    >
      {children}
    </div>
  );
}
