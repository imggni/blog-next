'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { collectionApi, ApiError } from '@/lib/api';
import { CollectionItem } from '@/types/api';
import { toast } from 'sonner';

export default function CollectionManagementPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCollections = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await collectionApi.getList();
      setCollections(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('获取收藏列表失败');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleRemove = async (productId: number) => {
    try {
      await collectionApi.remove(productId);
      toast.success('已取消收藏');
      fetchCollections();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '取消收藏失败';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">我的收藏</h1>
          <p className="text-sm text-muted-foreground">查看和管理您收藏的商品，快速进入购物或取消收藏。</p>
        </div>
        {/* <Button variant="outline" size="sm" asChild>
          <Link href="/mall/profile">返回个人中心</Link>
        </Button> */}
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="rounded-3xl border border-border/70 bg-card">
        <CardHeader>
          <CardTitle>收藏列表</CardTitle>
          <CardDescription>所有已收藏的商品都会显示在这里。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-dashed border-border/50 bg-slate-950/70 p-6 text-center text-sm text-muted-foreground">
              加载中...
            </div>
          ) : collections.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/50 bg-slate-950/70 p-6 text-center text-sm text-muted-foreground">
              还没有收藏的商品，去商品页挑选喜欢的内容吧。
            </div>
          ) : (
            <div className="grid gap-4">
              {collections.map((item) => (
                <Card key={item.id} className="rounded-3xl border border-border/70 bg-background/80">
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl bg-muted">
                          {item.product.mainImage ? (
                            <Image
                              src={item.product.mainImage}
                              alt={item.product.title}
                              fill
                              sizes="112px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0 space-y-3">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-lg font-semibold">{item.product.title}</h3>
                            {item.product.isHot && <Badge>热销</Badge>}
                            {item.product.isNew && <Badge variant="secondary">新品</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.product.category?.name ?? '分类信息不可用'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            收藏时间：{new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-right">
                        <p className="text-xl font-semibold">¥{item.product.price}</p>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/mall/product/${item.product.id}`}>查看商品</Link>
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex flex-wrap flex-end justify-end items-center gap-2">
                      <Button variant="destructive" size="sm" onClick={() => handleRemove(item.productId)}>
                        取消收藏
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
