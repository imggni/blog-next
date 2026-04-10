import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mallCategories, mallProducts } from "@/lib/mall-mock";

export const metadata: Metadata = {
  title: "商品管理",
};

export default function MallAdminProductPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">商品管理</h1>
          <p className="text-sm text-muted-foreground">管理员创建/编辑/删除商品（页面骨架）。</p>
        </div>
        <Button>新增商品</Button>
      </header>

      <Card className="rounded-2xl border border-border/70 bg-card p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">标题</Label>
            <Input id="title" placeholder="如：无线降噪耳机 Pro" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId">分类 ID</Label>
            <Input id="categoryId" placeholder="如：c-1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">价格</Label>
            <Input id="price" placeholder="如：399" inputMode="decimal" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mainImage">主图 URL</Label>
            <Input id="mainImage" placeholder="/images/..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">标签</Label>
            <Input id="tags" placeholder="爆款, 新品" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm">保存</Button>
          <Button variant="outline" size="sm">
            重置
          </Button>
        </div>
      </Card>

      <section className="grid gap-4">
        {mallProducts.map((product) => (
          <Card key={product.id} className="rounded-2xl border border-border/70 bg-card">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg">{product.title}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  分类：{mallCategories.find((category) => category.id === product.categoryId)?.name ?? product.categoryId}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>¥{product.price}</Badge>
                {product.tags.map((tag) => (
                  <Badge key={`${product.id}-${tag}`} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                编辑
              </Button>
              <Button variant="destructive" size="sm">
                删除
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
