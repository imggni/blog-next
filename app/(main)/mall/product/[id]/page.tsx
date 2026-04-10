import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/mall/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { findMallProductById, mallProducts } from "@/lib/mall-mock";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = findMallProductById(id);

  if (!product) {
    return { title: "商品不存在" };
  }

  return {
    title: product.title,
    description: "查看商品价格、库存、规格与下单入口（页面骨架）。",
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = findMallProductById(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = mallProducts.filter((item) => item.id !== product.id).slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="overflow-hidden">
          <div className="relative aspect-[4/3] w-full bg-muted">
            <Image src={product.mainImage} alt={product.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
          <CardContent className="space-y-4 pt-5">
            <div className="flex flex-wrap items-center gap-2">
              {product.tags.length ? (
                product.tags.map((tag) => (
                  <Badge key={tag} variant={tag === "下架" ? "destructive" : "secondary"}>
                    {tag}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline">常规</Badge>
              )}
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight">{product.title}</h1>
              <p className="text-sm text-muted-foreground">库存、规格、详情图等信息可在接口接入后补齐。</p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="text-2xl font-semibold text-primary">¥{product.price}</div>
              {typeof product.originalPrice === "number" && product.originalPrice > product.price ? (
                <div className="text-sm text-muted-foreground line-through">¥{product.originalPrice}</div>
              ) : null}
              <div className="text-sm text-muted-foreground">销量 {product.sales}</div>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/mall/order">立即下单</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/mall/collection">加入收藏</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/mall/product">返回列表</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>下单信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
              <div className="font-medium text-foreground">规格</div>
              <div className="mt-1">示例：黑色 / 青轴 / 1TB 等（接入商品详情接口后按数据渲染）</div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
              <div className="font-medium text-foreground">收货地址</div>
              <div className="mt-1">在地址管理页维护默认地址后，这里可展示选中地址信息。</div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
              <div className="font-medium text-foreground">支付方式</div>
              <div className="mt-1">示例：微信 / 支付宝 / 余额（接入创建订单接口后落地交互）。</div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" asChild>
              <Link href="/mall/address">去维护地址</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">相关推荐</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/mall/product">查看更多</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} href={`/mall/product/${item.id}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
