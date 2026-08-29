import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { ProductForm } from '@/features/products/components/product-form';
import { useCreateProduct } from '@/features/products/hooks/use-products';
import {
  toCreateProductDto,
  type ProductSubmitValues,
} from '@/features/products/schemas/product-schema';

export function ProductCreatePage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();

  async function handleSubmit(values: ProductSubmitValues) {
    await createProduct.mutateAsync(toCreateProductDto(values));
    navigate('/products');
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="New product"
        description="Create a catalog product. Price is in major currency units (for example 49.99)."
      />
      <ProductForm
        mode="create"
        submitLabel="Create product"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/products')}
      />
    </div>
  );
}
