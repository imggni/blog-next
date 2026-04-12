"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { orderApi, ApiError } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminOrderPage(){
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  useEffect(()=>{
    let mounted = true;
    const fetch = async ()=>{
      setLoading(true);
      try{
        const res = await orderApi.getList();
        const data = (res as any)?.data ?? res;
        if (Array.isArray(data) && mounted) setOrders(data);
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
            {orders.map(o=> (
              <div key={o.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">订单号: {o.orderNo}</div>
                  <div className="text-sm text-muted-foreground">金额: {o.amount}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm"><Link href={`/mall/admin/order/${o.id}`}>查看</Link></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
