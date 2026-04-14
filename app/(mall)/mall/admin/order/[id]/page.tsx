"use client";

import { useEffect, useState } from 'react';
import { orderApi, ApiError } from '@/lib/api';

type OrderDetail = Awaited<ReturnType<typeof orderApi.getDetail>>['data'];

export default function OrderDetailPage({ params }: { params: { id: string } }){
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(()=>{
    let mounted = true;
    const fetch = async ()=>{
      try{
        const res = await orderApi.getDetail(String(params.id));
        if (mounted) setOrder(res.data);
      }catch(err){ if (err instanceof ApiError) setError(err.message); else setError('获取订单失败') }
      finally{ if (mounted) setLoading(false) }
    };
    fetch();
    return ()=>{ mounted = false }
  },[params.id]);

  if (loading) return <div>加载中...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!order) return <div>订单不存在</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">订单详情</h2>
      <div>订单号: {order.id}</div>
      <div>金额: {order.totalPrice}</div>
      <div>状态: {order.orderStatus}</div>
      <div className="mt-4">
        <h3 className="font-medium">收货地址</h3>
        <div>{order.address?.name} {order.address?.phone}</div>
        <div>{order.address?.province} {order.address?.city} {order.address?.district} {order.address?.detailAddress}</div>
      </div>
    </div>
  );
}
