"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/mall/admin/product-form';
import { productApi } from '@/lib/api';

export default function EditProductPage({ params }: { params: { id: string } }){
  const [initial, setInitial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(()=>{
    let mounted = true;
    const fetch = async ()=>{
      try{
        const res = await productApi.getDetail(Number(params.id));
        const data = (res as any)?.data ?? res;
        if (mounted) setInitial(data);
      }catch(e){}
      finally{ if (mounted) setLoading(false); }
    };
    fetch();
    return ()=>{ mounted=false };
  }, [params.id]);

  if (loading) return <div>加载中...</div>;
  if (!initial) return <div>商品未找到</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">编辑商品</h2>
      <ProductForm initial={initial} onSaved={()=> router.push('/mall/admin/product')} />
    </div>
  );
}
