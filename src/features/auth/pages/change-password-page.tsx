import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChangePasswordForm } from '@/features/auth/components/change-password-form';
import { useAuth } from '@/lib/auth/auth-context';

export function ChangePasswordPage() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleSignOut() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-semibold leading-none tracking-tight">
              Change your password
            </h1>
          </CardTitle>
          <CardDescription>
            Your account requires a new password before you can use the admin
            dashboard. Sign out if this is the wrong account or you do not
            know the current password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {session?.email ? (
            <p className="text-sm text-muted-foreground">
              Signed in as {session.email}
            </p>
          ) : null}
          <ChangePasswordForm />
          <Button
            className="w-full"
            type="button"
            variant="outline"
            disabled={isLoggingOut}
            onClick={() => {
              void handleSignOut();
            }}
          >
            {isLoggingOut ? 'Signing out…' : 'Sign out'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
