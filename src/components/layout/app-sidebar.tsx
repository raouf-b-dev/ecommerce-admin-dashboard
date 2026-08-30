import { NavLink } from 'react-router';
import { cn } from '@/lib/utils';
import { navigation } from '@/app/navigation';
import { filterNavigation } from '@/lib/auth/permissions';
import { useAuth } from '@/lib/auth/auth-context';

type AppSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export function AppSidebar({ className, onNavigate }: AppSidebarProps) {
  const { session } = useAuth();
  const navItems = filterNavigation(
    navigation,
    session?.permissions ?? [],
  );

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
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                isActive
                  ? 'bg-accent font-medium text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
