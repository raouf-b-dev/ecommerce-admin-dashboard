import { lazy, Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from '@/features/auth/components/login-form';
import { isDemoMode } from '@/lib/demo/is-demo-mode';
import { isMockMode } from '@/lib/mock/is-mock-mode';

// Inline env checks let production Rollup omit mode-only chunks.
const isMockBuild =
  import.meta.env.MODE === 'mock' ||
  import.meta.env.VITE_ENABLE_MOCK === 'true';

const DemoLoginActions = isMockBuild
  ? lazy(() => import('@/lib/mock/ui/demo-login-actions'))
  : null;
const DemoDataBanner = isMockBuild
  ? lazy(() => import('@/lib/mock/ui/demo-data-banner'))
  : null;
const HostedDemoBanner =
  import.meta.env.VITE_DEMO_MODE === 'true'
    ? lazy(() => import('@/lib/demo/hosted-demo-banner'))
    : null;

function LoginPage() {
  const mockMode = isMockMode();
  const demoMode = isDemoMode();

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Ecommerce Admin
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Control Center</p>
          </div>
          <div className="space-y-1.5">
            <CardTitle as="h1">Sign in</CardTitle>
            <CardDescription>
              Use your operator account to access the admin dashboard.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockMode && DemoDataBanner ? (
            <Suspense fallback={null}>
              <DemoDataBanner />
            </Suspense>
          ) : null}
          {!mockMode && demoMode && HostedDemoBanner ? (
            <Suspense fallback={null}>
              <HostedDemoBanner />
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
