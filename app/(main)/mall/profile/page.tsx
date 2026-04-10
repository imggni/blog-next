import type { Metadata } from "next";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mallUserMock } from "@/lib/mall-mock";

export const metadata: Metadata = {
  title: "个人中心",
};

export default function MallProfilePage() {
  const user = mallUserMock;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">个人中心</h1>
          <p className="text-sm text-muted-foreground">展示用户信息与常用功能入口（页面骨架）。</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/mall/address">地址管理</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/mall/order">我的订单</Link>
          </Button>
        </div>
      </header>

      <Card className="rounded-3xl border border-border/70 bg-card">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback>{user.username.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-2xl">{user.username}</CardTitle>
              <div className="text-sm text-muted-foreground">{user.phone}</div>
            </div>
          </div>
          <Badge variant={user.isAdmin ? "default" : "secondary"}>{user.isAdmin ? "管理员" : "普通用户"}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
              <div className="text-sm text-muted-foreground">创建时间</div>
              <div className="mt-1 font-medium text-foreground">{user.createdAt}</div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
              <div className="text-sm text-muted-foreground">收藏</div>
              <div className="mt-1 font-medium text-foreground">查看已收藏商品</div>
              <Button variant="ghost" size="sm" className="mt-3" asChild>
                <Link href="/mall/collection">前往收藏</Link>
              </Button>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
              <div className="text-sm text-muted-foreground">后台管理</div>
              <div className="mt-1 font-medium text-foreground">管理分类、商品、订单</div>
              <Button variant="ghost" size="sm" className="mt-3" asChild>
                <Link href="/mall/admin/product">进入后台</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
