import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { router } from '@/app/router';
import { AuthProvider } from '@/lib/auth/auth-context';
import { ApiRequestError } from '@/lib/api/parse-api-error';
import '@/index.css';

async function enableMocking(): Promise<void> {
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
      retry: (failureCount, error) => {
        if (error instanceof ApiRequestError && error.statusCode === 429) {
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
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  );
});
