"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryForm } from '@/components/mall/admin/category-form';
import { categoryApi } from '@/lib/api';

type CategoryItem = Awaited<ReturnType<typeof categoryApi.getList>>['data'][number];

export default function EditCategoryPage({ params }: { params: { id: string } }){
  const [initial, setInitial] = useState<CategoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(()=>{
    let mounted = true;
    const fetch = async ()=>{
      try{
        const res = await categoryApi.getList();
        const found = res.data.find((category) => String(category.id) === String(params.id)) ?? null;
        if (mounted) setInitial(found);
      }catch{}
      finally{ if (mounted) setLoading(false); }
    };
    fetch();
    return ()=>{ mounted=false };
  }, [params.id]);

  if (loading) return <div>加载中...</div>;
  if (!initial) return <div>分类未找到</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">编辑分类</h2>
      <CategoryForm initial={initial} onSaved={()=> router.push('/mall/admin/category')} />
    </div>
  );
}
