import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "个人中心",
};

export default function MallProfilePage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">个人中心</h1>
          <p className="text-sm text-muted-foreground">页面骨架：后续接入 /user/info 并展示头像、用户名、是否管理员等。</p>
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
          <p>这里会放：用户信息、地址管理入口、订单入口、收藏入口。</p>
          <p>后续也会加入：上传头像（multipart/form-data）与修改个人信息。</p>
        </CardContent>
      </Card>
    </div>
  );
}
