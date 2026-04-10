import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mallCategories } from "@/lib/mall-mock";

export const metadata: Metadata = {
  title: "分类管理",
};

export default function MallAdminCategoryPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">分类管理</h1>
          <p className="text-sm text-muted-foreground">管理员创建/编辑/删除分类（页面骨架）。</p>
        </div>
        <Button>新增分类</Button>
      </header>

      <Card className="rounded-2xl border border-border/70 bg-card p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">名称</Label>
            <Input id="name" placeholder="如：耳机" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">图标</Label>
            <Input id="icon" placeholder="如：🎧" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort">排序</Label>
            <Input id="sort" placeholder="如：1" inputMode="numeric" />
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
        {mallCategories
          .slice()
          .sort((a, b) => a.sort - b.sort)
          .map((category) => (
            <Card key={category.id} className="rounded-2xl border border-border/70 bg-card">
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
                <CardTitle className="text-lg">
                  <span aria-hidden="true" className="mr-2">
                    {category.icon ?? "🏷️"}
                  </span>
                  {category.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">sort {category.sort}</Badge>
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
