"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { orderApi, ApiError } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import type { Order } from '@/types/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PagedPagination } from '@/components/ui/paged-pagination';
import { getPayStatusBadgeVariant, getPayStatusLabel, getPayTypeLabel, getOrderStatusBadgeVariant, getOrderStatusLabel } from '@/lib/mall/order-constants';

type OrderListPayload =
  | Order[]
  | {
      data?: Order[];
      pagination?: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
    };

type OrderListApiResponse = {
  data: OrderListPayload;
};

function parseOrderListResponse(response: OrderListApiResponse) {
  const payload = response.data;
  const items = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
  const pagination = !Array.isArray(payload) ? payload?.pagination : undefined;

  return { items, pagination };
}

export default function AdminOrderPage(){
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderApi.getList({ page, pageSize });
      const { items, pagination } = parseOrderListResponse(res as unknown as OrderListApiResponse);
      setOrders(items);
      setTotal(pagination?.total ?? items.length);
      setTotalPages(pagination?.totalPages ?? 1);
      setCurrentPage(pagination?.page ?? page);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('获取订单失败');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">订单管理</h2>
          <p className="text-sm text-muted-foreground">查看订单状态与详情，支持分页浏览。</p>
        </div>
        {/* <Button variant="outline" size="sm" asChild>
          <Link href="/mall/admin">返回后台首页</Link>
        </Button> */}
      </header>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="rounded-3xl border border-border/70 bg-card">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>订单列表</CardTitle>
              <CardDescription>共 {total} 笔订单，第 {currentPage} / {totalPages} 页</CardDescription>
            </div>
            <Badge variant="outline">每页 {pageSize} 条</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              加载中...
            </div>
          ) : null}

          {!loading && orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              暂无订单
            </div>
          ) : null}

          <div className="grid gap-3">
            {orders.map((order) => {
              const isCancelable = order.payStatus === 'pending' || order.payStatus === 'unpaid';
              const items = order.orderGoods.slice(0, 2);
              const moreCount = Math.max(0, order.orderGoods.length - items.length);

              return (
                <Card key={order.id} className="rounded-3xl border border-border/70 bg-card">
                  <CardHeader className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-base">订单号：{order.id}</CardTitle>
                        <CardDescription>下单时间：{new Date(order.createdAt).toLocaleString()}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPayStatusBadgeVariant(order.payStatus)}>{getPayStatusLabel(order.payStatus)}</Badge>
                        <Badge variant={getOrderStatusBadgeVariant(order.orderStatus)}>{getOrderStatusLabel(order.orderStatus)}</Badge>
                        <Badge variant="outline">{getPayTypeLabel(order.payType)}</Badge>
                      </div>
                    </div>

                    {/* <div className="grid gap-2 rounded-2xl bg-muted/30 p-4 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-muted-foreground">
                          收货人：<span className="text-foreground">{order.address.name}</span>{" "}
                          <span className="ml-2">{order.address.phone}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-muted-foreground">总计</span>{" "}
                          <span className="text-lg font-semibold text-foreground">¥{order.totalPrice}</span>
                        </div>
                      </div>
                      <div className="text-muted-foreground">
                        地址：{order.address.province} {order.address.city} {order.address.district} {order.address.detailAddress}
                      </div>
                    </div> */}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-border/70 bg-background/60 p-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-muted">
                            <Image
                              src={item.productImage}
                              alt={item.productTitle}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{item.productTitle}</div>
                            {item.specs ? <div className="truncate text-xs text-muted-foreground">规格：{item.specs}</div> : null}
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium">¥{item.price} × {item.quantity}</div>
                            <div className="text-xs text-muted-foreground">小计：¥{item.subtotal}</div>
                          </div>
                        </div>
                      ))}
                      {moreCount > 0 ? (
                        <div className="text-xs text-muted-foreground">还有 {moreCount} 件商品，进入详情查看</div>
                      ) : null}
                    </div>

                    <Separator />

                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/mall/admin/order/${order.id}`}>查看详情</Link>
                      </Button>
                      {isCancelable ? (
                        <Button variant="destructive" size="sm">
                          取消（后台暂不开放）
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center">
            <PagedPagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchOrders} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
