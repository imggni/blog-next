import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "后台管理",
};

const modules = [
  {
    title: "分类管理",
    description: "管理商品分类，创建、编辑、删除分类，并查看当前分类列表。",
    href: "/mall/admin/category",
    badge: "Category",
  },
  {
    title: "商品管理",
    description: "管理商城商品信息，支持新增商品、编辑商品与快速查看。",
    href: "/mall/admin/product",
    badge: "Product",
  },
  {
    title: "订单管理",
    description: "查看和跟进用户订单状态，快速进入订单详情页面。",
    href: "/mall/admin/order",
    badge: "Order",
  },
];

export default function MallAdminPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">后台管理</h1>
            <Badge variant="secondary">管理员入口</Badge>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            当前页面已完成 shadcn 风格的后台管理入口展示，后续可直接接入分类、商品、订单管理接口，并补充 isAdmin 权限校验。
          </p>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href="/mall">返回商城首页</Link>
        </Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.title} className="rounded-2xl border border-border/70 bg-card">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </div>
                <Badge variant="outline">{module.badge}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">直接进入该模块，查看当前管理入口和现有功能。</p>
            </CardContent>
            <CardFooter className="justify-end">
              <Button size="sm" asChild>
                <Link href={module.href}>进入</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border border-border/70 bg-card">
        <CardHeader>
          <CardTitle>页面说明</CardTitle>
          <CardDescription>已将后台主页从占位页替换为模块化管理仪表盘。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>本页面已完成 shadcn UI 的规范化展示，包括卡片入口、按钮、徽章和文字排版。</p>
          <p>后续可继续完善：</p>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>补充 isAdmin 权限校验，确保仅管理员可访问。</li>
            <li>接入后端管理接口，完成分类/商品/订单真实数据交互。</li>
            <li>根据业务需求增加搜索、筛选和分页功能。</li>
          </ul>
        </CardContent>
        <CardFooter className="justify-between gap-3">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/mall/admin/category">前往分类管理</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/mall/admin/product">前往商品管理</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
