import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mallOrders } from "@/lib/mall-mock";

export const metadata: Metadata = {
  title: "订单管理",
};

export default function MallAdminOrderPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">订单管理</h1>
          <p className="text-sm text-muted-foreground">管理员修改订单状态、物流单号（页面骨架）。</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/mall/order">查看用户端订单</Link>
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
                <Badge>{order.orderStatus}</Badge>
                <Badge variant="outline">{order.payStatus}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor={`${order.id}-orderStatus`}>订单状态</Label>
                <Input id={`${order.id}-orderStatus`} defaultValue={order.orderStatus} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${order.id}-payStatus`}>支付状态</Label>
                <Input id={`${order.id}-payStatus`} defaultValue={order.payStatus} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${order.id}-logisticsNo`}>物流单号</Label>
                <Input id={`${order.id}-logisticsNo`} defaultValue={order.logisticsNo ?? ""} placeholder="如：SF123..." />
              </div>
              <div className="md:col-span-3 flex flex-wrap gap-2">
                <Button size="sm">保存修改</Button>
                <Button variant="outline" size="sm">
                  重置
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
