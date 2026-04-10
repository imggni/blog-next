import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "后台管理",
};

const adminEntries = [
  {
    title: "分类管理",
    description: "创建、修改、删除分类（管理员）。",
    href: "/mall/admin/category",
  },
  {
    title: "商品管理",
    description: "创建、修改、删除商品（管理员）。",
    href: "/mall/admin/product",
  },
  {
    title: "订单管理",
    description: "修改订单状态、物流单号（管理员）。",
    href: "/mall/admin/order",
  },
];

export default function MallAdminHomePage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">后台管理</h1>
          <p className="text-sm text-muted-foreground">管理员可管理分类、商品、订单（页面骨架）。</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/mall">返回商城</Link>
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {adminEntries.map((entry) => (
          <Card key={entry.href} className="rounded-2xl border border-border/70 bg-card">
            <CardHeader>
              <CardTitle>{entry.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{entry.description}</p>
              <Button size="sm" asChild>
                <Link href={entry.href}>进入</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
