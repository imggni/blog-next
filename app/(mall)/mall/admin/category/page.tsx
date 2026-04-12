import type { Metadata } from 'next';
import CategoryAdminClient from '@/components/admin/CategoryAdminClient';

export const metadata: Metadata = {
  title: '分类管理 - 后台',
};

export default function AdminCategoryPage() {
  return <CategoryAdminClient />;
}
