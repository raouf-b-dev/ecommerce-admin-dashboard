import { PageHeader } from '@/components/layout/page-header';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-8">
      <div className="w-full max-w-md">
        <PageHeader
          title="Login"
          description="Authentication UI is intentionally deferred. This placeholder keeps the route shell in place for the next phase."
        />
      </div>
    </div>
  );
}
