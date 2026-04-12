import type { Metadata } from 'next';
import ProductAdminClient from '@/components/admin/ProductAdminClient';

export const metadata: Metadata = {
  title: '商品管理 - 后台',
};

export default function AdminProductPage() {
  return <ProductAdminClient />;
}
