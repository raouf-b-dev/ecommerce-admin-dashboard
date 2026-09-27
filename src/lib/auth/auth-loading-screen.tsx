import { QueryStateAlert } from '@/components/feedback/query-state';

export function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground" role="status">
        Loading session…
      </p>
    </div>
  );
}

type AuthSessionErrorScreenProps = {
  error: unknown;
  onRetry: () => void;
};

export function AuthSessionErrorScreen({
  error,
  onRetry,
}: AuthSessionErrorScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <QueryStateAlert
        isError
        hasData={false}
        error={error}
        onRetry={onRetry}
        resource="session"
      />
    </div>
  );
}
