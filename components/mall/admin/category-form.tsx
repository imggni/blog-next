"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { categoryApi, ApiError } from '@/lib/api';

type CategoryFormInitial = Awaited<ReturnType<typeof categoryApi.getList>>['data'][number];

export function CategoryForm({ initial, onSaved }:{ initial?: CategoryFormInitial; onSaved?: () => void }){
  const [form, setForm] = useState({ name: initial?.name ?? '', icon: initial?.icon ?? '', sort: initial?.sort ?? 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (initial?.id) {
        await categoryApi.update(Number(initial.id), { name: form.name, icon: form.icon, sort: Number(form.sort) });
      } else {
        await categoryApi.create({ name: form.name, icon: form.icon, sort: Number(form.sort) });
      }
      onSaved?.();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      <div>
        <label className="block text-sm font-medium">名称</label>
        <Input name="name" value={form.name} onChange={handleChange} />
      </div>
      <div>
        <label className="block text-sm font-medium">图标</label>
        <Input name="icon" value={form.icon} onChange={handleChange} />
      </div>
      <div>
        <label className="block text-sm font-medium">排序</label>
        <Input name="sort" value={String(form.sort)} onChange={handleChange} />
      </div>
      <Button type="submit" disabled={loading}>{initial?.id ? '保存' : '创建'}</Button>
    </form>
  );
}
