import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mallOrders } from "@/lib/mall-mock";

export const metadata: Metadata = {
  title: "订单列表",
};

function getStatusBadgeVariant(status: string) {
  if (status === "已取消") return "destructive";
  if (status === "已完成") return "secondary";
  return "default";
}

export default function MallOrderListPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">订单列表</h1>
          <p className="text-sm text-muted-foreground">展示订单号、金额、状态与时间（页面骨架）。</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/mall/product">继续购物</Link>
        </Button>
      </header>

      <section className="grid gap-4">
        {mallOrders.map((order) => (
          <Card key={order.id} className="rounded-2xl border border-border/70 bg-card">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg">订单号：{order.orderNo}</CardTitle>
                <div className="text-sm text-muted-foreground">{order.createdAt}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(order.orderStatus)}>{order.orderStatus}</Badge>
                <Badge variant="outline">{order.payStatus}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                共 {order.items.reduce((sum, item) => sum + item.quantity, 0)} 件商品
              </div>
              <div className="flex items-center gap-3">
                <div className="text-base font-semibold text-primary">¥{order.amount}</div>
                <Button size="sm" asChild>
                  <Link href={`/mall/order/${order.id}`}>查看详情</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
