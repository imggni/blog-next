"use client";

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { CategoryIcon } from "@/components/mall/category-icon";

export function CategoryList() {
  const { categories, loading } = useCategories();

  if (loading) return <div className="py-6 text-center">加载中...</div>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((cat) => (
        <Card key={cat.id} className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex min-h-[140px] flex-col justify-between gap-4">
            <div className="min-w-0">
              <p className="text-lg font-semibold">{cat.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">精选好物，极速配货</p>
            </div>
            <div className="flex items-center justify-between">
              <CategoryIcon icon={cat.icon} name={cat.name} size={80} />
              <Button size="sm" asChild>
                <Link href={`/mall/product?categoryId=${cat.id}`}>查看</Link>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
