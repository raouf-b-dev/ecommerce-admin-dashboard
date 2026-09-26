// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import { Menu } from 'lucide-react';
import { useRef, useState } from 'react';
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
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          ref={triggerRef}
          variant="ghost"
          size="sm"
          type="button"
          className="lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[260px] p-0"
        onCloseAutoFocus={(event) => {
          // Controlled sheets can fail to restore focus to the trigger in
          // real browsers (Playwright). Keep Escape / dismiss a11y-correct.
          event.preventDefault();
          triggerRef.current?.focus();
        }}
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <AppSidebar onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
