import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/lib/auth/auth-context';

export function OperatorDeniedPage() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleSignOut() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-semibold leading-none tracking-tight">
              Access denied
            </h1>
          </CardTitle>
          <CardDescription>
            This account cannot access the admin dashboard. Sign out and use an
            operator account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            type="button"
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
