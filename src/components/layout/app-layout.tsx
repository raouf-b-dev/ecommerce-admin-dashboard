import { Outlet } from 'react-router';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';

export function AppLayout() {
  return (
    <div className="grid h-screen overflow-hidden lg:grid-cols-[260px_1fr]">
      <AppSidebar className="hidden lg:flex" />
      <div className="flex min-h-0 flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
