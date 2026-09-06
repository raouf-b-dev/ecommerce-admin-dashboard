import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { FocusOnRouteChange } from '@/components/layout/focus-on-route-change';
import { RouteErrorBoundary } from '@/components/layout/route-error-boundary';

export function AppLayout() {
  return (
    <div className="grid h-screen overflow-hidden lg:grid-cols-[260px_1fr]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <FocusOnRouteChange targetId="main" />
      <AppSidebar className="hidden lg:flex" />
      <div className="flex min-h-0 flex-col">
        <AppHeader />
        <main
          id="main"
          tabIndex={-1}
          className="flex-1 overflow-y-auto px-6 py-8 outline-none"
        >
          <RouteErrorBoundary>
            <Suspense
              fallback={
                <p
                  className="text-sm text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  Loading…
                </p>
              }
            >
              <Outlet />
            </Suspense>
          </RouteErrorBoundary>
        </main>
      </div>
    </div>
  );
}
