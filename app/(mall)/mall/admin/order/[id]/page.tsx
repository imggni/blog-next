"use client";

import { use as usePromise, useCallback, useEffect, useMemo, useState } from 'react';
import { orderApi, ApiError } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Order } from '@/types/api';
import { getOrderStatusBadgeVariant, getOrderStatusLabel, getPayStatusBadgeVariant, getPayStatusLabel, getPayTypeLabel } from '@/lib/mall/order-constants';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }){
  const { id } = usePromise(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderApi.getDetail(String(id));
      setOrder(res.data as unknown as Order);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('获取订单失败');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const itemsTotal = useMemo(() => order?.orderGoods?.reduce((sum, item) => sum + Number(item.subtotal ?? 0), 0) ?? 0, [order]);
  const createdAt = useMemo(() => (order?.createdAt ? new Date(order.createdAt).toLocaleString() : '-'), [order]);
  const payTime = useMemo(() => (order?.payTime ? new Date(order.payTime).toLocaleString() : '-'), [order]);
  const shipTime = useMemo(() => (order?.shipTime ? new Date(order.shipTime).toLocaleString() : '-'), [order]);
  const confirmTime = useMemo(() => (order?.confirmTime ? new Date(order.confirmTime).toLocaleString() : '-'), [order]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">订单详情</h2>
          <p className="text-sm text-muted-foreground">查看订单信息、收货地址与商品清单。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/mall/admin/order">返回订单列表</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={fetchOrder} disabled={loading}>
            刷新
          </Button>
        </div>
      </header>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <Card className="rounded-3xl border border-border/70 bg-card">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">加载中...</CardContent>
        </Card>
      ) : null}

      {!loading && !order ? (
        <Card className="rounded-3xl border border-border/70 bg-card">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">订单不存在</CardContent>
        </Card>
      ) : null}

      {!loading && order ? (
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <Card className="rounded-3xl border border-border/70 bg-card">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-base">订单号：{order.id}</CardTitle>
                  <CardDescription>下单时间：{createdAt}</CardDescription>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Badge variant={getPayStatusBadgeVariant(order.payStatus)}>{getPayStatusLabel(order.payStatus)}</Badge>
                  <Badge variant={getOrderStatusBadgeVariant(order.orderStatus)}>{getOrderStatusLabel(order.orderStatus)}</Badge>
                  <Badge variant="outline">{getPayTypeLabel(order.payType)}</Badge>
                </div>
              </div>
              <div className="grid gap-3 rounded-2xl bg-muted/30 p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-muted-foreground">订单总计</div>
                  <div className="text-lg font-semibold text-foreground">¥{order.totalPrice}</div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-muted-foreground">
                  <div>商品金额：¥{order.goodsPrice}</div>
                  <div>运费：¥{order.freight}</div>
                  <div>优惠：¥{order.discount}</div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-muted-foreground">
                  <div>支付时间：{payTime}</div>
                  <div>发货时间：{shipTime}</div>
                  <div>确认时间：{confirmTime}</div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-muted-foreground">
                  <div>物流单号：{order.logisticsNo ?? '-'}</div>
                  <div>清单小计：¥{itemsTotal}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">收货地址</div>
                <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-foreground">{order.address.name}</span>{" "}
                      <span>{order.address.phone}</span>
                    </div>
                    <Badge variant={order.address.isDefault ? "default" : "secondary"}>
                      {order.address.isDefault ? "默认地址" : "地址"}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    {order.address.province} {order.address.city} {order.address.district} {order.address.detailAddress}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-sm font-medium">商品清单</div>
                <div className="grid gap-3">
                  {order.orderGoods.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/60 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-muted">
                        <Image src={item.productImage} alt={item.productTitle} fill sizes="56px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="truncate text-sm font-medium text-foreground">{item.productTitle}</div>
                        {item.specs ? <div className="truncate text-xs text-muted-foreground">规格：{item.specs}</div> : null}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-4 text-sm sm:flex-col sm:items-end sm:gap-1">
                        <div className="font-medium">¥{item.price} × {item.quantity}</div>
                        <div className="text-xs text-muted-foreground">小计：¥{item.subtotal}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-border/70 bg-card">
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
              <CardDescription>进入前台查看详情或返回列表。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild>
                <Link href={`/mall/order/${order.id}`}>前台查看订单</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/mall/admin/order">返回订单列表</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
