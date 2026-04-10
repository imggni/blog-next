import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";

import { CategoryChip } from "@/components/mall/category-chip";
import { ProductCard } from "@/components/mall/product-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mallCategories, mallProducts } from "@/lib/mall-mock";

export const metadata: Metadata = {
  title: "商城",
  description: "数字配件商城：分类、商品、订单与个人中心。",
};

type HealthResponse = {
  code: number;
  message: string;
  data: { status: "ok" | "error" };
};

async function fetchHealth() {
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const url = host ? `${protocol}://${host}/api/health` : "http://localhost:3000/api/health";

  try {
    const response = await fetch(url, { cache: "no-store" });
    const payload = (await response.json()) as HealthResponse;
    const isOk = response.ok && payload.code === 200 && payload.data.status === "ok";

    return { isOk, message: payload.message };
  } catch {
    return { isOk: false, message: "健康检查请求失败" };
  }
}

export default async function MallHomePage() {
  const health = await fetchHealth();

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-border/70 bg-card px-6 py-10">
        <h1 className="text-4xl font-semibold tracking-tight">数字配件商城</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          这里是基于需求文档搭建的商城页面骨架，包含分类、商品、订单、地址、收藏与后台管理的入口。
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href="/mall/product">浏览商品</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/mall/admin/product">进入后台</Link>
          </Button>
        </div>
      </section>

      <Alert variant={health.isOk ? "default" : "destructive"}>
        <AlertTitle>服务健康检查</AlertTitle>
        <AlertDescription>
          {health.isOk ? `服务可用：${health.message}` : `服务异常：${health.message}`}
        </AlertDescription>
      </Alert>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">分类</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/mall/product">查看全部</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {mallCategories
            .slice()
            .sort((a, b) => a.sort - b.sort)
            .map((category) => (
              <CategoryChip key={category.id} category={category} href={`/mall/product?categoryId=${category.id}`} />
            ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>爆款推荐</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {mallProducts
              .filter((product) => product.tags.includes("爆款"))
              .slice(0, 2)
              .map((product) => (
                <ProductCard key={product.id} product={product} href={`/mall/product/${product.id}`} />
              ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>新品上架</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {mallProducts
              .filter((product) => product.tags.includes("新品"))
              .slice(0, 2)
              .map((product) => (
                <ProductCard key={product.id} product={product} href={`/mall/product/${product.id}`} />
              ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
