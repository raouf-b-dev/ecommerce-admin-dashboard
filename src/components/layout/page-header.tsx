import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold">{title}</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        {children ? <div className="flex shrink-0 items-center gap-2">{children}</div> : null}
      </div>
    </section>
  );
}
