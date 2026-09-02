import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type ActionErrorAlertProps = {
  message?: string | null;
  title?: string;
};

export function ActionErrorAlert({
  message,
  title = 'Action failed',
}: ActionErrorAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <Alert variant="destructive" aria-live="polite">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
