"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { orderApi, ApiError } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type OrderItem = Awaited<ReturnType<typeof orderApi.getList>>['data'][number];

export default function AdminOrderPage(){
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  useEffect(()=>{
    let mounted = true;
    const fetch = async ()=>{
      setLoading(true);
      try{
        const res = await orderApi.getList();
        if (mounted) setOrders(res.data);
      }catch(err){ if (err instanceof ApiError) setError(err.message); else setError('获取订单失败') }
      finally{ if (mounted) setLoading(false) }
    };
    fetch();
    return ()=>{ mounted = false };
  },[]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">订单管理</h2>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>订单列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div>加载中...</div>}
          {error && <div className="text-red-500">{error}</div>}
          <div className="mt-4 grid gap-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">订单号: {order.id}</div>
                  <div className="text-sm text-muted-foreground">金额: {order.totalPrice}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm"><Link href={`/mall/admin/order/${order.id}`}>查看</Link></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
