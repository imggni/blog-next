'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      setLoading(true);
      setError('');

      try {
        const response = await orderApi.getDetail(id);
        setOrder(response.data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('获取订单详情失败');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order || !confirm('确定要取消这个订单吗？')) return;

    try {
      await orderApi.cancel(order.id);
      // 重新获取订单详情
      const response = await orderApi.getDetail(order.id);
      setOrder(response.data);
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

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>{error || '订单不存在'}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/mall/order">返回订单列表</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">订单详情</h1>
          <p className="text-sm text-muted-foreground">订单号: {order.id}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/mall/order">返回订单列表</Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 订单信息 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>订单信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">订单状态</label>
                  <div className="mt-1">
                    <Badge variant={getStatusBadgeVariant(order.payStatus)}>
                      {getStatusText(order.payStatus)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">支付状态</label>
                  <div className="mt-1">
                    <Badge variant={getStatusBadgeVariant(order.payStatus)}>
                      {getStatusText(order.payStatus)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">订单状态</label>
                  <div className="mt-1">
                    <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
                      {getStatusText(order.orderStatus)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">支付方式</label>
                  <p className="mt-1">{order.payType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">下单时间</label>
                  <p className="mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                {order.payTime && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">支付时间</label>
                    <p className="mt-1">{new Date(order.payTime).toLocaleString()}</p>
                  </div>
                )}
                {order.shipTime && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">发货时间</label>
                    <p className="mt-1">{new Date(order.shipTime).toLocaleString()}</p>
                  </div>
                )}
                {order.confirmTime && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">确认收货时间</label>
                    <p className="mt-1">{new Date(order.confirmTime).toLocaleString()}</p>
                  </div>
                )}
                {order.logisticsNo && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">物流单号</label>
                    <p className="mt-1">{order.logisticsNo}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 商品清单 */}
          <Card>
            <CardHeader>
              <CardTitle>商品清单</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderGoods.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0">
                      {/* 这里可以添加商品图片 */}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productTitle}</h4>
                      {item.specs && (
                        <p className="text-sm text-gray-600">规格: {item.specs}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">¥{item.price}</p>
                      <p className="text-sm text-gray-600">数量: {item.quantity}</p>
                      <p className="text-sm font-medium">小计: ¥{item.subtotal}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 收货地址和金额 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>收货地址</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{order.address.name}</p>
                <p className="text-sm text-gray-600">{order.address.phone}</p>
                <p className="text-sm text-gray-600">
                  {order.address.province} {order.address.city} {order.address.district}
                </p>
                <p className="text-sm text-gray-600">{order.address.detailAddress}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>订单金额</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>商品金额</span>
                <span>¥{order.goodsPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>运费</span>
                <span>¥{order.freight}</span>
              </div>
              <div className="flex justify-between">
                <span>优惠</span>
                <span>-¥{order.discount}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>总计</span>
                <span>¥{order.totalPrice}</span>
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="space-y-2">
            {order.payStatus === 'pending' && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleCancelOrder}
              >
                取消订单
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}