import type { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/api/parse-api-error';

type DashboardWidgetFrameProps = {
  title: string;
  action?: ReactNode;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
  children: ReactNode;
};

export function DashboardWidgetFrame({
  title,
  action,
  isLoading,
  isError,
  error,
  onRetry,
  children,
}: DashboardWidgetFrameProps) {
  return (
    <section className="space-y-3" aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium">{title}</h2>
        {action}
      </div>

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load {title.toLowerCase()}</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>{getErrorMessage(error, 'Request failed')}</span>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          Loading…
        </p>
      ) : (
        children
      )}
    </section>
  );
}
