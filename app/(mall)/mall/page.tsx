import type { Metadata } from "next";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "商城",
};

const entryLinks = [
  { href: "/mall/product", title: "商品", description: "浏览商品列表与详情" },
  { href: "/mall/order", title: "订单", description: "查看订单列表与订单详情" },
  { href: "/mall/profile", title: "个人中心", description: "个人信息、地址与收藏入口" },
  { href: "/mall/admin", title: "后台", description: "管理员入口：分类/商品/订单管理" },
];

export default function MallHomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border/70 bg-card px-6 py-10">
        <h1 className="text-4xl font-semibold tracking-tight">数字配件商城</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          当前仅搭建路由与页面骨架：进入 /mall 后顶部导航切换为商城导航；其他页面仍使用博客导航。
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href="/mall/product">开始逛逛</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">返回博客首页</Link>
          </Button>
        </div>
      </section>

      <Alert>
        <AlertTitle>说明</AlertTitle>
        <AlertDescription>这里先不做接口对接，后续会基于 laj-api-shop 的 OpenAPI 生成 API 与类型。</AlertDescription>
      </Alert>

      <section className="grid gap-4 md:grid-cols-2">
        {entryLinks.map((entry) => (
          <Card key={entry.href} className="rounded-2xl border border-border/70 bg-card">
            <CardHeader>
              <CardTitle>{entry.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
