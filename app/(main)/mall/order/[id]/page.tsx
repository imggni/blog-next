import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { findMallOrderById } from "@/lib/mall-mock";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const order = findMallOrderById(id);

  if (!order) {
    return { title: "订单不存在" };
  }

  return {
    title: `订单 ${order.orderNo}`,
  };
}

export default async function MallOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = findMallOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">订单详情</h1>
          <div className="text-sm text-muted-foreground">订单号：{order.orderNo}</div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/mall/order">返回订单列表</Link>
        </Button>
      </header>

      <Card className="rounded-2xl border border-border/70 bg-card">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <CardTitle>状态信息</CardTitle>
          <div className="flex items-center gap-2">
            <Badge>{order.orderStatus}</Badge>
            <Badge variant="outline">{order.payStatus}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-muted-foreground">创建时间</div>
            <div className="font-medium text-foreground">{order.createdAt}</div>
          </div>
          {order.logisticsNo ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-muted-foreground">物流单号</div>
              <div className="font-medium text-foreground">{order.logisticsNo}</div>
            </div>
          ) : null}
          <Separator />
          <div className="space-y-2">
            <div className="font-medium text-foreground">收货地址</div>
            <div className="text-muted-foreground">
              {order.address.receiverName} {order.address.phone}
            </div>
            <div className="text-muted-foreground">
              {order.address.province}
              {order.address.city}
              {order.address.district}
              {order.address.detail}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border/70 bg-card">
        <CardHeader>
          <CardTitle>商品清单</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((item) => (
            <div key={`${order.id}-${item.productId}`} className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground">
                  数量 {item.quantity}
                  {item.specs ? ` · 规格 ${item.specs}` : ""}
                </div>
              </div>
              <div className="font-semibold text-primary">¥{item.price}</div>
            </div>
          ))}
          <Separator />
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">合计</div>
            <div className="text-lg font-semibold text-primary">¥{order.amount}</div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline">取消订单</Button>
        <Button variant="secondary">模拟支付</Button>
      </div>
    </div>
  );
}
