'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { PagedPagination } from '@/components/ui/paged-pagination';
import { orderApi, ApiError } from '@/lib/api';
import { Order } from '@/types/api';
import { getPayStatusBadgeVariant, getPayStatusLabel, getPayTypeLabel, getOrderStatusLabel, getOrderStatusBadgeVariant } from '@/lib/mall/order-constants';

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
  let items: Order[] = [];
  let pagination: { page: number; pageSize: number; total: number; totalPages: number } | undefined;

  if (Array.isArray(payload)) {
    items = payload;
  } else {
    if (Array.isArray(payload.data)) {
      items = payload.data;
    }
    pagination = payload.pagination;
  }

  return { items, pagination };
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');

    try {
      const response = await orderApi.getList({ page, pageSize });
      const { items, pagination } = parseOrderListResponse(response);
      setOrders(items);
      setTotal(pagination?.total ?? items.length);
      setTotalPages(pagination?.totalPages ?? 1);
      setCurrentPage(pagination?.page ?? page);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('获取订单列表失败');
      }
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('确定要取消这个订单吗？')) return;

    try {
      await orderApi.cancel(orderId);
      // 重新获取订单列表
      fetchOrders(currentPage);
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.message);
      } else {
        alert('取消订单失败');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">我的订单</h1>
          <p className="text-sm text-muted-foreground">查看和管理您的订单</p>
        </div>
        {/* <Button variant="outline" size="sm" asChild>
          <Link href="/mall">返回商城首页</Link>
        </Button> */}
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {orders.length === 0 && !loading ? (
        <Card className="rounded-3xl border border-border/70 bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">暂无订单</p>
            <Button asChild>
              <Link href="/mall/product">去购物</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/70 bg-card px-5 py-4 text-sm text-muted-foreground">
            <div>
              共 <span className="font-medium text-foreground">{total}</span> 笔订单，第{" "}
              <span className="font-medium text-foreground">{currentPage}</span> /{" "}
              <span className="font-medium text-foreground">{totalPages}</span> 页
            </div>
            <div>每页 {pageSize} 条</div>
          </div>

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

                  <div className="grid gap-2 rounded-2xl bg-muted/30 p-4 text-sm">
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
                  </div>
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
                      <Link href={`/mall/order/${order.id}`}>查看详情</Link>
                    </Button>
                    {isCancelable ? (
                      <Button variant="destructive" size="sm" onClick={() => handleCancelOrder(order.id)}>
                        取消订单
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {totalPages >= 1 ? (
            <PagedPagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchOrders} />
          ) : null}
        </div>
      )}
    </div>
  );
}
