import { Link, Outlet } from 'react-router';
import { LayoutDashboard, Package, ShoppingCart, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
];

export function App() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
      <aside className="border-r bg-card/60 px-4 py-6">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Ecommerce Admin
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Control Center</h1>
        </div>

        <nav className="space-y-2">
          {navigation.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Admin shell
            </p>
            <p className="text-lg font-medium">Foundations in place</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" type="button" aria-label="Light theme">
              <Sun className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" type="button" aria-label="Dark theme">
              <Moon className="h-4 w-4" />
            </Button>
            <Button size="sm" type="button">
              Login stub
            </Button>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
