"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { productApi, ApiError } from '@/lib/api';

export function ProductForm({ initial, onSaved }: { initial?: any; onSaved?: ()=>void }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    price: initial?.price ?? '',
    categoryId: initial?.categoryId ?? '',
    mainImage: initial?.mainImage ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try{
      if (initial?.id) {
        await productApi.update(Number(initial.id), {
          title: form.title,
          categoryId: Number(form.categoryId),
          price: Number(form.price),
          mainImage: form.mainImage,
        });
      } else {
        await productApi.create({
          title: form.title,
          categoryId: Number(form.categoryId),
          price: Number(form.price),
          mainImage: form.mainImage,
        });
      }
      onSaved?.();
    }catch(err){
      if (err instanceof ApiError) setError(err.message);
      else setError('提交失败');
    }finally{ setLoading(false) }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      <div>
        <label className="block text-sm font-medium">标题</label>
        <Input name="title" value={form.title} onChange={handleChange} />
      </div>
      <div>
        <label className="block text-sm font-medium">价格</label>
        <Input name="price" value={String(form.price)} onChange={handleChange} />
      </div>
      <div>
        <label className="block text-sm font-medium">分类 ID</label>
        <Input name="categoryId" value={String(form.categoryId)} onChange={handleChange} />
      </div>
      <div>
        <label className="block text-sm font-medium">主图路径</label>
        <Input name="mainImage" value={form.mainImage} onChange={handleChange} />
      </div>
      <Button type="submit" disabled={loading}>{initial?.id ? '保存' : '创建'}</Button>
    </form>
  );
}
