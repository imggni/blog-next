import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "后台管理",
};

export default function MallAdminPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">后台管理</h1>
          <p className="text-sm text-muted-foreground">页面骨架：后续按 isAdmin 做权限控制，并接入分类/商品/订单管理接口。</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/mall">返回商城首页</Link>
        </Button>
      </header>

      <Card className="rounded-2xl border border-border/70 bg-card">
        <CardHeader>
          <CardTitle>占位内容</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>这里将包含：分类管理、商品管理、订单管理三个模块。</p>
          <p>后续建议：用服务端 Route Handler 代理 laj-api-shop，并在此处接入管理端接口。</p>
        </CardContent>
      </Card>
    </div>
  );
}
