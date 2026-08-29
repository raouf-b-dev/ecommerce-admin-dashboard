import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';

export function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Access denied"
        description="You do not have permission to view this page. Contact an administrator if you believe this is an error."
      />
      <Button asChild variant="outline">
        <Link to="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
