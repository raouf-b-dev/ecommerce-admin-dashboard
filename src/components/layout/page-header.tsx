import type { ReactNode } from 'react';
import {
  PageBreadcrumbs,
  type PageBreadcrumbItem,
} from '@/components/layout/page-breadcrumbs';
import { useDocumentTitle } from '@/lib/use-document-title';

type PageHeaderProps = {
  title: string;
  description: string;
  breadcrumbs?: readonly PageBreadcrumbItem[];
  children?: ReactNode;
};

export function PageHeader({
  title,
  description,
  breadcrumbs,
  children,
}: PageHeaderProps) {
  useDocumentTitle(title);

  return (
    <section className="space-y-3">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <PageBreadcrumbs items={breadcrumbs} />
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        {children ? (
          <div className="flex shrink-0 items-center gap-2">{children}</div>
        ) : null}
      </div>
    </section>
  );
}
