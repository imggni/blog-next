'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { addressApi, ApiError } from '@/lib/api';
import { Address, AddressCreateRequest } from '@/types/api';
import { toast } from 'sonner';

export default function AddressManagementPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<AddressCreateRequest>({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detailAddress: '',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await addressApi.getList();
      setAddresses(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('获取地址列表失败');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await addressApi.create(form);
      toast.success('地址已添加');
      setForm({
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detailAddress: '',
        isDefault: false,
      });
      fetchAddresses();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '添加地址失败';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressApi.setDefault(id);
      toast.success('已设置为默认地址');
      fetchAddresses();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '设置默认地址失败';
      toast.error(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除该地址吗？')) {
      return;
    }

    try {
      await addressApi.delete(id);
      toast.success('地址已删除');
      fetchAddresses();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '删除地址失败';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">地址管理</h1>
          <p className="text-sm text-muted-foreground">管理您的收货地址，设置默认地址并快速删除不需要的条目。</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/mall/profile">返回个人中心</Link>
        </Button>
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-3xl border border-border/70 bg-card">
          <CardHeader>
            <CardTitle>新增地址</CardTitle>
            <CardDescription>填写收货地址，方便下单时快速选择。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">收货人</Label>
                  <Input id="name" name="name" value={form.name} onChange={handleInputChange} placeholder="输入姓名" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号</Label>
                  <Input id="phone" name="phone" value={form.phone} onChange={handleInputChange} placeholder="输入手机号" required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="province">省</Label>
                  <Input id="province" name="province" value={form.province} onChange={handleInputChange} placeholder="省" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">市</Label>
                  <Input id="city" name="city" value={form.city} onChange={handleInputChange} placeholder="市" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">区</Label>
                  <Input id="district" name="district" value={form.district} onChange={handleInputChange} placeholder="区" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="detailAddress">详细地址</Label>
                <Input id="detailAddress" name="detailAddress" value={form.detailAddress} onChange={handleInputChange} placeholder="街道、楼层等详细信息" required />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? '保存中...' : '保存地址'}
                </Button>
                <span className="text-sm text-muted-foreground">默认地址可在收货地址列表中快速设置。</span>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/70 bg-card">
          <CardHeader>
            <CardTitle>当前地址</CardTitle>
            <CardDescription>展示已有地址并支持设置默认、删除操作。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {loading ? (
                <div className="rounded-3xl border border-dashed border-border/50 bg-slate-950/70 p-6 text-center text-sm text-muted-foreground">加载中...</div>
              ) : addresses.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/50 bg-slate-950/70 p-6 text-center text-sm text-muted-foreground">
                  目前还没有地址，您可以先新增一个收货地址。
                </div>
              ) : (
                addresses.map((address) => (
                  <Card key={address.id} className="rounded-3xl border border-border/70 bg-background/80">
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{address.name}</h3>
                            {address.isDefault && <Badge>默认</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{address.phone}</p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{address.province} {address.city} {address.district}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{address.detailAddress}</p>
                      <Separator />
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleSetDefault(address.id)}>
                          设为默认
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(address.id)}>
                          删除
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
