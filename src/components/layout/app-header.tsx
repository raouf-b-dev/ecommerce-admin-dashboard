import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/layout/mobile-nav';

export function AppHeader() {
  return (
    <header className="flex shrink-0 items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <MobileNav />
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Admin shell
          </p>
          <p className="text-lg font-medium">Foundations in place</p>
        </div>
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
  );
}
