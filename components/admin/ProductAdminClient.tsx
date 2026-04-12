"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { productApi, ApiError } from '@/lib/api';

interface Product {
  id: string;
  title: string;
  category?: { name: string } | string;
  categoryId?: string;
}

export default function ProductAdminClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await productApi.getList({ all: true });
        const data = (res as any)?.data ?? res;
        if (Array.isArray(data)) {
          if (mounted) setProducts(data);
        } else if (Array.isArray((data as any)?.data)) {
          if (mounted) setProducts((data as any).data);
        } else {
          if (mounted) setProducts([]);
        }
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('获取商品失败');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">商品管理</h2>
        <Button asChild>
          <Link href="/mall/admin/product/new">新增商品</Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>商品列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div>加载中...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && products.length === 0 && <div>暂无商品</div>}

          <div className="mt-4 grid gap-3">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm text-muted-foreground">类别: {p.categoryId || (typeof p.category === 'string' ? p.category : p.category?.name)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm">编辑</Button>
                  <Button variant="destructive" size="sm">删除</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}