import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { NotOperatorError } from '@/features/auth/api/auth-api';
import { safeRedirectPath } from '@/features/auth/lib/safe-redirect-path';
import { DEMO_ADMIN_EMAIL } from '@/lib/mock/constants';
import { useAuth } from '@/lib/auth/auth-context';

/** Mock-mode-only chrome: banner + 1-click demo login. Kept out of LoginForm. */
export function MockDemoLoginActions() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDemoLogin() {
    setBusy(true);
    setError(null);

    try {
      const session = await login({
        email: DEMO_ADMIN_EMAIL,
        password: 'demo',
      });
      const destination = session.mustChangePassword
        ? '/change-password'
        : safeRedirectPath(searchParams.get('redirect'));
      navigate(destination, { replace: true });
    } catch (err) {
      if (err instanceof NotOperatorError) {
        setError('This account cannot access the admin dashboard.');
        return;
      }
      setError('Demo login failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
        Mock mode — no API required.
      </p>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        className="w-full"
        type="button"
        variant="secondary"
        disabled={busy}
        onClick={() => {
          void onDemoLogin();
        }}
      >
        {busy ? 'Signing in…' : 'Demo 1-Click Login'}
      </Button>
    </div>
  );
}
