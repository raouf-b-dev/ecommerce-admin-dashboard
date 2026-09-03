import { lazy, Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from '@/features/auth/components/login-form';
import { isMockMode } from '@/lib/mock/is-mock-mode';

const DemoLoginActions = lazy(() =>
  import('@/lib/mock/ui/demo-login-actions').then((module) => ({
    default: module.DemoLoginActions,
  })),
);

export function LoginPage() {
  const mockMode = isMockMode();

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-semibold leading-none tracking-tight">
              Sign in
            </h1>
          </CardTitle>
          <CardDescription>
            Use your operator account to access the admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />
          {mockMode ? (
            <Suspense fallback={null}>
              <DemoLoginActions />
            </Suspense>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
