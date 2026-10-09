import { Link, useNavigate } from 'react-router';
import { ChevronDown, KeyRound, LogOut, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useAuth } from '@/lib/auth/auth-context';

type AdminUserMenuProps = {
  defaultOpen?: boolean;
};

export function AdminUserMenu({ defaultOpen }: AdminUserMenuProps = {}) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  if (!session) {
    return null;
  }

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  // Derive display initials (e.g., "SA" for superadmin@store.local or "AD" for admin)
  const initial = session.email
    ? session.email.slice(0, 2).toUpperCase()
    : 'OP';

  const roleLabel = session.role ? session.role.replace(/_/g, ' ') : 'OPERATOR';

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex cursor-pointer items-center gap-2.5 rounded-full border border-border/80 bg-background/80 py-1 pl-1 pr-3 shadow-xs transition-all hover:border-border hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Operator account menu for ${session.email}`}
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-xs">
            {initial}
          </span>
          <div className="hidden flex-col items-start text-left sm:flex">
            <span className="max-w-[140px] truncate text-xs font-medium text-foreground">
              {session.email}
            </span>
          </div>
          <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-primary uppercase md:inline-flex">
            {roleLabel}
          </span>
          <ChevronDown
            className="size-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 rounded-xl border border-border/80 bg-popover/95 p-2 shadow-xl backdrop-blur-md"
      >
        <DropdownMenuLabel className="px-2 py-2">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-xs">
              {initial}
            </div>
            <div className="flex min-w-0 flex-col">
              <span
                className="truncate text-xs font-semibold text-foreground"
                title={session.email}
              >
                {session.email}
              </span>
              <span className="mt-0.5 inline-flex w-fit items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                {roleLabel}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1.5" />

        <DropdownMenuItem asChild>
          <Link
            to="/roles"
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent"
          >
            <Shield className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="font-medium">Roles & Permissions</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            to="/change-password"
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent"
          >
            <KeyRound className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="font-medium">Change Password</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1.5" />

        <div className="px-2 py-2">
          <span className="mb-2 block text-[11px] font-medium text-muted-foreground">
            Appearance
          </span>
          <ThemeToggle className="w-full" />
        </div>

        <DropdownMenuSeparator className="my-1.5" />

        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            void handleLogout();
          }}
          className="cursor-pointer gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors"
        >
          <LogOut className="size-4" aria-hidden="true" />
          <span className="font-medium">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
