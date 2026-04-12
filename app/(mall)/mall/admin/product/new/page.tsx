import { ProductForm } from '@/components/mall/admin/product-form';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">新增商品</h2>
      <ProductForm />
    </div>
  );
}
