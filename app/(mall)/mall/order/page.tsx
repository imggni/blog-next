'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { orderApi, ApiError } from '@/lib/api';
import { Order } from '@/types/api';

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'paid':
      return 'default';
    case 'shipped':
      return 'outline';
    case 'delivered':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '待支付';
    case 'paid':
      return '已支付';
    case 'shipped':
      return '已发货';
    case 'delivered':
      return '已收货';
    case 'cancelled':
      return '已取消';
    default:
      return status;
  }
};

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await orderApi.getList();
      setOrders(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('获取订单列表失败');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('确定要取消这个订单吗？')) return;

    try {
      await orderApi.cancel(orderId);
      // 重新获取订单列表
      fetchOrders();
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
        <Button variant="outline" size="sm" asChild>
          <Link href="/mall">返回商城首页</Link>
        </Button>
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {orders.length === 0 && !loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">暂无订单</p>
            <Button asChild>
              <Link href="/mall/product">去购物</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">订单号: {order.id}</CardTitle>
                    <CardDescription>
                      下单时间: {new Date(order.createdAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(order.payStatus)}>
                    {getStatusText(order.payStatus)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 收货地址 */}
                <div>
                  <h4 className="font-semibold mb-2">收货地址</h4>
                  <p className="text-sm text-gray-600">
                    {order.address.name} {order.address.phone}<br />
                    {order.address.province} {order.address.city} {order.address.district}<br />
                    {order.address.detailAddress}
                  </p>
                </div>

                <Separator />

                {/* 商品列表 */}
                <div>
                  <h4 className="font-semibold mb-2">商品清单</h4>
                  <div className="space-y-2">
                    {order.orderGoods.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                        <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0">
                          {/* 这里可以添加商品图片 */}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.productTitle}</p>
                          {item.specs && (
                            <p className="text-sm text-gray-600">规格: {item.specs}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">¥{item.price} × {item.quantity}</p>
                          <p className="text-sm text-gray-600">小计: ¥{item.subtotal}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* 订单金额 */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>商品金额: ¥{order.goodsPrice}</p>
                    <p>运费: ¥{order.freight}</p>
                    <p>优惠: ¥{order.discount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">总计: ¥{order.totalPrice}</p>
                    <p className="text-sm text-gray-600">支付方式: {order.payType}</p>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/mall/order/${order.id}`}>查看详情</Link>
                  </Button>
                  {order.payStatus === 'pending' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      取消订单
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
