import type { Metadata } from "next";
import Link from "next/link";

import { CategoryChip } from "@/components/mall/category-chip";
import { ProductCard } from "@/components/mall/product-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { mallCategories, mallProducts } from "@/lib/mall-mock";

export const metadata: Metadata = {
  title: "商品列表",
};

type ProductListPageProps = {
  searchParams?: Promise<{
    categoryId?: string;
    keyword?: string;
    isHot?: string;
    isNew?: string;
  }>;
};

export default async function ProductListPage({ searchParams }: ProductListPageProps) {
  const params = (await searchParams) ?? {};

  const filteredProducts = mallProducts.filter((product) => {
    if (params.categoryId && product.categoryId !== params.categoryId) return false;
    if (params.isHot === "1" && !product.tags.includes("爆款")) return false;
    if (params.isNew === "1" && !product.tags.includes("新品")) return false;
    if (params.keyword && !product.title.includes(params.keyword)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">商品列表</h1>
        <p className="text-sm text-muted-foreground">支持分类筛选、关键词搜索、爆款/新品筛选（页面骨架）。</p>
      </header>

      <Card className="space-y-4 rounded-2xl border border-border/70 bg-card p-5">
        <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input name="keyword" placeholder="搜索商品标题…" defaultValue={params.keyword ?? ""} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" size="sm">
              搜索
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/mall/product">重置</Link>
            </Button>
          </div>
        </form>

        <Separator />

        <div className="flex flex-wrap gap-2">
          {mallCategories
            .slice()
            .sort((a, b) => a.sort - b.sort)
            .map((category) => (
              <CategoryChip
                key={category.id}
                category={category}
                href={`/mall/product?categoryId=${category.id}${params.keyword ? `&keyword=${encodeURIComponent(params.keyword)}` : ""}`}
              />
            ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant={params.isHot === "1" ? "default" : "outline"} size="sm" asChild>
            <Link
              href={`/mall/product?isHot=1${params.categoryId ? `&categoryId=${params.categoryId}` : ""}${
                params.keyword ? `&keyword=${encodeURIComponent(params.keyword)}` : ""
              }`}
            >
              爆款
            </Link>
          </Button>
          <Button variant={params.isNew === "1" ? "default" : "outline"} size="sm" asChild>
            <Link
              href={`/mall/product?isNew=1${params.categoryId ? `&categoryId=${params.categoryId}` : ""}${
                params.keyword ? `&keyword=${encodeURIComponent(params.keyword)}` : ""
              }`}
            >
              新品
            </Link>
          </Button>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} href={`/mall/product/${product.id}`} />
        ))}
      </section>

      {filteredProducts.length === 0 ? (
        <p className="text-sm text-muted-foreground">没有找到匹配的商品。</p>
      ) : null}
    </div>
  );
}
