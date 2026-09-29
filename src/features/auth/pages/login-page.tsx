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

// Inline env checks let production Rollup omit mock-only chunks.
const isMockBuild =
  import.meta.env.MODE === 'mock' ||
  import.meta.env.VITE_ENABLE_MOCK === 'true';

const DemoLoginActions = isMockBuild
  ? lazy(() => import('@/lib/mock/ui/demo-login-actions'))
  : null;
const DemoDataBanner = isMockBuild
  ? lazy(() => import('@/lib/mock/ui/demo-data-banner'))
  : null;

function LoginPage() {
  const mockMode = isMockMode();

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle as="h1">Sign in</CardTitle>
          <CardDescription>
            Use your operator account to access the admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockMode && DemoDataBanner ? (
            <Suspense fallback={null}>
              <DemoDataBanner />
            </Suspense>
          ) : null}
          <LoginForm />
          {mockMode && DemoLoginActions ? (
            <Suspense fallback={null}>
              <DemoLoginActions />
            </Suspense>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
