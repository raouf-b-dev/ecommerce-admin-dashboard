import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AppSidebar } from '@/components/layout/app-sidebar';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <AppSidebar onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
