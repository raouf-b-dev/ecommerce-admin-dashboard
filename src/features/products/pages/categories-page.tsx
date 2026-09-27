import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { CategoriesTable } from '@/features/products/components/categories-table';

function CategoriesPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
      </div>
      <PageHeader
        title="Categories"
        description="Manage catalog categories used to classify products. Deleting a category unassigns its products."
      />
      <CategoriesTable />
    </div>
  );
}

export { CategoriesPage };
export default CategoriesPage;
