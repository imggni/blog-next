"use client";

import { CategoryForm } from '@/components/mall/admin/category-form';
import { useRouter } from 'next/navigation';

export default function NewCategoryPage(){
  const router = useRouter();
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">新建分类</h2>
      <CategoryForm onSaved={()=> router.push('/mall/admin/category')} />
    </div>
  );
}
