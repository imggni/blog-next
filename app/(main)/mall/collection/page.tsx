import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/mall/product-card";
import { Button } from "@/components/ui/button";
import { mallProducts } from "@/lib/mall-mock";

export const metadata: Metadata = {
  title: "我的收藏",
};

export default function MallCollectionPage() {
  const favoriteProducts = mallProducts.slice(0, 3);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">我的收藏</h1>
          <p className="text-sm text-muted-foreground">展示收藏商品列表（页面骨架）。</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/mall/product">去逛逛</Link>
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {favoriteProducts.map((product) => (
          <ProductCard key={product.id} product={product} href={`/mall/product/${product.id}`} />
        ))}
      </section>
    </div>
  );
}
