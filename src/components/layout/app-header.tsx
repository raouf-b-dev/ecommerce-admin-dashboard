import { MobileNav } from '@/components/layout/mobile-nav';
import { AdminUserMenu } from '@/components/layout/admin-user-menu';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useAuth } from '@/lib/auth/auth-context';

export function AppHeader() {
  const { session } = useAuth();

  return (
    <header className="flex shrink-0 items-center justify-between border-b bg-background/95 px-6 py-3.5 backdrop-blur">
      <div className="flex items-center gap-3">
        <MobileNav />
      </div>

      <div className="flex items-center gap-3">
        {session ? <AdminUserMenu /> : <ThemeToggle />}
      </div>
    </header>
  );
}
