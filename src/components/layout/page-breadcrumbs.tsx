import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';

export type PageBreadcrumbItem = {
  label: string;
  to?: string;
};

type PageBreadcrumbsProps = {
  items: readonly PageBreadcrumbItem[];
  className?: string;
};

export function PageBreadcrumbs({ items, className }: PageBreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn(className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : null}
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="font-medium transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(isLast && 'text-foreground')}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
