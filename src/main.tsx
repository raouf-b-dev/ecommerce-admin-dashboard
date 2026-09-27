import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { router } from '@/app/router';
import { AuthProvider } from '@/lib/auth/auth-context';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ThemeAwareToaster } from '@/components/theme/theme-aware-toaster';
import { WebSocketProvider } from '@/lib/ws/websocket-provider';
import { hasHttpStatus } from '@/lib/api/parse-api-error';
import '@/index.css';

async function enableMocking(): Promise<void> {
  // Inline env checks so production Rollup can drop the MSW dynamic import.
  if (
    import.meta.env.MODE !== 'mock' &&
    import.meta.env.VITE_ENABLE_MOCK !== 'true'
  ) {
    return;
  }
  const { worker } = await import('@/lib/mock/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Domain queries: only skip retry on 429 (rate limit); other 4xx may still retry once.
      retry: (failureCount, error) => {
        if (hasHttpStatus(error, 429)) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

void enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            <WebSocketProvider>
              <RouterProvider router={router} />
              <ThemeAwareToaster />
            </WebSocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  );
});
