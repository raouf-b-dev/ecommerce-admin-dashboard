import { Link, useLocation } from 'react-router';
import { cn } from '@/lib/utils';
import { navigation, type NavItem } from '@/app/navigation';
import { filterNavigation } from '@/lib/auth/permissions';
import { useAuth } from '@/lib/auth/auth-context';

type AppSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

function matchesPath(to: string, pathname: string): boolean {
  if (to === '/') {
    return pathname === '/';
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

/**
 * Nav targets can nest (`/products` and `/products/categories`), so only the
 * longest matching target is active.
 */
function findActiveTarget(
  items: readonly NavItem[],
  pathname: string,
): string | undefined {
  let active: string | undefined;
  for (const { to } of items) {
    if (matchesPath(to, pathname) && to.length > (active?.length ?? -1)) {
      active = to;
    }
  }
  return active;
}

export function AppSidebar({ className, onNavigate }: AppSidebarProps) {
  const { session } = useAuth();
  const { pathname } = useLocation();
  const navItems = filterNavigation(
    navigation,
    session?.permissions ?? [],
  );
  const activeTarget = findActiveTarget(navItems, pathname);

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-card/60 px-4 py-6',
        className,
      )}
    >
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Ecommerce Admin
        </p>
        <p className="mt-2 text-2xl font-semibold">Control Center</p>
      </div>

      <nav className="space-y-2" aria-label="Admin">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = to === activeTarget;
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                isActive
                  ? 'bg-accent font-medium text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
